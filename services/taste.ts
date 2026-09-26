import { anthropic } from "@ai-sdk/anthropic";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";

import { ApiError } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { searchMovies } from "@/lib/tmdb";

import { recommendationSchema, toEntryDto } from "./dto";
import {
  buildInput,
  cooldown,
  draftSchema,
  instructions,
  MIN_RATED,
  pickRecommendations,
  type Suggestion,
} from "./taste.prompt";

function aiUnavailable(cause: unknown) {
  return new ApiError(
    502,
    "ai_unavailable",
    "Couldn't write your taste profile right now. Try again shortly.",
    { cause },
  );
}

// The member's whole list, keyed for entry lookups, and the model input it builds.
async function loadHistory(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist_entries")
    .select(
      "tmdb_id, status, rating, movie:movies (title, release_year, genres (name))",
    )
    .eq("user_id", userId)
    // A total order, so the same list always builds the same prompt and hash.
    .order("watched_at", { ascending: false, nullsFirst: false })
    .order("tmdb_id")
    .throwOnError();
  return {
    entries: new Map(data.map((row) => [row.tmdb_id, toEntryDto(row)])),
    ...buildInput(
      data.map(({ rating, movie }) => ({
        title: movie.title,
        year: movie.release_year,
        genres: movie.genres.map((genre) => genre.name),
        rating,
      })),
    ),
  };
}

async function loadSaved(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("taste_profiles")
    .select("summary, recommendations, input_hash, generated_at")
    .eq("user_id", userId)
    .maybeSingle()
    .throwOnError();
  return (
    data && {
      summary: data.summary,
      recommendations: z
        .array(recommendationSchema)
        .parse(data.recommendations),
      inputHash: data.input_hash,
      generatedAt: Date.parse(data.generated_at),
    }
  );
}

// TMDB's best match released within a year of the suggestion, which can be off by one.
async function resolve({ title, year, reason }: Suggestion) {
  const match = (await searchMovies(title)).find(
    (movie) => movie.year !== null && Math.abs(movie.year - year) <= 1,
  );
  return (
    match && {
      tmdbId: match.tmdbId,
      title: match.title,
      year: match.year,
      posterPath: match.posterPath,
      reason,
    }
  );
}

// result.output is a getter that throws when the model gave no output, so it is read inside the
// try. A draft that breaks the schema (a seventh film, an overlong reason) returns null and gets
// the same single retry as one TMDB can't match; anything else, the timeout included, is a 502.
async function suggest(prompt: string, abortSignal: AbortSignal) {
  try {
    const { output } = await generateText({
      model: anthropic(process.env.AI_MODEL ?? "claude-sonnet-5"),
      instructions,
      prompt,
      output: Output.object({ schema: draftSchema }),
      // A measured draft is about 570 tokens; the headroom covers adaptive thinking, which
      // counts toward the cap, so a longer answer isn't cut off mid-JSON.
      maxOutputTokens: 2000,
      abortSignal,
    });
    return output;
  } catch (cause) {
    if (NoObjectGeneratedError.isInstance(cause)) return null;
    throw aiUnavailable(cause);
  }
}

async function draft(
  prompt: string,
  listed: ReadonlySet<number>,
  abortSignal: AbortSignal,
) {
  const output = await suggest(prompt, abortSignal);
  if (!output) return null;
  const recommendations = pickRecommendations(
    await Promise.all(output.recommendations.map(resolve)),
    listed,
  );
  return recommendations && { summary: output.summary, recommendations };
}

// Unchanged input returns the saved profile without a model call. Changed input regenerates
// at most once a minute, which stops repeated clicks from each paying for a model call.
export async function generateTasteProfile(userId: string) {
  const [history, saved] = await Promise.all([
    loadHistory(userId),
    loadSaved(userId),
  ]);
  if (history.ratedCount < MIN_RATED) {
    throw new ApiError(
      422,
      "not_enough_history",
      `Rate at least ${MIN_RATED} films to get a taste profile`,
    );
  }
  if (saved?.inputHash === history.hash) {
    return { summary: saved.summary, recommendations: saved.recommendations };
  }
  const wait = saved && cooldown(saved.generatedAt, Date.now());
  if (wait) {
    throw new ApiError(
      429,
      "cooldown",
      `Profiles refresh at most once a minute. Try again ${wait.label}.`,
      { retryAfter: wait.seconds },
    );
  }

  const listed = new Set(history.entries.keys());
  // One budget for both drafts keeps the request inside the route's maxDuration.
  const signal = AbortSignal.timeout(45_000);
  const profile =
    (await draft(history.prompt, listed, signal)) ??
    (await draft(history.prompt, listed, signal));
  if (!profile) {
    throw aiUnavailable(
      "two drafts in a row broke the schema or matched too few films",
    );
  }
  await createAdminClient()
    .from("taste_profiles")
    .upsert({
      user_id: userId,
      ...profile,
      input_hash: history.hash,
      generated_at: new Date().toISOString(),
    })
    .throwOnError();
  return profile;
}

// Each recommendation carries the member's current entry, so one added from the page still
// shows as listed after a reload.
export async function getTasteProfile(userId: string) {
  const [history, saved] = await Promise.all([
    loadHistory(userId),
    loadSaved(userId),
  ]);
  return {
    ratedCount: history.ratedCount,
    profile: saved && {
      summary: saved.summary,
      recommendations: saved.recommendations.map((rec) => ({
        ...rec,
        entry: history.entries.get(rec.tmdbId) ?? null,
      })),
      upToDate: saved.inputHash === history.hash,
      cooldown: cooldown(saved.generatedAt, Date.now()),
    },
  };
}
