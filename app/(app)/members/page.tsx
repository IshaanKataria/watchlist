import { requireUserId } from "@/lib/supabase/server";
import { listFollowing } from "@/services/social";

import { MemberList } from "./member-list";
import { MemberSearch } from "./member-search";

export default async function MembersPage() {
  await requireUserId();
  const following = await listFollowing();

  return (
    <div className="grid max-w-xl gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
      <MemberSearch>
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">People you follow</h2>
          {following.length > 0 ? (
            <MemberList
              members={following.map((member) => ({
                ...member,
                isFollowing: true,
              }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              You don&apos;t follow anyone yet. Search by name or handle to find
              people.
            </p>
          )}
        </section>
      </MemberSearch>
    </div>
  );
}
