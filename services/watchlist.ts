import { ApiError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { getMovie, searchMovies } from "@/lib/tmdb";

import {
  ENTRY_COLUMNS,
  type MovieSummary,
  toEntryDto,
  toWatchlistItemDto,
} from "./dto";
import { cacheMovie } from "./movies";
import { friendsWhoWatched } from "./social";
import type { EntryUpdate } from "./watchlist.schema";

export async function addEntry(userId: string, tmdbId: number) {
  await cacheMovie(tmdbId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("watchlist_entries")
    .insert({ user_id: userId, tmdb_id: tmdbId })
    .select(ENTRY_COLUMNS)
    .single();
  if (error?.code === "23505") {
    throw new ApiError(
      409,
      "already_listed",
      "That film is already on your watchlist",
    );
  }
  if (error) throw error;
  return toEntryDto(data);
}

// The track_watched_at trigger derives watched_at and clears the rating on a move back.
export async function updateEntry(
  userId: string,
  tmdbId: number,
  update: EntryUpdate,
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist_entries")
    .update(update)
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .select(ENTRY_COLUMNS)
    .maybeSingle()
    .throwOnError();
  if (!data) {
    throw new ApiError(404, "not_listed", "That film isn't on your watchlist");
  }
  return toEntryDto(data);
}

export async function removeEntry(userId: string, tmdbId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist_entries")
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .select("tmdb_id")
    .maybeSingle()
    .throwOnError();
  if (!data) {
    throw new ApiError(404, "not_listed", "That film isn't on your watchlist");
  }
}

// Newest first on both tabs: watched films by watched_at, the rest by added_at. Each film carries
// the people the member follows who watched it.
export async function listEntries(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist_entries")
    .select(
      "status, rating, movie:movies (tmdb_id, title, release_year, poster_path)",
    )
    .eq("user_id", userId)
    .order("watched_at", { ascending: false, nullsFirst: false })
    .order("added_at", { ascending: false })
    .throwOnError();
  const friends = await friendsWhoWatched(data.map((row) => row.movie.tmdb_id));
  return data.map((row) => ({
    ...toWatchlistItemDto(row),
    friends: friends.get(row.movie.tmdb_id) ?? [],
  }));
}

// TMDB's details with the member's entry and the people they follow who watched it, or null when
// TMDB has no such film.
export async function getMovieWithEntry(userId: string, tmdbId: number) {
  const supabase = await createClient();
  const [movie, { data }, friends] = await Promise.all([
    getMovie(tmdbId),
    supabase
      .from("watchlist_entries")
      .select(ENTRY_COLUMNS)
      .eq("user_id", userId)
      .eq("tmdb_id", tmdbId)
      .maybeSingle()
      .throwOnError(),
    friendsWhoWatched([tmdbId]),
  ]);
  return (
    movie && {
      ...movie,
      entry: data && toEntryDto(data),
      friends: friends.get(tmdbId) ?? [],
    }
  );
}

// TMDB films paired with the member's entry, or null, so each can offer Add or show its status,
// and with the people they follow who watched it.
async function withEntries(userId: string, movies: MovieSummary[]) {
  if (movies.length === 0) return [];
  const tmdbIds = movies.map((movie) => movie.tmdbId);
  const supabase = await createClient();
  const [{ data }, friends] = await Promise.all([
    supabase
      .from("watchlist_entries")
      .select(ENTRY_COLUMNS)
      .eq("user_id", userId)
      .in("tmdb_id", tmdbIds)
      .throwOnError(),
    friendsWhoWatched(tmdbIds),
  ]);
  const entries = new Map(
    data.map((entry) => [entry.tmdb_id, toEntryDto(entry)]),
  );
  return movies.map((movie) => ({
    ...movie,
    entry: entries.get(movie.tmdbId) ?? null,
    friends: friends.get(movie.tmdbId) ?? [],
  }));
}

export async function searchWithEntries(userId: string, q: string) {
  return withEntries(userId, await searchMovies(q));
}
