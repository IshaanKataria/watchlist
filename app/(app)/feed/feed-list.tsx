"use client";

import { useState, useTransition, type ReactNode } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { getJson } from "@/lib/api";
import { feedItemSchema, type FeedItem } from "@/services/dto";

import { FeedRow } from "./feed-row";

const pageSchema = z.object({
  items: z.array(feedItemSchema),
  nextCursor: z.string().nullable(),
});

// children are the first page, rendered on the server. Older pages render here only after a click,
// so their relative times never hydrate against the server's clock.
export function FeedList({
  children,
  cursor,
}: {
  children: ReactNode;
  cursor: string | null;
}) {
  const [older, setOlder] = useState<FeedItem[]>([]);
  const [next, setNext] = useState(cursor);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function loadMore(before: string) {
    startTransition(async () => {
      const page = await getJson(
        `/api/feed?${new URLSearchParams({ before })}`,
        pageSchema,
      );
      if (!page.data) {
        setError(page.error);
        return;
      }
      const { items, nextCursor } = page.data;
      setError(null);
      setOlder((loaded) => [...loaded, ...items]);
      setNext(nextCursor);
    });
  }

  return (
    <div className="grid gap-4">
      <ol className="divide-y">
        {children}
        {older.map((item) => (
          <FeedRow
            key={`${item.member.handle} ${item.movie.tmdbId}`}
            item={item}
          />
        ))}
      </ol>
      {error && (
        <p role="alert" className="text-sm">
          {error}
        </p>
      )}
      {next && (
        <Button
          variant="outline"
          onClick={() => loadMore(next)}
          disabled={pending}
          className="justify-self-center"
        >
          {pending ? "Loading…" : "Load more"}
        </Button>
      )}
    </div>
  );
}
