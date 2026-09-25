import { Skeleton } from "@/components/ui/skeleton";

export default function MovieLoading() {
  return (
    <div className="grid gap-8" aria-busy>
      <div className="flex items-end gap-4 pt-34 md:gap-8 md:pt-56">
        <Skeleton className="aspect-2/3 w-28 shrink-0 rounded-lg sm:w-36 md:w-48" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="grid max-w-prose gap-2">
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}
