import { json, parseQuery, requireUser, route } from "@/lib/http";
import { searchMembers } from "@/services/social";
import { memberQuerySchema } from "@/services/social.schema";

export const GET = route(async (req) => {
  await requireUser();
  const { q } = parseQuery(req, memberQuerySchema);
  return json({ members: await searchMembers(q) });
});
