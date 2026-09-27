import { z } from "zod";

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

export type ProfileUpdate = z.infer<typeof updateProfileSchema>;
