import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { GenreBars, RatingHistogram, StatTiles } from "@/components/stats";
import { requireUserId } from "@/lib/supabase/server";
import { getStats } from "@/services/stats";

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
      <StatTiles stats={stats} />
      <Link
        href="/taste"
        className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="grid gap-1">
          <span className="font-medium">Taste profile</span>
          <span className="text-sm text-muted-foreground">
            A critic&apos;s read on your ratings, and films to watch next.
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
