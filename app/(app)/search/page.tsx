import { Suspense } from "react";

import { MovieSearch } from "@/components/movie-search";
import { PosterGrid, PosterGridSkeleton } from "@/components/poster-grid";
import { WatchlistButton } from "@/components/watchlist-button";
import { ApiError } from "@/lib/http";
import { requireUserId } from "@/lib/supabase/server";
import { trendingWithEntries } from "@/services/watchlist";

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      {/* Keyed so tapping the Search tab on /search?q=… starts a fresh search;
          replaceState while typing never re-renders this page. */}
      <MovieSearch key={initialQuery} initialQuery={initialQuery}>
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">Popular this week</h2>
          {/* Streamed, so the search box works while TMDB answers. */}
          <Suspense fallback={<PosterGridSkeleton />}>
            <Popular />
          </Suspense>
        </section>
      </MovieSearch>
    </div>
  );
}

async function Popular() {
  const movies = await trendingOrNull(await requireUserId());
  if (!movies) {
    return (
      <p className="text-sm text-muted-foreground">
        Popular films are unavailable right now. Search still works.
      </p>
    );
  }
  return (
    <PosterGrid
      movies={movies}
      action={(movie) => (
        <WatchlistButton
          tmdbId={movie.tmdbId}
          title={movie.title}
          initialEntry={movie.entry}
        />
      )}
    />
  );
}

// Only TMDB being down is quiet here: the page is still useful for searching. Anything else is a
// real fault for error.tsx.
async function trendingOrNull(userId: string) {
  try {
    return await trendingWithEntries(userId);
  } catch (error) {
    if (error instanceof ApiError && error.code === "tmdb_unavailable") {
      return null;
    }
    throw error;
  }
}
