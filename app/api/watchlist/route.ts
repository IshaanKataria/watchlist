import { json, parseJson, requireUser, route } from "@/lib/http";
import { addEntry } from "@/services/watchlist";
import { addEntrySchema } from "@/services/watchlist.schema";

export const POST = route(async (req) => {
  const user = await requireUser();
  const { tmdbId } = await parseJson(req, addEntrySchema);
  return json(await addEntry(user.id, tmdbId), 201);
});
