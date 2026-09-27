import { UsersIcon } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { requireUserId } from "@/lib/supabase/server";
import { getFeed } from "@/services/social";

import { FeedList } from "./feed-list";
import { FeedRow } from "./feed-row";

export default async function FeedPage() {
  await requireUserId();
  const feed = await getFeed();

  return (
    <div className="grid max-w-2xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Feed</h1>
        <Link
          href="/members"
          className={buttonVariants({ variant: "outline" })}
        >
          <UsersIcon />
          Find members
        </Link>
      </div>
      {feed.items.length > 0 ? (
        // Keyed on the cursor: a fresh first page (tapping Feed again) must drop pages loaded after
        // the old one, or a row is skipped or shown twice.
        <FeedList key={feed.nextCursor} cursor={feed.nextCursor}>
          {feed.items.map((item) => (
            <FeedRow
              key={`${item.member.handle} ${item.movie.tmdbId}`}
              item={item}
            />
          ))}
        </FeedList>
      ) : (
        <EmptyState href="/members" label="Find people to follow">
          When people you follow watch a film, it shows up here.
        </EmptyState>
      )}
    </div>
  );
}
