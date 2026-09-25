import { StarIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { TmdbImage } from "@/components/tmdb-image";
import { Skeleton } from "@/components/ui/skeleton";
import type { MovieSummary } from "@/services/dto";

type Poster = Pick<MovieSummary, "tmdbId" | "title" | "year" | "posterPath">;

const GRID =
  "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6";

function PosterCard({ movie, chip }: { movie: Poster; chip: string | null }) {
  return (
    <Link
      href={`/movie/${movie.tmdbId}`}
      className="group grid gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-muted">
        <TmdbImage
          path={movie.posterPath}
          size="w342"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {chip && (
          <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 text-xs font-medium tabular-nums backdrop-blur">
            <StarIcon className="size-3 fill-current" />
            {chip}
          </span>
        )}
      </div>
      <div>
        <h2 className="line-clamp-2 text-sm leading-snug font-medium">
          {movie.title}
        </h2>
        {movie.year !== null && (
          <p className="text-xs text-muted-foreground">{movie.year}</p>
        )}
      </div>
    </Link>
  );
}

// chip labels the star badge on the poster; action renders under the card, outside its link.
export function PosterGrid<T extends Poster>({
  movies,
  chip,
  action,
}: {
  movies: T[];
  chip?: (movie: T) => string | null;
  action?: (movie: T) => ReactNode;
}) {
  return (
    <ul className={GRID}>
      {movies.map((movie) => (
        <li key={movie.tmdbId} className="grid content-start gap-2">
          <PosterCard movie={movie} chip={chip?.(movie) ?? null} />
          {action?.(movie)}
        </li>
      ))}
    </ul>
  );
}

export function PosterGridSkeleton() {
  return (
    <ul className={GRID} aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <li key={i} className="grid gap-2">
          <Skeleton className="aspect-2/3 rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-11 rounded-lg" />
        </li>
      ))}
    </ul>
  );
}
