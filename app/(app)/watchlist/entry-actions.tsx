"use client";

import { EllipsisVerticalIcon, Trash2Icon, Undo2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { RatingSheet } from "@/components/rating-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mutate } from "@/lib/api";
import type { WatchlistItem } from "@/services/dto";

export function EntryActions({ entry }: { entry: WatchlistItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rateOpen, setRateOpen] = useState(false);
  const path = `/api/watchlist/${entry.tmdbId}`;

  // The lists are server-rendered, so a refresh moves the card once the API agrees.
  function run(request: () => Promise<boolean>, onDone?: () => void) {
    startTransition(async () => {
      if (!(await request())) return;
      onDone?.();
      router.refresh();
    });
  }

  // Undo re-adds the film and re-applies its rating. The server stamps fresh added_at and
  // watched_at (members can't write either), so it returns at the top of its tab.
  async function restore() {
    const added = await mutate("POST", "/api/watchlist", {
      tmdbId: entry.tmdbId,
    });
    if (!added || entry.status === "to_watch") return added;
    return mutate("PATCH", path, {
      status: "watched",
      rating: entry.rating ?? undefined,
    });
  }

  function remove() {
    run(
      () => mutate("DELETE", path),
      () =>
        toast(`Removed ${entry.title}`, {
          action: { label: "Undo", onClick: () => run(restore) },
        }),
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        disabled={pending}
        onClick={() => setRateOpen(true)}
        className="flex-1 px-2"
      >
        {entry.status === "watched" ? "Change rating" : "Mark watched"}
        <span className="sr-only">, {entry.title}</span>
      </Button>
      <RatingSheet
        title={entry.title}
        open={rateOpen}
        onOpenChange={setRateOpen}
        initialRating={entry.rating}
        canSkip={entry.status === "to_watch"}
        onSave={(value) =>
          run(() => mutate("PATCH", path, { status: "watched", rating: value }))
        }
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={pending}
          render={
            <Button
              variant="outline"
              size="icon"
              aria-label={`More actions for ${entry.title}`}
            />
          }
        >
          <EllipsisVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-52">
          {entry.status === "watched" && (
            <DropdownMenuItem
              onClick={() =>
                run(() => mutate("PATCH", path, { status: "to_watch" }))
              }
            >
              <Undo2Icon />
              Move back to watchlist
            </DropdownMenuItem>
          )}
          <DropdownMenuItem variant="destructive" onClick={remove}>
            <Trash2Icon />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
