"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main className="grid flex-1 place-content-center p-6 text-center">
      <div role="alert" className="grid gap-4">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          This page couldn&apos;t load. Check your connection and try again.
        </p>
        <Button onClick={retry} className="mx-auto">
          Try again
        </Button>
      </div>
    </main>
  );
}
