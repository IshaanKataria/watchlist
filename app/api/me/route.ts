import { json, parseJson, requireUser, route } from "@/lib/http";
import { updateProfile, updateProfileSchema } from "@/services/profiles";

export const PATCH = route(async (req) => {
  const user = await requireUser();
  const update = await parseJson(req, updateProfileSchema);
  return json(await updateProfile(user.id, update));
});
