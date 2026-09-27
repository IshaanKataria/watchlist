import { UsersIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function FeedPage() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Feed</h1>
      <Link href="/members" className={buttonVariants({ variant: "outline" })}>
        <UsersIcon />
        Find members
      </Link>
    </div>
  );
}
