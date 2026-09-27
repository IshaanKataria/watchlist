import { PosterGridSkeleton } from "@/components/poster-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function MemberLoading() {
  return (
    <div className="grid gap-8" aria-busy>
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <PosterGridSkeleton />
    </div>
  );
}
