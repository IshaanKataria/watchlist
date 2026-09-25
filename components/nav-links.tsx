"use client";

import {
  BookmarkIcon,
  ChartColumnIcon,
  RssIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/search", label: "Search", Icon: SearchIcon },
  { href: "/watchlist", label: "Watchlist", Icon: BookmarkIcon },
  { href: "/feed", label: "Feed", Icon: RssIcon },
  { href: "/stats", label: "Stats", Icon: ChartColumnIcon },
];

export function NavLinks() {
  const pathname = usePathname();

  return LINKS.map(({ href, label, Icon }) => (
    <Link
      key={href}
      href={href}
      aria-current={pathname.startsWith(href) ? "page" : undefined}
      className="flex h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:text-foreground md:h-11 md:flex-row md:rounded-md md:px-3 md:text-sm md:aria-[current=page]:bg-muted"
    >
      <Icon className="size-5 md:hidden" />
      {label}
    </Link>
  ));
}
