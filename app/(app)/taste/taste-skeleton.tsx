import { Skeleton } from "@/components/ui/skeleton";

export function TasteSkeleton() {
  return (
    <div className="grid gap-8" aria-hidden>
      <div className="grid max-w-prose gap-2.5">
        <Skeleton className="h-5" />
        <Skeleton className="h-5" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <ul className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="flex gap-4">
            <Skeleton className="aspect-2/3 w-24 shrink-0 rounded-lg" />
            <div className="grid flex-1 content-start gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-11 w-24 rounded-lg" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
