import { test as setup } from "@playwright/test";

import {
  authFile,
  createAccount,
  deleteE2eAccounts,
  DEMO,
  E2E_HANDLES,
  emailOf,
  signIn,
} from "./accounts";

setup("create the e2e accounts", async () => {
  // A run that crashed before its teardown leaves them behind.
  await deleteE2eAccounts();
  for (const handle of E2E_HANDLES) await createAccount(handle);
});

setup("sign in demo", async ({ page }) => {
  await signIn(page, DEMO.email, DEMO.password);
  await page.context().storageState({ path: authFile("demo") });
});

for (const handle of ["e2e_viewer", "e2e_stranger"]) {
  setup(`sign in ${handle}`, async ({ page }) => {
    await signIn(page, emailOf(handle));
    await page.context().storageState({ path: authFile(handle) });
  });
}
