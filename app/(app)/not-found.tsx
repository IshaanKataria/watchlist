import { EmptyState } from "@/components/empty-state";

export default function NotFound() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
      <EmptyState>There&apos;s no page or film at this address.</EmptyState>
    </div>
  );
}
