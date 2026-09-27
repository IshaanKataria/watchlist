import { json, parseJson, requireUser, route } from "@/lib/http";
import { updateProfile } from "@/services/profiles";
import { updateProfileSchema } from "@/services/profiles.schema";

export const PATCH = route(async (req) => {
  const user = await requireUser();
  const update = await parseJson(req, updateProfileSchema);
  return json(await updateProfile(user.id, update));
});
