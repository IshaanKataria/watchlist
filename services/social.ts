import type { PostgrestError } from "@supabase/supabase-js";

import { ApiError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

import { toMemberDto, toMemberResultDto } from "./dto";

// No user id parameters: the social functions (0008_social.sql) act as auth.uid(), the session's member.

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

// follow_member() and unfollow_member() raise no_data_found (P0002) for an unknown handle and
// invalid_parameter_value (22023) for the caller's own; anything else stays a 500.
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
