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
    <div className="grid justify-items-center gap-4 rounded-xl border border-dashed px-6 py-10 text-center">
      <p className="max-w-sm text-sm text-balance text-muted-foreground">
        {children}
      </p>
      <Link href={href} className={buttonVariants()}>
        {label}
      </Link>
    </div>
  );
}
