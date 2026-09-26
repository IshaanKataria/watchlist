"use client";

import { LogOutIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { MemberDto } from "@/services/dto";

export function UserMenu({ me }: { me: MemberDto }) {
  const router = useRouter();

  async function signOut() {
    // Local scope: signing out here must not end the shared demo account's other sessions.
    const { error } = await createClient().auth.signOut({ scope: "local" });
    if (error) {
      toast.error("Couldn't sign out. Try again.");
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="flex h-16 items-center justify-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:ml-auto md:size-11 md:rounded-full"
      >
        <Avatar>
          {me.avatarUrl && <AvatarImage src={me.avatarUrl} alt="" />}
          <AvatarFallback>
            {[...me.displayName][0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block text-sm text-foreground">
              {me.displayName}
            </span>
            @{me.handle}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/members" />}>
          <UsersIcon />
          Find members
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void signOut()}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
