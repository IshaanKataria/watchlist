import Link from "next/link";
import { redirect } from "next/navigation";

import { NavLinks } from "@/components/nav-links";
import { UserMenu } from "@/components/user-menu";
import { requireUserId } from "@/lib/supabase/server";
import { getProfile } from "@/services/profiles";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const me = await getProfile(await requireUserId());
  // A still-valid session whose user was deleted: its cookies must be cleared, or the proxy
  // bounces /login straight back here.
  if (!me) redirect("/auth/signout");

  return (
    <>
      <header className="md:sticky md:top-0 md:z-40 md:border-b md:bg-background/95 md:backdrop-blur">
        {/* One nav: a bottom tab bar on phones, the top bar from md up. */}
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:static md:mx-auto md:flex md:h-14 md:max-w-6xl md:items-center md:gap-1 md:border-0 md:bg-transparent md:px-4 md:pb-0 md:backdrop-blur-none"
        >
          <Link
            href="/search"
            aria-label="Watchlist home"
            className="mr-4 hidden h-11 items-center font-semibold tracking-tight md:flex"
          >
            Watchlist
          </Link>
          <NavLinks />
          <UserMenu me={me} />
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-24 md:pb-10">
        {children}
      </main>
    </>
  );
}
