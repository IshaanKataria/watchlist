import { EmptyState } from "@/components/empty-state";

// At the root, not a catch-all in (app): that layout needs a session, so a signed-out /api/* miss
// would redirect to /login instead of answering 404. Hence no nav here.
export default function NotFound() {
  return (
    <main className="mx-auto grid w-full max-w-md flex-1 content-center gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
      <EmptyState>There&apos;s no page or film at this address.</EmptyState>
    </main>
  );
}
