import { Skeleton } from "@/components/ui/skeleton";

import { TasteSkeleton } from "./generate-profile";

export default function TasteLoading() {
  return (
    <div className="grid gap-6" aria-busy>
      <h1 className="text-2xl font-semibold tracking-tight">Taste profile</h1>
      <Skeleton className="h-5 w-72 max-w-full" />
      <TasteSkeleton />
    </div>
  );
}
