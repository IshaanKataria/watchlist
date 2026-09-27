import { expect, test, type APIResponse } from "@playwright/test";
import { z } from "zod";

import { admin, authFile, entriesOf, profileId } from "./accounts";
import members from "../scripts/seed-members.json";

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const GODFATHER = 238;

type Call = [method: string, path: string, data?: unknown];

async function expectNoUuid(res: APIResponse) {
  expect(await res.text(), res.url()).not.toMatch(UUID);
}

test.describe("signed out", () => {
  const calls: Call[] = [
    ["GET", "/api/movies/search?q=dune"],
    ["POST", "/api/watchlist", { tmdbId: GODFATHER }],
    ["PATCH", `/api/watchlist/${GODFATHER}`, { status: "to_watch" }],
    ["DELETE", `/api/watchlist/${GODFATHER}`],
    ["POST", "/api/taste-profile"],
    ["GET", "/api/members?q=sam"],
    ["PUT", "/api/follows/sam"],
    ["DELETE", "/api/follows/sam"],
    ["PATCH", "/api/me", { displayName: "Anon" }],
    ["GET", "/api/feed"],
  ];

  test("every API route answers 401 JSON, never a redirect", async ({
    context,
  }) => {
    for (const [method, path, data] of calls) {
      const res = await context.request.fetch(path, {
        method,
        data,
        maxRedirects: 0,
      });
      expect.soft(res.status(), `${method} ${path}`).toBe(401);
      expect
        .soft(await res.json(), `${method} ${path}`)
        .toMatchObject({ error: { code: "unauthorized" } });
    }
  });

  test("the login page carries no UUID", async ({ context }) => {
    await expectNoUuid(await context.request.get("/login"));
  });

  test("the Data API gives the publishable key nothing", async ({
    request,
  }) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const headers = {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    };
    const entries = await request.get(`${url}/rest/v1/watchlist_entries`, {
      headers,
    });
    expect(await entries.json()).toEqual([]);
    const follows = await request.get(`${url}/rest/v1/follows`, { headers });
    expect(follows.ok()).toBe(false);
    const feed = await request.post(`${url}/rest/v1/rpc/feed`, { headers });
    expect(feed.ok()).toBe(false);
  });
});

