import { ApiError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

import { toMemberDto } from "./dto";
import type { ProfileUpdate } from "./profiles.schema";

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("handle, display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle()
    .throwOnError();
  return data && toMemberDto(data);
}

// Follows key on the profile id, so a new handle keeps every edge. Other members' rows are hidden
// by RLS, so a taken handle only shows up as the unique violation.
export async function updateProfile(userId: string, update: ProfileUpdate) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ handle: update.handle, display_name: update.displayName })
    .eq("id", userId)
    .select("handle, display_name, avatar_url")
    .single();
  if (error?.code === "23505") {
    throw new ApiError(409, "handle_taken", "That handle is taken");
  }
  if (error) throw error;
  return toMemberDto(data);
}
