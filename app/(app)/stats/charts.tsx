import type { Stats } from "@/services/dto";

export function GenreBars({ genres }: Pick<Stats, "genres">) {
  const top = Math.max(...genres.map((genre) => genre.count));
  return (
    <ul className="grid gap-2.5">
      {genres.map((genre) => (
        <li
          key={genre.name}
          className="grid grid-cols-[7.5rem_1fr_3ch] items-center gap-3 text-sm"
        >
          <span className="truncate">{genre.name}</span>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(genre.count / top) * 100}%` }}
            />
          </div>
          <span className="text-right text-muted-foreground tabular-nums">
            {genre.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

// Callers render this only once something is rated, so the tallest column is never 0.
export function RatingHistogram({ counts }: { counts: number[] }) {
  const tallest = Math.max(...counts);
  return (
    <ol className="grid grid-cols-10 gap-1.5">
      {counts.map((count, index) => (
        <li key={index} className="grid gap-1.5 text-center text-xs">
          <div className="flex h-32 items-end rounded-sm bg-muted">
            <div
              className="w-full rounded-sm bg-primary"
              style={{ height: `${(count / tallest) * 100}%` }}
            />
          </div>
          <span aria-hidden className="text-muted-foreground tabular-nums">
            {index + 1}
          </span>
          <span className="sr-only">
            Rated {index + 1}: {count} {count === 1 ? "film" : "films"}
          </span>
        </li>
      ))}
    </ol>
  );
}
