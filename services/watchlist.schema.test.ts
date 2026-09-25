import { describe, expect, it } from "vitest";

import { addEntrySchema, updateEntrySchema } from "./watchlist.schema";

describe("addEntrySchema", () => {
  it("accepts a positive integer id", () => {
    expect(addEntrySchema.parse({ tmdbId: 438631 })).toEqual({
      tmdbId: 438631,
    });
  });

  it.each([0, -1, 1.5, "438631", null])("rejects the id %j", (tmdbId) => {
    expect(addEntrySchema.safeParse({ tmdbId }).success).toBe(false);
  });

  it("drops a spoofed user id", () => {
    expect(addEntrySchema.parse({ tmdbId: 1, userId: "someone" })).toEqual({
      tmdbId: 1,
    });
  });
});

describe("updateEntrySchema", () => {
  it.each([
    { status: "watched" },
    { status: "watched", rating: 1 },
    { status: "watched", rating: 10 },
    { status: "to_watch" },
  ])("accepts %j", (body) => {
    expect(updateEntrySchema.parse(body)).toEqual(body);
  });

  it.each([0, 11, 7.5, "ten", null])("rejects the rating %j", (rating) => {
    expect(
      updateEntrySchema.safeParse({ status: "watched", rating }).success,
    ).toBe(false);
  });

  it.each([{}, { status: "watching" }, { rating: 8 }])("rejects %j", (body) => {
    expect(updateEntrySchema.safeParse(body).success).toBe(false);
  });

  it("drops a rating sent with to_watch", () => {
    expect(updateEntrySchema.parse({ status: "to_watch", rating: 8 })).toEqual({
      status: "to_watch",
    });
  });
});
