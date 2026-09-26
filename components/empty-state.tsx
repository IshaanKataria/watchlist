import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";

export function EmptyState({
  children,
  href = "/search",
  label = "Find a film",
}: {
  children: ReactNode;
  href?: string;
  label?: string;
}) {
  return (
    <div className="grid justify-items-start gap-3">
      <p className="text-sm text-muted-foreground">{children}</p>
      <Link href={href} className={buttonVariants({ variant: "outline" })}>
        {label}
      </Link>
    </div>
  );
}
