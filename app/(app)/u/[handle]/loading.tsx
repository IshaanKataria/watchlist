import { PosterGridSkeleton } from "@/components/poster-grid";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the page of someone you follow, the usual way in from the feed, so it lands without a jump.
export default function MemberLoading() {
  return (
    <div className="grid gap-8" aria-busy>
      <div className="flex flex-wrap items-center gap-4" aria-hidden>
        <Skeleton className="size-16 rounded-full" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-11 w-full rounded-lg sm:w-28" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3" aria-hidden>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-28.5 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4" aria-hidden>
        <Skeleton className="h-7 w-32" />
        <div className="grid gap-2.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-5" />
          ))}
        </div>
      </div>
      <div className="grid gap-4" aria-hidden>
        <Skeleton className="h-7 w-24" />
        <PosterGridSkeleton actions={false} />
      </div>
    </div>
  );
}
