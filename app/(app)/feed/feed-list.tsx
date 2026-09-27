"use client";

import { useState, useTransition, type ReactNode } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api";
import { feedItemSchema, type FeedItem as Item } from "@/services/dto";

import { FeedItem } from "./feed-item";

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
  const [older, setOlder] = useState<Item[]>([]);
  const [next, setNext] = useState(cursor);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function loadMore(before: string) {
    startTransition(async () => {
      const res = await fetch(
        `/api/feed?${new URLSearchParams({ before })}`,
      ).catch(() => null);
      const body: unknown = await res?.json().catch(() => null);
      const page = pageSchema.safeParse(body);
      if (!res?.ok || !page.success) {
        setError(errorMessage(body));
        return;
      }
      setError(null);
      setOlder((items) => [...items, ...page.data.items]);
      setNext(page.data.nextCursor);
    });
  }

  return (
    <div className="grid gap-4">
      <ol className="divide-y">
        {children}
        {older.map((item) => (
          <FeedItem
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
