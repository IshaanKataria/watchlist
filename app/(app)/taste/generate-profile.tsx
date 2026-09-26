"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { mutate } from "@/lib/api";

import { TasteSkeleton } from "./taste-skeleton";

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
