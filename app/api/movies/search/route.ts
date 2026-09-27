import { json, parseQuery, requireUser, route } from "@/lib/http";
import { searchWithEntries } from "@/services/watchlist";
import { searchQuerySchema } from "@/services/watchlist.schema";

export const GET = route(async (req) => {
  const user = await requireUser();
  const { q } = parseQuery(req, searchQuerySchema);
  return json({ results: await searchWithEntries(user.id, q) });
});
