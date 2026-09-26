import { json, requireUser, route } from "@/lib/http";
import { generateTasteProfile } from "@/services/taste";

// Covers the 45s model budget in services/taste.ts plus the TMDB lookups and the save.
export const maxDuration = 60;

export const POST = route(async () => {
  const user = await requireUser();
  return json({ profile: await generateTasteProfile(user.id) });
});
