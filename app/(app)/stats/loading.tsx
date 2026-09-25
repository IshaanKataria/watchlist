import { Skeleton } from "@/components/ui/skeleton";

export default function StatsLoading() {
  return (
    <div className="grid gap-8" aria-busy>
      <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
      <div className="grid gap-3 sm:grid-cols-3" aria-hidden>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-2" aria-hidden>
        <Skeleton className="h-56 rounded-lg" />
        <Skeleton className="h-56 rounded-lg" />
      </div>
    </div>
  );
}
