import { json, requireUser, route } from "@/lib/http";
import { searchWithEntries } from "@/services/watchlist";
import { searchQuerySchema } from "@/services/watchlist.schema";

export const GET = route(async (req) => {
  const user = await requireUser();
  const { q } = searchQuerySchema.parse(
    Object.fromEntries(new URL(req.url).searchParams),
  );
  return json({ results: await searchWithEntries(user.id, q) });
});
