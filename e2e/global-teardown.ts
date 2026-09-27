import { execFileSync } from "node:child_process";

import { deleteE2eAccounts } from "./accounts";

// localhost and production share one Supabase project, so every run ends by restoring the state
// the README's demo login describes.
export default async function globalTeardown() {
  try {
    await deleteE2eAccounts();
  } finally {
    execFileSync("pnpm", ["seed"], { stdio: "inherit" });
  }
}
