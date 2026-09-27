import { expect, test, type APIRequestContext } from "@playwright/test";

import { authFile, hydrated, setWatched } from "./accounts";

test.use({ storageState: authFile("e2e_viewer") });

// Each test starts and ends following nobody under its own handle, whatever a failure left.
async function reset(request: APIRequestContext) {
  for (const handle of ["sam", "e2e_friend"]) {
    await request.delete(`/api/follows/${handle}`);
  }
  await request.patch("/api/me", { data: { handle: "e2e_viewer" } });
}
test.beforeEach(({ page }) => reset(page.request));
test.afterEach(({ page }) => reset(page.request));

test("follow from search, see them in the feed and on their page, unfollow", async ({
  page,
}) => {
  await page.goto("/members");
  const search = page.getByRole("searchbox", { name: "Search members" });
  const follow = page.getByRole("button", { name: /^Follow\W+@sam$/ });
  await hydrated(search);
  await search.fill("sam");
  // The button flips before the server answers, so wait for the answer before leaving the page.
  const followed = page.waitForResponse(
    (res) =>
      res.url().endsWith("/api/follows/sam") &&
      res.request().method() === "PUT",
  );
  await follow.click();
  expect((await followed).status()).toBe(204);

  // Through the nav, as a member would: a goto here would cut across the button's refresh.
  await page.getByRole("link", { name: "Feed", exact: true }).click();
  await page.getByRole("link", { name: "@sam" }).first().click();
  await expect(page).toHaveURL(/\/u\/sam$/);
  await expect(page.getByRole("heading", { name: "Watched" })).toBeVisible();

  const following = page.getByRole("button", { name: /^Following\W+@sam$/ });
  await hydrated(following);
  await following.click();
  await expect(page.getByText("Follow @sam to see their films.")).toBeVisible();
});

test("a new handle keeps the people you follow", async ({ page }) => {
  expect((await page.request.put("/api/follows/sam")).status()).toBe(204);
  const rename = await page.request.patch("/api/me", {
    data: { handle: "e2e_renamed" },
  });
  expect(await rename.json()).toMatchObject({ handle: "e2e_renamed" });

  await page.goto("/members");
  await expect(page.getByText("@sam", { exact: true })).toBeVisible();
});

test("Load more appends the older page once, with no repeats", async ({
  page,
}) => {
  expect((await page.request.put("/api/follows/e2e_friend")).status()).toBe(
    204,
  );
  const rows = page.locator("main ol > li");
  const loadMore = page.getByRole("button", { name: "Load more" });

  // Exactly one page: nothing older, so no button.
  await setWatched("e2e_friend", 30);
  await page.goto("/feed");
  await expect(rows).toHaveCount(30);
  await expect(loadMore).toHaveCount(0);

  await setWatched("e2e_friend", 35);
  await page.reload();
  await expect(rows).toHaveCount(30);
  await hydrated(loadMore);
  await loadMore.click();
  await expect(rows).toHaveCount(35);
  await expect(loadMore).toHaveCount(0);
  const films = await rows
    .locator('a[href^="/movie/"]:not([aria-hidden])')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(new Set(films).size).toBe(35);
  await expect(rows.filter({ hasNotText: "@e2e_friend" })).toHaveCount(0);
});
