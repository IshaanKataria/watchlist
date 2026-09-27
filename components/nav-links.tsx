"use client";

import {
  BookmarkIcon,
  ChartColumnIcon,
  RssIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/search", label: "Search", Icon: SearchIcon },
  { href: "/watchlist", label: "Watchlist", Icon: BookmarkIcon },
  { href: "/feed", label: "Feed", Icon: RssIcon },
  { href: "/stats", label: "Stats", Icon: ChartColumnIcon },
  { href: "/taste", label: "Taste", Icon: SparklesIcon },
];

// Below md the active pill wraps the icon, from md up the whole link.
export function NavLinks() {
  const pathname = usePathname();

  return LINKS.map(({ href, label, Icon }) => (
    <Link
      key={href}
      href={href}
      aria-current={pathname.startsWith(href) ? "page" : undefined}
      className="group flex h-16 min-w-0 flex-col items-center justify-center gap-1 text-[0.6875rem] text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:text-primary md:h-11 md:flex-row md:gap-2 md:rounded-md md:px-3 md:text-sm md:aria-[current=page]:bg-primary/10"
    >
      <span className="flex h-7 w-12 items-center justify-center rounded-full group-aria-[current=page]:bg-primary/10 md:contents">
        <Icon className="size-5 md:size-4" />
      </span>
      {label}
    </Link>
  ));
}
