import { json, parseJson, requireUser, route } from "@/lib/http";
import { removeEntry, updateEntry } from "@/services/watchlist";
import {
  tmdbIdParamSchema,
  updateEntrySchema,
} from "@/services/watchlist.schema";

type Context = RouteContext<"/api/watchlist/[tmdbId]">;

export const PATCH = route(async (req, { params }: Context) => {
  const user = await requireUser();
  const tmdbId = tmdbIdParamSchema.parse((await params).tmdbId);
  const update = await parseJson(req, updateEntrySchema);
  return json(await updateEntry(user.id, tmdbId, update));
});

export const DELETE = route(async (_req, { params }: Context) => {
  const user = await requireUser();
  await removeEntry(user.id, tmdbIdParamSchema.parse((await params).tmdbId));
  return new Response(null, { status: 204 });
});
