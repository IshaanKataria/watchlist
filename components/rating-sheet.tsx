"use client";

import { useSyncExternalStore, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const DESKTOP = "(min-width: 48rem)";

function subscribe(onChange: () => void) {
  const query = matchMedia(DESKTOP);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// A drawer on phones and a dialog from md up. onSave gets no rating when it is skipped.
export function RatingSheet({
  title,
  open,
  onOpenChange,
  initialRating,
  canSkip,
  onSave,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRating: number | null;
  canSkip: boolean;
  onSave: (rating?: number) => void;
}) {
  const desktop = useSyncExternalStore(
    subscribe,
    () => matchMedia(DESKTOP).matches,
    () => false,
  );

  function save(rating?: number) {
    onOpenChange(false);
    onSave(rating);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save(Number(new FormData(event.currentTarget).get("rating")));
  }

  const heading = `Rate ${title}`;
  const form = (
    <form onSubmit={onSubmit} className="grid gap-4 p-4 md:p-0">
      <fieldset className="grid grid-cols-5 gap-2">
        <legend className="sr-only">Rating out of 10</legend>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <label
            key={n}
            className="grid h-11 cursor-pointer place-items-center rounded-lg border text-sm font-medium tabular-nums transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <input
              type="radio"
              name="rating"
              value={n}
              required
              defaultChecked={n === initialRating}
              className="sr-only"
            />
            {n}
          </label>
        ))}
      </fieldset>
      <div className="grid gap-2 md:flex md:justify-end">
        <Button type="submit" className="h-11 px-6 md:order-last">
          Save
        </Button>
        {canSkip && (
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            onClick={() => save()}
          >
            Skip rating
          </Button>
        )}
      </div>
    </form>
  );

  return desktop ? (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{heading}</DrawerTitle>
        </DrawerHeader>
        {form}
      </DrawerContent>
    </Drawer>
  );
}
