import { cn } from "cn";

import { MemberAvatar } from "@/components/member-avatar";
import type { MemberDto } from "@/services/dto";

const list = new Intl.ListFormat("en");

// Three faces at most, then a count. The label names everyone, since the faces say nothing to a
// screen reader.
export function FriendsAvatars({
  friends,
  className,
}: {
  friends: MemberDto[];
  className?: string;
}) {
  const more = friends.length - 3;
  return (
    <span
      role="img"
      aria-label={`Watched by ${list.format(friends.map((friend) => `@${friend.handle}`))}`}
      className={cn("flex items-center -space-x-2", className)}
    >
      {friends.slice(0, 3).map((friend) => (
        <MemberAvatar
          key={friend.handle}
          member={friend}
          size="sm"
          className="ring-2 ring-background"
        />
      ))}
      {more > 0 && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-muted px-1 text-xs font-medium tabular-nums ring-2 ring-background">
          +{more}
        </span>
      )}
    </span>
  );
}
