import { json, parseQuery, requireUser, route } from "@/lib/http";
import { getFeed } from "@/services/social";
import { feedQuerySchema } from "@/services/social.schema";

export const GET = route(async (req) => {
  await requireUser();
  const { before } = parseQuery(req, feedQuerySchema);
  return json(await getFeed(before));
});
