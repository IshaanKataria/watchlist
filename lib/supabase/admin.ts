import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

// Service role: bypasses RLS. Only services/ may use it, to write tables members can read but
// never write: the shared movie cache (movies.ts) and taste profiles (taste.ts).
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
