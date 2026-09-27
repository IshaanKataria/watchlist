import type { ComponentProps } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MemberDto } from "@/services/dto";

// alt="" because every caller shows the member's name or handle beside it, or labels the group.
export function MemberAvatar({
  member,
  ...props
}: { member: MemberDto } & ComponentProps<typeof Avatar>) {
  return (
    <Avatar {...props}>
      {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
      <AvatarFallback>
        {[...member.displayName][0]?.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
