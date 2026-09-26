import { json, requireUser, route } from "@/lib/http";
import { searchMembers } from "@/services/social";
import { memberQuerySchema } from "@/services/social.schema";

export const GET = route(async (req) => {
  await requireUser();
  const { q } = memberQuerySchema.parse(
    Object.fromEntries(new URL(req.url).searchParams),
  );
  return json({ members: await searchMembers(q) });
});
