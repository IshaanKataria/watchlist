import { describe, expect, it } from "vitest";

import { feedQuerySchema, memberQuerySchema } from "./social.schema";

describe("memberQuerySchema", () => {
  it.each([
    ["sam", "sam"],
    ["  Mira Chen ", "Mira Chen"],
    ["@sam", "sam"],
    ["a".repeat(40), "a".repeat(40)],
  ])("parses %j as %j", (q, expected) => {
    expect(memberQuerySchema.parse({ q }).q).toBe(expected);
  });

  it.each(["", "   ", "@", "a".repeat(41)])("rejects %j", (q) => {
    expect(memberQuerySchema.safeParse({ q }).success).toBe(false);
  });

  it("rejects a missing query", () => {
    expect(memberQuerySchema.safeParse({}).success).toBe(false);
  });
});

describe("feedQuerySchema", () => {
  it("allows no cursor, for the first page", () => {
    expect(feedQuerySchema.parse({})).toEqual({});
  });

  it.each([
    "2026-09-25T18:42:23.751234+00:00",
    "2026-09-25T18:42:23.751+00:00",
    "2026-09-25T18:42:23Z",
  ])("keeps %j exactly as sent", (before) => {
    expect(feedQuerySchema.parse({ before }).before).toBe(before);
  });

  it.each(["", "yesterday", "2026-09-25", "2026-09-25T18:42:23", "1727289743"])(
    "rejects %j",
    (before) => {
      expect(feedQuerySchema.safeParse({ before }).success).toBe(false);
    },
  );
});
