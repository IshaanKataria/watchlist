import { z } from "zod";

import { Constants, type Tables } from "@/lib/supabase/database.types";

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

// Schemas rather than bare types: the search box parses API responses with them.
export const movieSummarySchema = z.object({
  tmdbId: z.number().int().positive(),
  title: z.string(),
  year: z.number().int().nullable(),
  posterPath: z.string().nullable(),
  voteAverage: z.number(),
});

export type MovieSummary = z.infer<typeof movieSummarySchema>;

export const entrySchema = z.object({
  tmdbId: z.number(),
  status: z.enum(Constants.public.Enums.watch_status),
  rating: z.number().nullable(),
});

export type EntryDto = z.infer<typeof entrySchema>;

export function toEntryDto(
  entry: Pick<Tables<"watchlist_entries">, "tmdb_id" | "status" | "rating">,
): EntryDto {
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

export type WatchlistItem = ReturnType<typeof toWatchlistItemDto>;

const countSchema = z.number().int().nonnegative();

// Parses user_stats() jsonb: the Data API types it as Json, so the shape is checked here once.
export const statsSchema = z
  .object({
    watched_count: countSchema,
    rated_count: countSchema,
    average_rating: z.number().nullable(),
    total_runtime_minutes: countSchema,
    genres: z.array(z.object({ name: z.string(), count: countSchema })),
    rating_histogram: z.array(countSchema).length(10),
  })
  .transform((stats) => ({
    watchedCount: stats.watched_count,
    ratedCount: stats.rated_count,
    averageRating: stats.average_rating,
    totalRuntimeMinutes: stats.total_runtime_minutes,
    genres: stats.genres,
    ratingHistogram: stats.rating_histogram,
  }));

export type Stats = z.output<typeof statsSchema>;
