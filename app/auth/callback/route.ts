import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Google sends the user back with a one-time code; exchanging it writes the session cookies.
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/search", req.url));
  }
  return NextResponse.redirect(new URL("/login?error=oauth", req.url));
}
