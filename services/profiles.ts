import { z } from "zod";

import { ApiError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

import { toMemberDto } from "./dto";

// Mirrors public.reserved_handles(); the profiles check constraint is the backstop.
const RESERVED_HANDLES = new Set([
  "admin",
  "api",
  "auth",
  "me",
  "settings",
  "login",
  "signup",
  "u",
  "feed",
  "search",
  "stats",
  "taste",
  "watchlist",
  "movie",
  "movies",
  "members",
  "health",
  "about",
]);

export const handleSchema = z
  .string()
  .regex(
    /^[a-z0-9_]{3,20}$/,
    "Use 3–20 lowercase letters, numbers or underscores",
  )
  .refine((handle) => !RESERVED_HANDLES.has(handle), "That handle is reserved");

export const updateProfileSchema = z
  .object({
    handle: handleSchema.optional(),
    displayName: z
      .string()
      .trim()
      .min(1, "Enter a display name")
      .max(40)
      .optional(),
  })
  .refine(
    (update) => update.handle !== undefined || update.displayName !== undefined,
    "Send a handle or a display name",
  );

type ProfileUpdate = z.infer<typeof updateProfileSchema>;

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
