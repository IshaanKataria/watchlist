"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { mutate } from "@/lib/api";

// Wraps the server-rendered profile (or nothing, before the first one) and shows a skeleton
// in its place while a new profile is written. Failures toast the server's message.
export function GenerateProfile({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children?: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      if (await mutate("POST", "/api/taste-profile")) router.refresh();
    });
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted-foreground">
          {pending ? "Reading your ratings…" : hint}
        </p>
        <Button onClick={generate} disabled={pending} className="h-11 px-5">
          {pending ? "Writing…" : label}
        </Button>
      </div>
      {pending ? <TasteSkeleton /> : children}
    </div>
  );
}

export function TasteSkeleton() {
  return (
    <div className="grid gap-8" aria-hidden>
      <div className="grid max-w-prose gap-2.5">
        <Skeleton className="h-5" />
        <Skeleton className="h-5" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <ul className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="flex gap-4">
            <Skeleton className="aspect-2/3 w-24 shrink-0 rounded-lg" />
            <div className="grid flex-1 content-start gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-11 w-24 rounded-lg" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
