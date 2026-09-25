import { json, requireUser, route } from "@/lib/http";
import { searchMovies, searchQuerySchema } from "@/lib/tmdb";

export const GET = route(async (req) => {
  await requireUser();
  const { q } = searchQuerySchema.parse(
    Object.fromEntries(new URL(req.url).searchParams),
  );
  return json({ results: await searchMovies(q) });
});
