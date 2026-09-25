import { ApiError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { searchMovies } from "@/lib/tmdb";

import { toEntryDto, toWatchlistItemDto } from "./dto";
import { cacheMovie } from "./movies";
import type { EntryUpdate } from "./watchlist.schema";

export async function addEntry(userId: string, tmdbId: number) {
  await cacheMovie(tmdbId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("watchlist_entries")
    .insert({ user_id: userId, tmdb_id: tmdbId })
    .select("tmdb_id, status, rating")
    .single();
  if (error?.code === "23505") {
    throw new ApiError(
      409,
      "already_listed",
      "That film is already on your watchlist",
    );
  }
  if (error) throw error;
  return toEntryDto(data);
}

// The track_watched_at trigger derives watched_at and clears the rating on a move back.
export async function updateEntry(
  userId: string,
  tmdbId: number,
  update: EntryUpdate,
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist_entries")
    .update(update)
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .select("tmdb_id, status, rating")
    .maybeSingle()
    .throwOnError();
  if (!data) {
    throw new ApiError(404, "not_listed", "That film isn't on your watchlist");
  }
  return toEntryDto(data);
}

export async function removeEntry(userId: string, tmdbId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist_entries")
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .select("tmdb_id")
    .maybeSingle()
    .throwOnError();
  if (!data) {
    throw new ApiError(404, "not_listed", "That film isn't on your watchlist");
  }
}

// Newest first on both tabs: watched films by watched_at, the rest by added_at.
export async function listEntries(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist_entries")
    .select(
      "status, rating, movie:movies (tmdb_id, title, release_year, poster_path)",
    )
    .eq("user_id", userId)
    .order("watched_at", { ascending: false, nullsFirst: false })
    .order("added_at", { ascending: false })
    .throwOnError();
  return data.map(toWatchlistItemDto);
}

export async function getEntry(userId: string, tmdbId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist_entries")
    .select("tmdb_id, status, rating")
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .maybeSingle()
    .throwOnError();
  return data && toEntryDto(data);
}

// TMDB results paired with the member's entry, or null, so each can offer Add or show its status.
export async function searchWithEntries(userId: string, q: string) {
  const movies = await searchMovies(q);
  if (movies.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist_entries")
    .select("tmdb_id, status, rating")
    .eq("user_id", userId)
    .in(
      "tmdb_id",
      movies.map((movie) => movie.tmdbId),
    )
    .throwOnError();
  const entries = new Map(
    data.map((entry) => [entry.tmdb_id, toEntryDto(entry)]),
  );
  return movies.map((movie) => ({
    ...movie,
    entry: entries.get(movie.tmdbId) ?? null,
  }));
}
