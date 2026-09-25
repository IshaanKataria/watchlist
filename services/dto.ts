import type { Tables } from "@/lib/supabase/database.types";

export function toMemberDto(
  profile: Pick<Tables<"profiles">, "handle" | "display_name" | "avatar_url">,
) {
  return {
    handle: profile.handle,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
  };
}

export type MemberDto = ReturnType<typeof toMemberDto>;
