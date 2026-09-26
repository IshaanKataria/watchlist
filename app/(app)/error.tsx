"use client";

import { Button } from "@/components/ui/button";

// Renders inside the app shell, so the nav stays usable when a page fails.
export default function AppError({ retry }: { retry: () => void }) {
  return (
    <div
      role="alert"
      className="grid place-items-center gap-4 py-16 text-center"
    >
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        This page couldn&apos;t load. Check your connection and try again.
      </p>
      <Button onClick={retry}>Try again</Button>
    </div>
  );
}
