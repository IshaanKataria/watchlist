import { StarIcon } from "lucide-react";
import Link from "next/link";

import { MemberAvatar } from "@/components/member-avatar";
import { TmdbImage } from "@/components/tmdb-image";
import type { FeedItem as Item } from "@/services/dto";

const LINK =
  "rounded-sm font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50";

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// Largest first. A month is 30 days: close enough for "3 months ago".
const UNITS = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
] as const;

function timeAgo(iso: string) {
  const seconds = (Date.parse(iso) - Date.now()) / 1000;
  const match = UNITS.find(([, size]) => -seconds >= size);
  return match
    ? relative.format(Math.trunc(seconds / match[1]), match[0])
    : relative.format(0, "second");
}

export function FeedItem({ item }: { item: Item }) {
  const { member, movie, rating } = item;
  const film = `/movie/${movie.tmdbId}`;

  return (
    <li className="flex items-center gap-3 py-3">
      <MemberAvatar member={member} size="lg" />
      <div className="grid min-w-0 flex-1 gap-1 text-sm">
        <p className="text-pretty">
          <Link href={`/u/${member.handle}`} className={LINK}>
            @{member.handle}
          </Link>
          {rating === null ? " watched " : " rated "}
          <Link href={film} className={LINK}>
            {movie.title}
          </Link>
        </p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          {rating !== null && (
            <span className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-medium text-foreground tabular-nums">
              <StarIcon className="size-3 fill-current" />
              {rating}
              <span className="sr-only"> out of 10</span>
            </span>
          )}
          <time dateTime={item.watchedAt}>{timeAgo(item.watchedAt)}</time>
        </p>
      </div>
      {/* The title link is the keyboard path; the poster is only a bigger target for a finger. */}
      <Link
        href={film}
        tabIndex={-1}
        aria-hidden
        className="relative aspect-2/3 w-12 shrink-0 overflow-hidden rounded-md bg-muted"
      >
        <TmdbImage path={movie.posterPath} size="w185" />
      </Link>
    </li>
  );
}
