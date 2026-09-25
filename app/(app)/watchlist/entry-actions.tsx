"use client";

import { EllipsisVerticalIcon, Trash2Icon, Undo2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

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
  const path = `/api/watchlist/${entry.tmdbId}`;

  // The lists are server-rendered, so a refresh moves the card once the API agrees.
  function run(request: () => Promise<boolean>, onDone?: () => void) {
    startTransition(async () => {
      if (!(await request())) return;
      onDone?.();
      router.refresh();
    });
  }

  // Undo re-adds the film and, if it was watched, restores its rating.
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
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={pending}
          render={
            <Button
              variant="outline"
              size="icon"
              aria-label={`More actions for ${entry.title}`}
              className="ml-auto size-11"
            />
          }
        >
          <EllipsisVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-52">
          {entry.status === "watched" && (
            <DropdownMenuItem
              className="h-11"
              onClick={() =>
                run(() => mutate("PATCH", path, { status: "to_watch" }))
              }
            >
              <Undo2Icon />
              Move back to watchlist
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            className="h-11"
            onClick={remove}
          >
            <Trash2Icon />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
