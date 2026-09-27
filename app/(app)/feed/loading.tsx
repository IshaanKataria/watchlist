import { Skeleton } from "@/components/ui/skeleton";

export default function FeedLoading() {
  return (
    <div className="grid max-w-2xl gap-6" aria-busy>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Feed</h1>
        <Skeleton className="h-11 w-36 rounded-lg" />
      </div>
      <ul className="divide-y" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="aspect-2/3 w-12 rounded-md" />
          </li>
        ))}
      </ul>
    </div>
  );
}
