import { createClient } from "@supabase/supabase-js";

// Published in the README as the demo login.
const PASSWORD = "watchlist-demo";

const MEMBERS = [
  { handle: "demo", name: "Demo Viewer" },
  { handle: "sam", name: "Sam Rivera" },
  { handle: "mira", name: "Mira Chen" },
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// The signup trigger turns user_metadata into each profile, so rerunning only skips existing emails.
for (const { handle, name } of MEMBERS) {
  const { error } = await supabase.auth.admin.createUser({
    email: `${handle}@example.com`,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: {
      user_name: handle,
      full_name: name,
      avatar_url: `https://api.dicebear.com/9.x/notionists/svg?seed=${handle}`,
    },
  });
  if (error && error.code !== "email_exists") throw error;
  console.log(`${handle}: ${error ? "already exists" : "created"}`);
}
