import { createHash } from "node:crypto";

import { z } from "zod";

import type { Recommendation } from "./dto";

export const MIN_RATED = 3;
// Long enough to stop repeated clicks, short enough that Regenerate never looks broken.
const COOLDOWN_MS = 60_000;
// Recent ratings say enough about a taste, and the cap bounds what one generation costs.
const MAX_RATED = 60;

export const instructions = `You are a film critic writing a taste profile for a member of a film-tracking app, from the films they rated out of 10.

Summary: 2 to 3 sentences in the second person. Cite specific titles with the ratings they gave, and contrast what they rated highest with what they rated lowest.

Recommendations: exactly 6 feature films, none of them on the member's list. Each reason is one sentence of at most 25 words that names a specific title from their ratings and the rating they gave it. Give each film's canonical English title and original release year, and only suggest films well known enough to be listed on TMDB.`;

export const draftSchema = z.object({
  summary: z.string().min(40).max(600),
  recommendations: z
    .array(
      z.object({
        title: z.string(),
        year: z.number().int(),
        reason: z.string().max(200),
      }),
    )
    .length(6),
});

export type Suggestion = z.infer<typeof draftSchema>["recommendations"][number];

type Film = {
  title: string;
  year: number | null;
  genres: string[];
  rating: number | null;
};

const label = (film: Film) =>
  film.year ? `${film.title} (${film.year})` : film.title;

// films arrive most recently watched first. The hash covers exactly what the model is sent,
// instructions included, so a cached profile goes stale only when that changes.
export function buildInput(films: Film[]) {
  const rated = films.filter((film) => film.rating !== null);
  const prompt = [
    "Films they rated, most recently watched first:",
    ...rated.slice(0, MAX_RATED).map(
      (film) =>
        // Genres come back from the database in no fixed order.
        `- ${label(film)} · ${film.genres.toSorted().join(", ") || "no genres listed"} · ${film.rating}/10`,
    ),
    "",
    "Every film on their list (never recommend these):",
    ...films.map((film) => `- ${label(film)}`),
  ].join("\n");
  return {
    ratedCount: rated.length,
    prompt,
    hash: createHash("sha256")
      .update(instructions)
      .update(prompt)
      .digest("hex"),
  };
}

// Keeps films TMDB resolved and the member hasn't listed, once each, in the model's order.
// null means too few survived, and the caller asks for a second draft.
export function pickRecommendations(
  candidates: (Recommendation | undefined)[],
  listed: ReadonlySet<number>,
) {
  const picked = new Map<number, Recommendation>();
  for (const rec of candidates) {
    if (rec && !listed.has(rec.tmdbId) && !picked.has(rec.tmdbId)) {
      picked.set(rec.tmdbId, rec);
    }
  }
  return picked.size < 3 ? null : [...picked.values()].slice(0, 5);
}

// Time left before a saved profile may regenerate, as whole seconds and as "in 42 seconds",
// or null once it may.
export function cooldown(generatedAt: number, now: number) {
  const seconds = Math.ceil((generatedAt + COOLDOWN_MS - now) / 1000);
  if (seconds <= 0) return null;
  return {
    seconds,
    label: new Intl.RelativeTimeFormat("en").format(seconds, "second"),
  };
}
