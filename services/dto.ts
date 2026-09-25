import { z } from "zod";

import type { Tables } from "@/lib/supabase/database.types";

export function toMemberDto(
  profile: Pick<Tables<"profiles">, "handle" | "display_name" | "avatar_url">,
) {
  return {
    handle: profile.handle,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
  };
}

export type MemberDto = ReturnType<typeof toMemberDto>;

// A schema rather than a bare type: the search box parses API responses with it.
export const movieSummarySchema = z.object({
  tmdbId: z.number().int().positive(),
  title: z.string(),
  year: z.number().int().nullable(),
  posterPath: z.string().nullable(),
  voteAverage: z.number(),
});

export type MovieSummary = z.infer<typeof movieSummarySchema>;
