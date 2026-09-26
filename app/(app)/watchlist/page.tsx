import { EmptyState } from "@/components/empty-state";
import { PosterGrid } from "@/components/poster-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUserId } from "@/lib/supabase/server";
import { listEntries } from "@/services/watchlist";

import { EntryActions } from "./entry-actions";

export default async function WatchlistPage() {
  const entries = await listEntries(await requireUserId());
  const toWatch = entries.filter((entry) => entry.status === "to_watch");
  const watched = entries.filter((entry) => entry.status === "watched");

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Watchlist</h1>
      <Tabs defaultValue="to_watch" className="gap-6">
        <TabsList className="w-full sm:w-72">
          <TabsTrigger value="to_watch">
            To watch ({toWatch.length})
          </TabsTrigger>
          <TabsTrigger value="watched">Watched ({watched.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="to_watch">
          {toWatch.length > 0 ? (
            <PosterGrid
              movies={toWatch}
              action={(entry) => <EntryActions entry={entry} />}
            />
          ) : (
            <EmptyState>Nothing on your list yet.</EmptyState>
          )}
        </TabsContent>
        <TabsContent value="watched">
          {watched.length > 0 ? (
            <PosterGrid
              movies={watched}
              chip={(entry) => (entry.rating ? String(entry.rating) : null)}
              action={(entry) => <EntryActions entry={entry} />}
            />
          ) : (
            <EmptyState>Films you mark as watched show up here.</EmptyState>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
