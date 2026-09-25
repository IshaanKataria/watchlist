import { describe, expect, it } from "vitest";

import { statsSchema } from "./dto";

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
