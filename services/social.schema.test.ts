import { describe, expect, it } from "vitest";

import { memberQuerySchema } from "./social.schema";

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
