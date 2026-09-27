import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the hero's box so the page doesn't jump when it arrives.
export default function MovieLoading() {
  return (
    <div className="grid gap-8" aria-busy>
      <div className="-mx-4 -mt-6 flex items-end gap-4 px-4 pt-40 pb-6 md:mx-0 md:-mt-20 md:gap-8 md:px-0 md:pt-72 md:pb-8">
        <Skeleton className="aspect-2/3 w-28 shrink-0 rounded-lg sm:w-36 md:w-48" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-11 w-24 rounded-lg" />
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
