import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = ["/login", "/auth/"];

function redirectTarget(pathname: string, signedIn: boolean) {
  if (!signedIn && !PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return "/login";
  }
  if (signedIn && pathname === "/login") return "/search";
  return null;
}

export async function updateSession(request: NextRequest) {
  const cookiesToSet: Parameters<SetAllCookies>[0] = [];
  const cacheHeaders: Parameters<SetAllCookies>[1] = {};

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookies, headers) {
          cookies.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.push(...cookies);
          Object.assign(cacheHeaders, headers);
        },
      },
    },
  );

  // Verifies the JWT and refreshes an expired session. Nothing may run
  // between creating the client and this call.
  const { data } = await supabase.auth.getClaims();

  // Built after getClaims() so the forwarded request carries refreshed cookies.
  const target = redirectTarget(request.nextUrl.pathname, data !== null);
  const response = target
    ? NextResponse.redirect(new URL(target, request.url))
    : NextResponse.next({ request });

  // The cache headers stop a CDN serving one user's session cookie to another.
  cookiesToSet.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options),
  );
  Object.entries(cacheHeaders).forEach(([key, value]) =>
    response.headers.set(key, value),
  );
  return response;
}
