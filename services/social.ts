import type { PostgrestError } from "@supabase/supabase-js";

import { ApiError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

import {
  statsSchema,
  toFeedItemDto,
  toMemberDto,
  toMemberProfileDto,
  toMemberResultDto,
  toWatchedFilmDto,
  type MemberDto,
} from "./dto";

// No user id parameters: the social functions (0008_social.sql, 0009_feed.sql) act as auth.uid(), the
// session's member.

export async function searchMembers(q: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("search_members", { q }).throwOnError();
  return data.map(toMemberResultDto);
}

export async function listFollowing() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("list_following").throwOnError();
  return data.map(toMemberDto);
}

// follow_member() and unfollow_member() raise no_data_found (P0002) for an unknown handle, and
// follow_member() raises invalid_parameter_value (22023) for the caller's own; anything else is a 500.
export function followError(error: PostgrestError) {
  if (error.code === "P0002") {
    return new ApiError(404, "member_not_found", "No member has that handle");
  }
  if (error.code === "22023") {
    return new ApiError(400, "cannot_follow_self", "You can't follow yourself");
  }
  return error;
}

export async function follow(handle: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("follow_member", {
    target_handle: handle,
  });
  if (error) throw followError(error);
}

export async function unfollow(handle: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("unfollow_member", {
    target_handle: handle,
  });
  if (error) throw followError(error);
}

// feed() returns one row more than a page (0011_feed_lookahead.sql): that row only says an older
// page exists, and the page's last row is the cursor for it.
const FEED_PAGE = 30;

export async function getFeed(before?: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("feed", { before }).throwOnError();
  const page = data.slice(0, FEED_PAGE);
  return {
    items: page.map(toFeedItemDto),
    nextCursor:
      data.length > FEED_PAGE ? (page.at(-1)?.watched_at ?? null) : null,
  };
}

// null for an unknown handle. watched and stats stay empty unless the caller follows the member
// or is them: the functions gate themselves, so all three run at once.
export async function getMember(handle: string) {
  const supabase = await createClient();
  const [profile, watched, stats] = await Promise.all([
    supabase.rpc("member_profile", { target_handle: handle }).single(),
    supabase.rpc("member_watched", { target_handle: handle }).throwOnError(),
    supabase.rpc("member_stats", { target_handle: handle }).throwOnError(),
  ]);
  if (profile.error?.code === "P0002") return null;
  if (profile.error) throw profile.error;
  return {
    ...toMemberProfileDto(profile.data),
    watched: watched.data.map(toWatchedFilmDto),
    stats: statsSchema.nullable().parse(stats.data),
  };
}

// The people the caller follows who watched each film, keyed by tmdbId; films nobody watched are absent.
export async function friendsWhoWatched(tmdbIds: number[]) {
  if (tmdbIds.length === 0) return new Map<number, MemberDto[]>();
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("friends_who_watched", { tmdb_ids: tmdbIds })
    .throwOnError();
  const byFilm = Map.groupBy(data, (row) => row.tmdb_id);
  return new Map(
    [...byFilm].map(([tmdbId, rows]) => [tmdbId, rows.map(toMemberDto)]),
  );
}
