import { requireUser, route } from "@/lib/http";
import { handleSchema } from "@/services/profiles.schema";
import { follow, unfollow } from "@/services/social";

type Context = RouteContext<"/api/follows/[handle]">;

// Both are idempotent: 204 whether or not the edge already existed.
export const PUT = route(async (_req, { params }: Context) => {
  await requireUser();
  await follow(handleSchema.parse((await params).handle));
  return new Response(null, { status: 204 });
});

export const DELETE = route(async (_req, { params }: Context) => {
  await requireUser();
  await unfollow(handleSchema.parse((await params).handle));
  return new Response(null, { status: 204 });
});
