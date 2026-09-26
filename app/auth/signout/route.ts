import { NextResponse } from "next/server";

import { createClient, getUserId } from "@/lib/supabase/server";
import { getProfile } from "@/services/profiles";

// Only for sessions whose user was deleted. Anyone with a profile is sent back unchanged,
// so a cross-site link to this GET can't sign a member out.
export async function GET(req: Request) {
  const userId = await getUserId();
  if (userId && (await getProfile(userId))) {
    return NextResponse.redirect(new URL("/search", req.url));
  }
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(new URL("/login", req.url));
}
