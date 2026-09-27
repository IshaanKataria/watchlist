import { requireUserId } from "@/lib/supabase/server";
import { getProfile } from "@/services/profiles";

import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const me = await getProfile(await requireUserId());

  return (
    <div className="grid max-w-sm gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      {/* A missing profile is signed out by the (app) layout. Keyed so a save remounts the form
          with the new values: the inputs are uncontrolled and keep their first defaults. */}
      {me && <SettingsForm key={`${me.handle} ${me.displayName}`} me={me} />}
    </div>
  );
}
