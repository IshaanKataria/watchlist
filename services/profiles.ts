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

// Same rules as the public.handle_new_user() trigger, so settings can suggest a free handle.
export function generateHandle(
  source: string,
  isTaken: (handle: string) => boolean,
) {
  const cleaned = source
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
  const base = cleaned.length < 3 ? "member" : cleaned;

  let candidate = base;
  for (let n = 1; RESERVED_HANDLES.has(candidate) || isTaken(candidate); n++) {
    candidate = base.slice(0, 20 - String(n).length) + n;
  }
  return candidate;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("handle, display_name, avatar_url")
    .eq("id", userId)
    .single()
    .throwOnError();
  return toMemberDto(data);
}
