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
  it("keeps a new account's average null rather than 0", () => {
    expect(statsSchema.parse(empty)).toEqual({
      watchedCount: 0,
      ratedCount: 0,
      averageRating: null,
      totalRuntimeMinutes: 0,
      genres: [],
      ratingHistogram: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    });
  });

  it("maps a populated payload", () => {
    const stats = statsSchema.parse({
      ...empty,
      watched_count: 3,
      rated_count: 2,
      average_rating: 7.5,
      total_runtime_minutes: 361,
      genres: [{ name: "Drama", count: 2 }],
      rating_histogram: [0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    });
    expect(stats).toMatchObject({
      watchedCount: 3,
      averageRating: 7.5,
      genres: [{ name: "Drama", count: 2 }],
    });
  });

  it("rejects a histogram without ten buckets", () => {
    expect(
      statsSchema.safeParse({ ...empty, rating_histogram: [0, 0, 0] }).success,
    ).toBe(false);
  });
});
