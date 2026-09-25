import { cn } from "cn";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="grid justify-items-start gap-3">
      <p className="text-sm text-muted-foreground">{children}</p>
      <Link
        href="/search"
        className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}
      >
        Find a film
      </Link>
    </div>
  );
}
