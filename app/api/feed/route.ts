import { json, requireUser, route } from "@/lib/http";
import { getFeed } from "@/services/social";
import { feedQuerySchema } from "@/services/social.schema";

export const GET = route(async (req) => {
  await requireUser();
  const { before } = feedQuerySchema.parse(
    Object.fromEntries(new URL(req.url).searchParams),
  );
  return json(await getFeed(before));
});
