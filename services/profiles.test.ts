import { describe, expect, it } from "vitest";

import { generateHandle, handleSchema } from "./profiles";

const nothingTaken = () => false;

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

describe("generateHandle", () => {
  it("keeps only lowercase letters, digits and underscores", () => {
    expect(generateHandle("Mira.Chen+Films", nothingTaken)).toBe(
      "mirachenfilms",
    );
  });

  it("falls back to member when fewer than 3 characters survive", () => {
    expect(generateHandle("J.o", nothingTaken)).toBe("member");
  });

  it("appends the first free numeric suffix", () => {
    const taken = new Set(["sam", "sam1"]);
    expect(generateHandle("sam", (handle) => taken.has(handle))).toBe("sam2");
  });

  it("trims the base so a suffixed handle stays within 20 characters", () => {
    const source = "abcdefghijklmnopqrstuvwxyz";
    expect(
      generateHandle(source, (handle) => handle === source.slice(0, 20)),
    ).toBe("abcdefghijklmnopqrs1");
  });

  it("suffixes reserved words", () => {
    expect(generateHandle("Admin", nothingTaken)).toBe("admin1");
  });

  it.each(["ishaan.kataria@gmail.com", "Zoë", "a", "watchlist"])(
    "always returns a handle the schema accepts (%j)",
    (source) => {
      expect(
        handleSchema.safeParse(generateHandle(source, nothingTaken)).success,
      ).toBe(true);
    },
  );
});
