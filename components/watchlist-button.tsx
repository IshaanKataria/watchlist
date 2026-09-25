"use client";

import { cn } from "cn";
import { CheckIcon, PlusIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { mutate } from "@/lib/api";
import type { EntryState } from "@/services/watchlist.schema";

// Local state is enough after an add: every search and page load reads the entry afresh.
export function WatchlistButton({
  tmdbId,
  entry: listed,
}: {
  tmdbId: number;
  entry: EntryState | null;
}) {
  const [entry, setEntry] = useState(listed);
  const [pending, startTransition] = useTransition();

  function add() {
    startTransition(async () => {
      if (await mutate("POST", "/api/watchlist", { tmdbId })) {
        setEntry({ status: "to_watch", rating: null });
      }
    });
  }

  if (!entry) {
    return (
      <Button onClick={add} disabled={pending} className="h-11 px-4">
        <PlusIcon />
        Add
      </Button>
    );
  }
  return (
    <Link
      href="/watchlist"
      className={cn(buttonVariants({ variant: "outline" }), "h-11 px-4")}
    >
      {entry.status === "to_watch" ? (
        <>
          <CheckIcon />
          In watchlist
        </>
      ) : (
        <>
          Watched
          {entry.rating !== null && (
            <>
              <StarIcon className="fill-current" />
              {entry.rating}
            </>
          )}
        </>
      )}
    </Link>
  );
}
