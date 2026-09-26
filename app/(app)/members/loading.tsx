import { Skeleton } from "@/components/ui/skeleton";

import { MemberListSkeleton } from "./member-list";

export default function MembersLoading() {
  return (
    <div className="grid max-w-xl gap-6" aria-busy>
      <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
      <Skeleton className="h-11 w-full rounded-lg" />
      <MemberListSkeleton />
    </div>
  );
}
