import { describe, expect, it } from "vitest";

import {
  statsSchema,
  toFeedItemDto,
  toMemberProfileDto,
  toTasteMatchDto,
  toWatchedFilmDto,
} from "./dto";

const empty = {
  watched_count: 0,
  rated_count: 0,
  average_rating: null,
  total_runtime_minutes: 0,
  genres: [],
  rating_histogram: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

describe("statsSchema", () => {
  it("maps user_stats() to camelCase", () => {
    expect(
      statsSchema.parse({
        watched_count: 3,
        rated_count: 2,
        average_rating: 7.5,
        total_runtime_minutes: 361,
        genres: [{ name: "Drama", count: 2 }],
        rating_histogram: [0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
      }),
    ).toEqual({
      watchedCount: 3,
      ratedCount: 2,
      averageRating: 7.5,
      totalRuntimeMinutes: 361,
      genres: [{ name: "Drama", count: 2 }],
      ratingHistogram: [0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    });
  });

  it("accepts an empty account's null average", () => {
    expect(statsSchema.parse(empty).averageRating).toBeNull();
  });

  it("rejects a histogram without ten buckets", () => {
    expect(
      statsSchema.safeParse({ ...empty, rating_histogram: [0, 0, 0] }).success,
    ).toBe(false);
  });
});

const sam = {
  handle: "sam",
  display_name: "Sam Rivera",
  avatar_url: null,
};

describe("toFeedItemDto", () => {
  it("nests the member and film, keeping a null rating and poster", () => {
    expect(
      toFeedItemDto({
        ...sam,
        tmdb_id: 1091,
        title: "The Thing",
        poster_path: null,
        rating: null,
        watched_at: "2026-09-25T18:42:23.751234+00:00",
      }),
    ).toEqual({
      member: { handle: "sam", displayName: "Sam Rivera", avatarUrl: null },
      movie: { tmdbId: 1091, title: "The Thing", posterPath: null },
      rating: null,
      watchedAt: "2026-09-25T18:42:23.751234+00:00",
    });
  });
});

describe("toMemberProfileDto", () => {
  it("maps the header and counts", () => {
    expect(
      toMemberProfileDto({
        ...sam,
        is_following: true,
        is_self: false,
        follower_count: 1,
        following_count: 0,
      }),
    ).toEqual({
      handle: "sam",
      displayName: "Sam Rivera",
      avatarUrl: null,
      isFollowing: true,
      isSelf: false,
      followerCount: 1,
      followingCount: 0,
    });
  });
});

describe("toWatchedFilmDto", () => {
  it("maps a film for the poster grid, keeping nulls", () => {
    expect(
      toWatchedFilmDto({
        tmdb_id: 1091,
        title: "The Thing",
        release_year: null,
        poster_path: null,
        rating: 10,
      }),
    ).toEqual({
      tmdbId: 1091,
      title: "The Thing",
      year: null,
      posterPath: null,
      rating: 10,
    });
  });
});

describe("toTasteMatchDto", () => {
  it("maps the count and percent", () => {
    expect(toTasteMatchDto({ shared_count: 12, match_percent: 82 })).toEqual({
      sharedCount: 12,
      matchPercent: 82,
    });
  });

  it("keeps a null percent below the minimum overlap", () => {
    expect(toTasteMatchDto({ shared_count: 1, match_percent: null })).toEqual({
      sharedCount: 1,
      matchPercent: null,
    });
  });
});
