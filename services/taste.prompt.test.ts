import { describe, expect, it } from "vitest";

import type { Recommendation } from "./dto";
import { buildInput, pickRecommendations } from "./taste.prompt";

const film = (title: string, rating: number | null, genres = ["Drama"]) => ({
  title,
  year: 2000,
  genres,
  rating,
});

const rec = (tmdbId: number): Recommendation => ({
  tmdbId,
  title: `Film ${tmdbId}`,
  year: 2000,
  posterPath: null,
  reason: "Because you rated Heat 9/10",
});

describe("buildInput", () => {
  it("hashes the same list the same way whatever order genres arrive in", () => {
    const a = buildInput([film("Heat", 9, ["Crime", "Thriller"])]);
    const b = buildInput([film("Heat", 9, ["Thriller", "Crime"])]);
    expect(a.hash).toBe(b.hash);
  });

  it("changes the hash when a rating changes", () => {
    expect(buildInput([film("Heat", 9)]).hash).not.toBe(
      buildInput([film("Heat", 8)]).hash,
    );
  });

  it("changes the hash when a film is added to the list", () => {
    expect(buildInput([film("Heat", 9)]).hash).not.toBe(
      buildInput([film("Heat", 9), film("Alien", null)]).hash,
    );
  });

  it("sends the 60 most recent ratings but excludes every listed film", () => {
    const films = Array.from({ length: 61 }, (_, i) => film(`Film ${i}`, 7));
    const { ratedCount, prompt } = buildInput(films);
    const lines = prompt.split("\n");
    expect(ratedCount).toBe(61);
    expect(lines).toContain("- Film 59 (2000) · Drama · 7/10");
    expect(lines).not.toContain("- Film 60 (2000) · Drama · 7/10");
    expect(lines).toContain("- Film 60 (2000)");
  });

  it("counts only rated films", () => {
    expect(buildInput([film("Heat", 9), film("Alien", null)]).ratedCount).toBe(
      1,
    );
  });
});

describe("pickRecommendations", () => {
  it("drops unresolved, listed and repeated films, keeping the model's order", () => {
    expect(
      pickRecommendations(
        [rec(1), undefined, rec(2), rec(1), rec(3), rec(4)],
        new Set([2]),
      )?.map((r) => r.tmdbId),
    ).toEqual([1, 3, 4]);
  });

  it("returns null when fewer than 3 survive, so the caller retries", () => {
    expect(
      pickRecommendations([rec(1), rec(2), undefined], new Set()),
    ).toBeNull();
  });

  it("keeps at most 5", () => {
    expect(
      pickRecommendations([1, 2, 3, 4, 5, 6].map(rec), new Set()),
    ).toHaveLength(5);
  });
});
