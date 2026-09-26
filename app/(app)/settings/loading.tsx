import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="grid max-w-sm gap-6" aria-busy>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}
