import type { ReactNode } from "react";

import type { Stats } from "@/services/dto";

export function StatTiles({ stats }: { stats: Stats }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      <Tile
        label="Watched"
        value={stats.watchedCount}
        caption={
          stats.totalRuntimeMinutes > 0
            ? `${formatTotalRuntime(stats.totalRuntimeMinutes)} of film`
            : "Runtime unknown"
        }
      />
      <Tile
        label="Average rating"
        value={stats.averageRating?.toFixed(1) ?? "–"}
        caption={stats.averageRating === null ? "No ratings yet" : "out of 10"}
      />
      <Tile
        label="Rated"
        value={stats.ratedCount}
        caption={`of ${stats.watchedCount} watched`}
      />
    </dl>
  );
}

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

function Tile({
  label,
  value,
  caption,
}: {
  label: string;
  value: ReactNode;
  caption: string;
}) {
  return (
    <div className="grid gap-1 rounded-lg border p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-3xl font-semibold tabular-nums">{value}</dd>
      <dd className="text-xs text-muted-foreground">{caption}</dd>
    </div>
  );
}

// A total can run to days, where minutes are noise, unlike a single film's runtime.
function formatTotalRuntime(total: number) {
  const days = Math.floor(total / 1440);
  const hours = Math.floor(total / 60) % 24;
  const units = days > 0 ? { d: days, h: hours } : { h: hours, m: total % 60 };
  return Object.entries(units)
    .filter(([, n]) => n > 0)
    .map(([unit, n]) => `${n}${unit}`)
    .join(" ");
}
