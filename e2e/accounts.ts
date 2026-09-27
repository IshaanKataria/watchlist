import { expect, type Locator, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

// Service role, like scripts/seed.mts: accounts and fixture rows are set up outside the app.
export const admin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export const DEMO = { email: "demo@example.com", password: "watchlist-demo" };

// Created by auth.setup.ts and deleted by global-teardown.ts, which removes every e2e_ account.
export const E2E_HANDLES = ["e2e_viewer", "e2e_stranger", "e2e_friend"];
const PASSWORD = "watchlist-e2e";

export const emailOf = (handle: string) => `${handle}@example.com`;
export const authFile = (handle: string) => `e2e/.auth/${handle}.json`;

export async function createAccount(handle: string) {
  const { error } = await admin.auth.admin.createUser({
    email: emailOf(handle),
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { user_name: handle, full_name: `E2E ${handle.slice(4)}` },
  });
  if (error) throw error;
}

export async function deleteE2eAccounts() {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  for (const user of data.users) {
    if (!user.email?.startsWith("e2e_")) continue;
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  }
}

export async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  const submit = page.getByRole("button", { name: "Sign in", exact: true });
  await hydrated(submit);
  await submit.click();
  await page.waitForURL("**/search");
}

// React tags each element once it hydrates it. Typing into or clicking a server-rendered control
// before then never reaches the app, and the dev server can take seconds to get there.
export async function hydrated(control: Locator) {
  await expect
    .poll(() =>
      control.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith("__reactProps")),
      ),
    )
    .toBe(true);
}

export async function profileId(handle: string) {
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("handle", handle)
    .single()
    .throwOnError();
  return data.id;
}

export async function entriesOf(handle: string) {
  const { data } = await admin
    .from("watchlist_entries")
    .select("tmdb_id, status, rating")
    .eq("user_id", await profileId(handle))
    .throwOnError();
  return data;
}
