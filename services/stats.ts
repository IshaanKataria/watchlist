import { createClient } from "@/lib/supabase/server";

import { statsSchema } from "./dto";

export async function getStats(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("user_stats", { target: userId })
    .throwOnError();
  return statsSchema.parse(data);
}
