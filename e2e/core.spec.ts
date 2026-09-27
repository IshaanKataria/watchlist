import { expect, test } from "@playwright/test";

import { DEMO, hydrated, signIn } from "./accounts";

// On no seeded list, so demo's list is back to its seed once the test removes it.
const FILM = { tmdbId: 346648, title: "Paddington 2" };

test("demo adds a film, rates it, sees it in stats and removes it", async ({
  page,
}) => {
  await signIn(page, DEMO.email, DEMO.password);
  // A run that failed halfway may have left it listed; 404 otherwise.
  await page.request.delete(`/api/watchlist/${FILM.tmdbId}`);

  const tile = (label: string) =>
    page
      .locator("dl > div")
      .filter({ has: page.getByText(label, { exact: true }) })
      .locator("dd")
      .first();
  await page.goto("/stats");
  const watched = Number(await tile("Watched").innerText());
  const rated = Number(await tile("Rated").innerText());

  // Each button names the film in hidden text after its label, so it matches by the label alone.
  const card = page.locator("li", {
    has: page.locator(`a[href="/movie/${FILM.tmdbId}"]`),
  });
  await page.goto("/search");
  const search = page.getByRole("searchbox", { name: "Search films" });
  await hydrated(search);
  await search.fill(FILM.title);
  await card.getByRole("button", { name: /^Add\b/ }).click();
  await expect(
    card.getByRole("link", { name: /^In watchlist\b/ }),
  ).toBeVisible();

  await page.goto("/watchlist");
  const markWatched = card.getByRole("button", { name: /^Mark watched\b/ });
  await hydrated(markWatched);
  await markWatched.click();
  const sheet = page.getByRole("dialog", { name: `Rate ${FILM.title}` });
  await sheet.locator("label", { hasText: /^8$/ }).click();
  await sheet.getByRole("button", { name: "Save" }).click();
  await page.getByRole("tab", { name: /^Watched/ }).click();
  await expect(
    card.getByRole("button", { name: /^Change rating\b/ }),
  ).toBeVisible();

  await page.goto("/stats");
  await expect(tile("Watched")).toHaveText(String(watched + 1));
  await expect(tile("Rated")).toHaveText(String(rated + 1));

  await page.goto("/watchlist");
  const watchedTab = page.getByRole("tab", { name: /^Watched/ });
  await hydrated(watchedTab);
  await watchedTab.click();
  await card
    .getByRole("button", { name: `More actions for ${FILM.title}` })
    .click();
  await page.getByRole("menuitem", { name: "Remove" }).click();
  await expect(page.getByText(`Removed ${FILM.title}`)).toBeVisible();
  await expect(card).toHaveCount(0);
});

test("the empty search shows popular films and suggestions, and Taste has a tab", async ({
  page,
}) => {
  await signIn(page, DEMO.email, DEMO.password);

  const popular = page.locator("section", {
    has: page.getByRole("heading", { name: "Popular this week" }),
  });
  await expect(popular.locator('a[href^="/movie/"]').first()).toBeVisible();

  const chip = page.getByRole("button", { name: "Parasite", exact: true });
  await hydrated(chip);
  await chip.click();
  await expect(page).toHaveURL(/\/search\?q=Parasite$/);
  await expect(page.locator('main a[href="/movie/496243"]')).toBeVisible();
  await expect(popular).toHaveCount(0);

  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Taste", exact: true })
    .click();
  await expect(page).toHaveURL(/\/taste$/);
  await expect(
    page.getByRole("heading", { name: "Taste profile", level: 1 }),
  ).toBeVisible();
});
