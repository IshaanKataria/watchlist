import { z } from "zod";

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