test.describe("as a member", () => {
  test.use({ storageState: authFile("e2e_viewer") });

  test("ignores a user id in the body", async ({ context }) => {
    const demoId = await profileId("demo");
    const demoBefore = await entriesOf("demo");
    const spoof = { userId: demoId, user_id: demoId };
    const { request } = context;

    const add = await request.post("/api/watchlist", {
      data: { tmdbId: GODFATHER, ...spoof },
    });
    expect(add.status()).toBe(201);
    const rate = await request.patch(`/api/watchlist/${GODFATHER}`, {
      data: { status: "watched", rating: 8, ...spoof },
    });
    expect(rate.status()).toBe(200);
    const rename = await request.patch("/api/me", {
      data: { displayName: "E2E viewer", ...spoof },
    });
    expect(await rename.json()).toMatchObject({ handle: "e2e_viewer" });

    expect(await entriesOf("e2e_viewer")).toEqual([
      { tmdb_id: GODFATHER, status: "watched", rating: 8 },
    ]);
    expect(await entriesOf("demo")).toEqual(demoBefore);
    for (const res of [add, rate, rename]) await expectNoUuid(res);
    expect((await request.delete(`/api/watchlist/${GODFATHER}`)).status()).toBe(
      204,
    );
  });

  test("answers malformed ratings, ids and queries with 400", async ({
    context,
  }) => {
    const calls: Call[] = [
      ...[0, 11, 7.5, "ten"].map((rating): Call => [
        "PATCH",
        `/api/watchlist/${GODFATHER}`,
        { status: "watched", rating },
      ]),
      ...["abc", "1e3", "0", "-5"].map((id): Call => [
        "DELETE",
        `/api/watchlist/${id}`,
      ]),
      ["POST", "/api/watchlist", { tmdbId: "abc" }],
      ["POST", "/api/watchlist", { tmdbId: 1.5 }],
      ["PATCH", "/api/me", { handle: "No Spaces" }],
      ["PUT", "/api/follows/Not-A-Handle"],
      ["GET", "/api/members?q="],
      ["GET", "/api/movies/search?q="],
      ["GET", "/api/feed?before=yesterday"],
    ];
    for (const [method, path, data] of calls) {
      const res = await context.request.fetch(path, { method, data });
      const label = `${method} ${path} ${JSON.stringify(data) ?? ""}`;
      expect.soft(res.status(), label).toBe(400);
      await expectNoUuid(res);
    }
  });

  test("answers a body that isn't JSON with 400 or 415", async ({
    context,
  }) => {
    const { request } = context;
    const broken = await request.post("/api/watchlist", {
      headers: { "Content-Type": "application/json" },
      data: "{not json",
    });
    expect(broken.status()).toBe(400);
    const text = await request.post("/api/watchlist", {
      headers: { "Content-Type": "text/plain" },
      data: JSON.stringify({ tmdbId: GODFATHER }),
    });
    expect(text.status()).toBe(415);
    const form = await request.patch("/api/me", { form: { displayName: "F" } });
    expect(form.status()).toBe(415);
  });

  test("follows: yourself 400, twice 204 and 204, unknown handle 404", async ({
    context,
  }) => {
    const { request } = context;
    expect((await request.put("/api/follows/e2e_viewer")).status()).toBe(400);
    expect((await request.put("/api/follows/sam")).status()).toBe(204);
    expect((await request.put("/api/follows/sam")).status()).toBe(204);
    const { count } = await admin
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", await profileId("e2e_viewer"))
      .throwOnError();
    expect(count).toBe(1);
    expect((await request.put("/api/follows/nobody_here")).status()).toBe(404);
    expect((await request.delete("/api/follows/sam")).status()).toBe(204);
    expect((await request.delete("/api/follows/sam")).status()).toBe(204);
  });
});

test.describe("a member who follows nobody", () => {
  test.use({ storageState: authFile("e2e_stranger") });

  test("sees no watched films on a member page or in the feed", async ({
    page,
  }) => {
    await page.goto("/u/sam");
    await expect(
      page.getByText("Follow @sam to see their films."),
    ).toBeVisible();
    await page.goto("/feed");
    await expect(
      page.getByText("When people you follow watch a film"),
    ).toBeVisible();

    // The server's HTML, flight data included, names none of their films.
    const titles = members
      .filter((member) => member.handle !== "demo")
      .flatMap((member) => member.watched.map(([title]) => String(title)));
    for (const path of ["/u/sam", "/u/mira", "/feed"]) {
      const html = await (await page.request.get(path)).text();
      for (const title of titles) expect.soft(html, path).not.toContain(title);
    }
    const api = await page.request.get("/api/feed");
    expect(await api.json()).toEqual({ items: [], nextCursor: null });
  });
});

test.describe("as demo", () => {
  test.use({ storageState: authFile("demo") });

  test("no page or JSON response carries a UUID", async ({ context }) => {
    const pages = ["/search?q=godfather", "/watchlist", "/stats", "/taste"];
    const social = ["/feed", "/members", "/settings", "/u/demo", "/u/sam"];
    const api = ["/api/movies/search?q=godfather", "/api/members?q=a"];
    for (const path of [...pages, ...social, `/movie/${GODFATHER}`, ...api]) {
      const res = await context.request.get(path);
      expect.soft(res.status(), path).toBe(200);
      await expectNoUuid(res);
    }
    const first = await context.request.get("/api/feed");
    await expectNoUuid(first);
    const { items } = z
      .object({ items: z.array(z.object({ watchedAt: z.string() })) })
      .parse(await first.json());
    const before = items.at(-1)?.watchedAt ?? "";
    const next = await context.request.get(
      `/api/feed?${new URLSearchParams({ before })}`,
    );
    expect(next.status()).toBe(200);
    await expectNoUuid(next);
  });
});
