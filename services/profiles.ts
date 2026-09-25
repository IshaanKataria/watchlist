import { createClient } from "@/lib/supabase/server";

import { toMemberDto } from "./dto";

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("handle, display_name, avatar_url")
    .eq("id", userId)
    .single()
    .throwOnError();
  return toMemberDto(data);
}
