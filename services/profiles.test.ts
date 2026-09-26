import { describe, expect, it } from "vitest";

import { handleSchema, updateProfileSchema } from "./profiles";

describe("handleSchema", () => {
  it.each(["sam", "mira_chen", "user2026", "a".repeat(20)])(
    "accepts %j",
    (handle) => {
      expect(handleSchema.safeParse(handle).success).toBe(true);
    },
  );

  it.each(["ab", "a".repeat(21), "Sam", "mira-chen", "mira chen", ""])(
    "rejects %j",
    (handle) => {
      expect(handleSchema.safeParse(handle).success).toBe(false);
    },
  );

  it.each(["admin", "settings", "u"])(
    "rejects the reserved handle %j",
    (handle) => {
      expect(handleSchema.safeParse(handle).success).toBe(false);
    },
  );
});

describe("updateProfileSchema", () => {
  it.each([
    { handle: "sam_2" },
    { displayName: "Sam" },
    { handle: "sam_2", displayName: "Sam" },
  ])("accepts %j", (body) => {
    expect(updateProfileSchema.parse(body)).toEqual(body);
  });

  it("trims the display name", () => {
    expect(updateProfileSchema.parse({ displayName: "  Sam  " })).toEqual({
      displayName: "Sam",
    });
  });

  it.each([
    {},
    { displayName: "   " },
    { displayName: "a".repeat(41) },
    { handle: "admin" },
    { handle: "Sam" },
  ])("rejects %j", (body) => {
    expect(updateProfileSchema.safeParse(body).success).toBe(false);
  });

  it("drops fields members can't set", () => {
    expect(
      updateProfileSchema.parse({
        handle: "sam_2",
        userId: "someone",
        avatarUrl: "https://example.com/a.png",
      }),
    ).toEqual({ handle: "sam_2" });
  });
});
