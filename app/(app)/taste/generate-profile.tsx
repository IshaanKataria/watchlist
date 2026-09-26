"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { mutate } from "@/lib/api";

import { TasteSkeleton } from "./taste-skeleton";

// Wraps the server-rendered profile (or nothing, before the first one) and shows a skeleton
// in its place while a new profile is written. Failures toast the server's message.
export function GenerateProfile({
  label,
  hint,
  cooldown,
  children,
}: {
  label: string;
  hint: string;
  cooldown?: { seconds: number; label: string } | null;
  children?: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // The page is server-rendered, so a timer here re-enables the button when the cooldown ends.
  const [wait, setWait] = useState(cooldown?.label ?? null);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setWait(null), cooldown.seconds * 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function generate() {
    startTransition(async () => {
      if (await mutate("POST", "/api/taste-profile")) router.refresh();
    });
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted-foreground">
          {pending
            ? "Reading your ratings…"
            : wait
              ? `${hint} You can regenerate ${wait}.`
              : hint}
        </p>
        <Button onClick={generate} disabled={pending || wait !== null}>
          {pending ? "Writing…" : label}
        </Button>
      </div>
      {pending ? <TasteSkeleton /> : children}
    </div>
  );
}
