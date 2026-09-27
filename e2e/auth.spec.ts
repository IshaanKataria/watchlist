import { expect, test } from "@playwright/test";

// Before the page hydrates, the login form submits natively, as it does here with JavaScript off.
// It must post: a GET puts the email and password in the URL, the history and request logs.
test.use({ javaScriptEnabled: false });

test("a login sent before JavaScript runs keeps the credentials out of the URL", async ({
  page,
}) => {
  const email = "nojs-check@example.com";
  const password = "not-a-real-secret";
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  const submitted = page.waitForRequest(
    (req) => req.isNavigationRequest() && req.url().includes("/login"),
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const request = await submitted;
  await page.waitForLoadState();

  expect(request.method()).toBe("POST");
  for (const url of [request.url(), page.url()]) {
    for (const secret of [email, encodeURIComponent(email), password]) {
      expect(url).not.toContain(secret);
    }
  }
});
