import { EmptyState } from "@/components/empty-state";

// Unmatched URLs land here, outside the (app) shell: rendering that layout would redirect a
// signed-out /api/* miss to /login instead of answering 404.
export default function NotFound() {
  return (
    <main className="mx-auto grid w-full max-w-md flex-1 content-center gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
      <EmptyState>There&apos;s no page or film at this address.</EmptyState>
    </main>
  );
}
