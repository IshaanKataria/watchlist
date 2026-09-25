import { json, requireUser, route } from "@/lib/http";
import { searchQuerySchema } from "@/lib/tmdb";
import { searchWithEntries } from "@/services/watchlist";

export const GET = route(async (req) => {
  const user = await requireUser();
  const { q } = searchQuerySchema.parse(
    Object.fromEntries(new URL(req.url).searchParams),
  );
  return json({ results: await searchWithEntries(user.id, q) });
});
