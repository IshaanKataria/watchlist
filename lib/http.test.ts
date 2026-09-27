import { describe, expect, it } from "vitest";
import { z } from "zod";

import { json, parseJson, parseQuery, route } from "./http";

const echo = route(async (req: Request) =>
  json(await parseJson(req, z.object({ tmdbId: z.number() }))),
);

function post(contentType: string) {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: JSON.stringify({ tmdbId: 1 }),
  });
}

describe("parseJson", () => {
  it.each(["text/plain", "application/x-www-form-urlencoded"])(
    "rejects content type %s with 415",
    async (contentType) => {
      const res = await echo(post(contentType), undefined);
      expect(res.status).toBe(415);
      expect(await res.json()).toMatchObject({
        error: { code: "unsupported_media_type" },
      });
    },
  );

  it("accepts application/json with a charset", async () => {
    const res = await echo(post("application/json; charset=utf-8"), undefined);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tmdbId: 1 });
  });
});

describe("parseQuery", () => {
  const schema = z.object({ q: z.string().min(1) });
  const get = (query: string) => new Request(`http://localhost/api?${query}`);

  it("parses the query string", () => {
    expect(parseQuery(get("q=dune"), schema)).toEqual({ q: "dune" });
  });

  it("throws a ZodError, which route() answers with 400", () => {
    expect(() => parseQuery(get("q="), schema)).toThrow(z.ZodError);
  });
});
