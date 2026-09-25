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

export function toEntryDto(
  entry: Pick<Tables<"watchlist_entries">, "tmdb_id" | "status" | "rating">,
) {
  return { tmdbId: entry.tmdb_id, status: entry.status, rating: entry.rating };
}

export function toWatchlistItemDto({
  status,
  rating,
  movie,
}: Pick<Tables<"watchlist_entries">, "status" | "rating"> & {
  movie: Pick<
    Tables<"movies">,
    "tmdb_id" | "title" | "release_year" | "poster_path"
  >;
}) {
  return {
    tmdbId: movie.tmdb_id,
    title: movie.title,
    year: movie.release_year,
    posterPath: movie.poster_path,
    status,
    rating,
  };
}
