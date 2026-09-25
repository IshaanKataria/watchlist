import { StarIcon } from "lucide-react";
import Link from "next/link";

import { TmdbImage } from "@/components/tmdb-image";
import { Skeleton } from "@/components/ui/skeleton";
import type { MovieSummary } from "@/services/dto";

const GRID =
  "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6";

const score = new Intl.NumberFormat("en", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function PosterCard({ movie }: { movie: MovieSummary }) {
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
        {movie.voteAverage > 0 && (
          <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 text-xs font-medium tabular-nums backdrop-blur">
            <StarIcon className="size-3 fill-current" />
            {score.format(movie.voteAverage)}
          </span>
        )}
      </div>
      <div>
        <h3 className="line-clamp-2 text-sm leading-snug font-medium">
          {movie.title}
        </h3>
        {movie.year !== null && (
          <p className="text-xs text-muted-foreground">{movie.year}</p>
        )}
      </div>
    </Link>
  );
}

export function PosterGrid({ movies }: { movies: MovieSummary[] }) {
  return (
    <ul className={GRID}>
      {movies.map((movie) => (
        <li key={movie.tmdbId}>
          <PosterCard movie={movie} />
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
        </li>
      ))}
    </ul>
  );
}
