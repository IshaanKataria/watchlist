import Link from "next/link";

import { FollowButton } from "@/components/follow-button";
import { MemberAvatar } from "@/components/member-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { MemberResult } from "@/services/dto";

export function MemberList({ members }: { members: MemberResult[] }) {
  return (
    <ul className="grid gap-4">
      {members.map((member) => (
        <li key={member.handle} className="flex items-center gap-3">
          <Link
            href={`/u/${member.handle}`}
            className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <MemberAvatar member={member} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-medium">{member.displayName}</p>
              <p className="truncate text-sm text-muted-foreground">
                @{member.handle}
              </p>
            </div>
          </Link>
          {/* Keyed on the server's answer: a repeated search first shows its last results, then
              fresh ones, which must replace any state a button kept from before. */}
          <FollowButton
            key={String(member.isFollowing)}
            handle={member.handle}
            initialFollowing={member.isFollowing}
          />
        </li>
      ))}
    </ul>
  );
}

export function MemberListSkeleton() {
  return (
    <ul className="grid gap-4" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-11 w-24 rounded-lg" />
        </li>
      ))}
    </ul>
  );
}
