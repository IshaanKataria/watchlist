import Link from "next/link";
import { notFound } from "next/navigation";

import { FollowButton } from "@/components/follow-button";
import { MemberAvatar } from "@/components/member-avatar";
import { PosterGrid } from "@/components/poster-grid";
import { GenreBars, StatTiles } from "@/components/stats";
import { buttonVariants } from "@/components/ui/button";
import { requireUserId } from "@/lib/supabase/server";
import type { Stats, TasteMatch, WatchedFilm } from "@/services/dto";
import { handleSchema } from "@/services/profiles.schema";
import { getMember } from "@/services/social";

export default async function MemberPage({ params }: PageProps<"/u/[handle]">) {
  await requireUserId();
  const handle = handleSchema.safeParse((await params).handle);
  if (!handle.success) notFound();
  const member = await getMember(handle.data);
  if (!member) notFound();

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-center gap-4">
        <MemberAvatar member={member} className="size-16" />
        <div className="grid min-w-0 flex-1 gap-0.5">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {member.displayName}
          </h1>
          <p className="truncate text-muted-foreground">@{member.handle}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {member.followerCount}
            </span>{" "}
            {member.followerCount === 1 ? "follower" : "followers"} ·{" "}
            <span className="font-medium text-foreground tabular-nums">
              {member.followingCount}
            </span>{" "}
            following
          </p>
          {member.tasteMatch && <TasteMatchLine match={member.tasteMatch} />}
        </div>
        {/* Its own row on phones, so the name and counts keep the width. */}
        <div className="w-full sm:w-auto">
          {member.isSelf ? (
            <Link
              href="/settings"
              className={buttonVariants({ variant: "outline" })}
            >
              Edit profile
            </Link>
          ) : (
            // Keyed so the refresh after a follow remounts it with the server's answer.
            <FollowButton
              key={String(member.isFollowing)}
              handle={member.handle}
              initialFollowing={member.isFollowing}
            />
          )}
        </div>
      </header>
      <Films
        handle={member.handle}
        stats={member.stats}
        watched={member.watched}
      />
    </div>
  );
}

// tasteMatch is null unless the caller follows this member, so it never shows on your own page.
function TasteMatchLine({ match }: { match: TasteMatch }) {
  if (match.matchPercent === null) {
    return (
      <p className="text-sm text-muted-foreground">
        Rate 3 films in common to see your taste match ({match.sharedCount} so
        far)
      </p>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-medium text-primary tabular-nums">
        {match.matchPercent}%
      </span>{" "}
      taste match ·{" "}
      <span className="font-medium text-foreground tabular-nums">
        {match.sharedCount}
      </span>{" "}
      films in common
    </p>
  );
}

// stats is null unless the database let the caller see this member's films: themselves or someone they follow.
function Films({
  handle,
  stats,
  watched,
}: {
  handle: string;
  stats: Stats | null;
  watched: WatchedFilm[];
}) {
  if (!stats) {
    return (
      <p className="text-sm text-muted-foreground">
        Follow @{handle} to see their films.
      </p>
    );
  }
  if (stats.watchedCount === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nothing watched yet.</p>
    );
  }
  return (
    <>
      <StatTiles stats={stats} />
      {stats.genres.length > 0 && (
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">Top genres</h2>
          <GenreBars genres={stats.genres.slice(0, 5)} />
        </section>
      )}
      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">Watched</h2>
        <PosterGrid
          movies={watched}
          chip={(film) => (film.rating ? String(film.rating) : null)}
        />
      </section>
    </>
  );
}
