import { describe, expect, it } from "vitest";

import { handleSchema } from "./profiles";

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
