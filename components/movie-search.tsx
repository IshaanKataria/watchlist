"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { z } from "zod";

import { PosterGrid, PosterGridSkeleton } from "@/components/poster-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WatchlistButton } from "@/components/watchlist-button";
import { getJson } from "@/lib/api";
import { entrySchema, memberSchema, movieSummarySchema } from "@/services/dto";

const responseSchema = z.object({
  results: z.array(
    movieSummarySchema.extend({
      entry: entrySchema.nullable(),
      friends: z.array(memberSchema),
    }),
  ),
});

const SUGGESTIONS = ["Dune: Part Two", "Past Lives", "Parasite", "Aftersun"];

const score = new Intl.NumberFormat("en", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function search(q: string, signal: AbortSignal) {
  return getJson(
    `/api/movies/search?${new URLSearchParams({ q })}`,
    responseSchema,
    signal,
  );
}

type Result = { q: string } & Awaited<ReturnType<typeof search>>;

// Shows suggestions and children (popular films) until there is something to search for.
export function MovieSearch({
  initialQuery,
  children,
}: {
  initialQuery: string;
  children: ReactNode;
}) {
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
      const found = await search(q, controller.signal);
      if (!controller.signal.aborted) setResult({ q, ...found });
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
      {q ? (
        <SearchResults q={q} result={result} onRetry={retry} />
      ) : (
        <>
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">
              Not sure where to start? Try one of these:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((title) => (
                <Button
                  key={title}
                  variant="outline"
                  onClick={() => setQuery(title)}
                >
                  {title}
                </Button>
              ))}
            </div>
          </div>
          {children}
        </>
      )}
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
  // Results for an older query never render: a skeleton stands in until the current one answers.
  if (result?.q !== q) return <PosterGridSkeleton />;
  if (!result.data) {
    return (
      <div role="alert" className="grid justify-items-start gap-3">
        <p className="text-sm">{result.error}</p>
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }
  if (result.data.results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No films match &ldquo;{q}&rdquo;.
      </p>
    );
  }
  return (
    <PosterGrid
      movies={result.data.results}
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
