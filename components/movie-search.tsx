"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { PosterGrid, PosterGridSkeleton } from "@/components/poster-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WatchlistButton } from "@/components/watchlist-button";
import { entrySchema, movieSummarySchema } from "@/services/dto";

const responseSchema = z.object({
  results: z.array(
    movieSummarySchema.extend({ entry: entrySchema.nullable() }),
  ),
});

const score = new Intl.NumberFormat("en", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// movies is null when the request failed.
type Result = {
  q: string;
  movies: z.infer<typeof responseSchema>["results"] | null;
};

async function search(q: string, signal: AbortSignal) {
  const res = await fetch(`/api/movies/search?${new URLSearchParams({ q })}`, {
    signal,
  });
  if (!res.ok) return null;
  return responseSchema.parse(await res.json()).results;
}

export function MovieSearch({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);
  const q = query.trim();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
    if (!q) return;

    const controller = new AbortController();
    async function load() {
      const movies = await search(q, controller.signal).catch(() => null);
      if (!controller.signal.aborted) setResult({ q, movies });
    }
    const timer = setTimeout(() => void load(), 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, attempt]);

  function retry() {
    setResult(null);
    setAttempt((n) => n + 1);
  }

  return (
    <div className="grid gap-6">
      <label className="relative">
        <span className="sr-only">Search films</span>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search films by title"
          maxLength={100}
          className="pl-9"
        />
      </label>
      <SearchResults q={q} result={result} onRetry={retry} />
    </div>
  );
}

function SearchResults({
  q,
  result,
  onRetry,
}: {
  q: string;
  result: Result | null;
  onRetry: () => void;
}) {
  if (!q) {
    return (
      <p className="text-sm text-muted-foreground">
        Find a film to add it to your watchlist.
      </p>
    );
  }
  // Results for an older query never render: a skeleton stands in until the current one answers.
  if (result?.q !== q) return <PosterGridSkeleton />;
  if (!result.movies) {
    return (
      <div role="alert" className="grid justify-items-start gap-3">
        <p className="text-sm">
          Couldn&apos;t reach TMDB. Try again in a moment.
        </p>
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }
  if (result.movies.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No films match &ldquo;{q}&rdquo;.
      </p>
    );
  }
  return (
    <PosterGrid
      movies={result.movies}
      chip={(movie) =>
        movie.voteAverage > 0 ? score.format(movie.voteAverage) : null
      }
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
