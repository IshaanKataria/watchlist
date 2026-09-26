import { FollowButton } from "@/components/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { MemberResult } from "@/services/dto";

export function MemberList({ members }: { members: MemberResult[] }) {
  return (
    <ul className="grid gap-4">
      {members.map((member) => (
        <li key={member.handle} className="flex items-center gap-3">
          <Avatar size="lg">
            {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
            <AvatarFallback>
              {[...member.displayName][0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{member.displayName}</p>
            <p className="truncate text-sm text-muted-foreground">
              @{member.handle}
            </p>
          </div>
          <FollowButton
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
