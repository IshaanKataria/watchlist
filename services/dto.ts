import { z } from "zod";

import { Constants, type Tables } from "@/lib/supabase/database.types";

export const memberSchema = z.object({
  handle: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
});

export type MemberDto = z.infer<typeof memberSchema>;

type MemberColumns = Pick<
  Tables<"profiles">,
  "handle" | "display_name" | "avatar_url"
>;

export function toMemberDto(profile: MemberColumns): MemberDto {
  return {
    handle: profile.handle,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
  };
}

// A search_members() row: a member, and whether the caller follows them.
export const memberResultSchema = memberSchema.extend({
  isFollowing: z.boolean(),
});

export type MemberResult = z.infer<typeof memberResultSchema>;

export function toMemberResultDto(
  row: MemberColumns & { is_following: boolean },
): MemberResult {
  return { ...toMemberDto(row), isFollowing: row.is_following };
}

// A member_profile() row. Counts are public; the films behind them are not.
export function toMemberProfileDto(
  row: MemberColumns & {
    is_following: boolean;
    is_self: boolean;
    follower_count: number;
    following_count: number;
  },
) {
  return {
    ...toMemberResultDto(row),
    isSelf: row.is_self,
    followerCount: row.follower_count,
    followingCount: row.following_count,
  };
}

// A taste_match() row. match_percent is null below 3 shared films, which the generated type misses.
export function toTasteMatchDto(row: {
  shared_count: number;
  match_percent: number | null;
}) {
  return { sharedCount: row.shared_count, matchPercent: row.match_percent };
}

// Schemas rather than bare types: the search box parses API responses with them.
export const movieSummarySchema = z.object({
  tmdbId: z.number().int().positive(),
  title: z.string(),
  year: z.number().int().nullable(),
  posterPath: z.string().nullable(),
  voteAverage: z.number(),
});

export type MovieSummary = z.infer<typeof movieSummarySchema>;

// Also parses taste_profiles.recommendations, which the Data API types as Json.
export const recommendationSchema = movieSummarySchema
  .pick({ tmdbId: true, title: true, year: true, posterPath: true })
  .extend({ reason: z.string() });

export type Recommendation = z.infer<typeof recommendationSchema>;

export const entrySchema = z.object({
  tmdbId: z.number(),
  status: z.enum(Constants.public.Enums.watch_status),
  rating: z.number().nullable(),
});

export type EntryDto = z.infer<typeof entrySchema>;

// The columns toEntryDto reads, selected as one literal so the typed client checks them.
export const ENTRY_COLUMNS = "tmdb_id, status, rating";

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

// Row types below come from the tables, not the functions: generated types mark every column a
// function returns as non-null, but rating, poster_path and release_year can be null.
type FilmColumns = Pick<Tables<"movies">, "tmdb_id" | "title" | "poster_path">;
type Rating = Pick<Tables<"watchlist_entries">, "rating">;

// A member_watched() row, for a poster grid.
export function toWatchedFilmDto(
  row: FilmColumns & Pick<Tables<"movies">, "release_year"> & Rating,
) {
  return {
    tmdbId: row.tmdb_id,
    title: row.title,
    year: row.release_year,
    posterPath: row.poster_path,
    rating: row.rating,
  };
}

export type WatchedFilm = ReturnType<typeof toWatchedFilmDto>;

// A schema because the feed's Load more button parses API pages with it.
export const feedItemSchema = z.object({
  member: memberSchema,
  movie: movieSummarySchema.pick({
    tmdbId: true,
    title: true,
    posterPath: true,
  }),
  rating: z.number().nullable(),
  watchedAt: z.string(),
});

export type FeedItem = z.infer<typeof feedItemSchema>;

export function toFeedItemDto(
  row: MemberColumns & FilmColumns & Rating & { watched_at: string },
): FeedItem {
  return {
    member: toMemberDto(row),
    movie: {
      tmdbId: row.tmdb_id,
      title: row.title,
      posterPath: row.poster_path,
    },
    rating: row.rating,
    watchedAt: row.watched_at,
  };
}

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
