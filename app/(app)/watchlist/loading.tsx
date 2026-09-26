import { PosterGridSkeleton } from "@/components/poster-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchlistLoading() {
  return (
    <div className="grid gap-6" aria-busy>
      <h1 className="text-2xl font-semibold tracking-tight">Watchlist</h1>
      <Skeleton className="h-12.5 w-full rounded-lg sm:w-72" />
      <PosterGridSkeleton />
    </div>
  );
}
