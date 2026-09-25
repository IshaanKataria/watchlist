import { cn } from "cn";
import Link from "next/link";
import type { ReactNode } from "react";

import { PosterGrid } from "@/components/poster-grid";
import { buttonVariants } from "@/components/ui/button";
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
        <TabsList className="w-full group-data-horizontal/tabs:h-11 sm:w-72">
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
            <EmptyTab>Nothing on your list yet.</EmptyTab>
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
            <EmptyTab>Films you mark as watched show up here.</EmptyTab>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyTab({ children }: { children: ReactNode }) {
  return (
    <div className="grid justify-items-start gap-3">
      <p className="text-sm text-muted-foreground">{children}</p>
      <Link
        href="/search"
        className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}
      >
        Find a film
      </Link>
    </div>
  );
}
