import { json, requireUser, route } from "@/lib/http";
import { searchMovies, searchQuerySchema } from "@/lib/tmdb";
import { withEntries } from "@/services/watchlist";

export const GET = route(async (req) => {
  const user = await requireUser();
  const { q } = searchQuerySchema.parse(
    Object.fromEntries(new URL(req.url).searchParams),
  );
  return json({ results: await withEntries(user.id, await searchMovies(q)) });
});
