import { ApiError, json, route } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

// Public on purpose: the daily cron's query keeps the free Supabase project from pausing.
export const GET = route(async () => {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").select("handle").limit(1);
  if (error) {
    throw new ApiError(503, "database_unavailable", "Database unreachable");
  }
  return json({ ok: true });
});
