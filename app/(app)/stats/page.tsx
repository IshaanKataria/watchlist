import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/empty-state";
import { requireUserId } from "@/lib/supabase/server";
import { getStats } from "@/services/stats";

import { GenreBars, RatingHistogram } from "./charts";

export default async function StatsPage() {
  const stats = await getStats(await requireUserId());

  if (stats.watchedCount === 0) {
    return (
      <div className="grid gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
        <EmptyState>
          Mark films as watched and rate them to see your stats.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
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
          caption={
            stats.averageRating === null ? "No ratings yet" : "out of 10"
          }
        />
        <Tile
          label="Rated"
          value={stats.ratedCount}
          caption={`of ${stats.watchedCount} watched`}
        />
      </dl>
      <Link
        href="/taste"
        className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="grid gap-1">
          <span className="font-medium">Taste profile</span>
          <span className="text-sm text-muted-foreground">
            A critic&apos;s read on your ratings, and five films to watch next.
          </span>
        </span>
        <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" />
      </Link>
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="grid content-start gap-4">
          <h2 className="text-lg font-semibold">Genres</h2>
          {stats.genres.length > 0 ? (
            <GenreBars genres={stats.genres} />
          ) : (
            <p className="text-sm text-muted-foreground">
              TMDB lists no genres for these films yet.
            </p>
          )}
        </section>
        <section className="grid content-start gap-4">
          <h2 className="text-lg font-semibold">Ratings</h2>
          {stats.ratedCount > 0 ? (
            <RatingHistogram counts={stats.ratingHistogram} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Rate a film to see how your ratings spread.
            </p>
          )}
        </section>
      </div>
    </div>
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
