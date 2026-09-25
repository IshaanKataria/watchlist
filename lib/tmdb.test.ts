import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getMovie, searchMovies, tmdbIdParamSchema } from "./tmdb";

const dune = {
  id: 438631,
  title: "Dune",
  release_date: "2021-09-15",
  poster_path: "/dune.jpg",
  vote_average: 7.8,
};

const fetchMock = vi.fn<typeof fetch>();

function respond(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(Response.json(body, { status }));
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("TMDB_READ_TOKEN", "test-token");
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("searchMovies", () => {
  it("maps results to summaries and sends the bearer token", async () => {
    respond({ results: [dune, { ...dune, id: 1, release_date: "" }] });

    expect(await searchMovies("dune")).toEqual([
      {
        tmdbId: 438631,
        title: "Dune",
        year: 2021,
        posterPath: "/dune.jpg",
        voteAverage: 7.8,
      },
      {
        tmdbId: 1,
        title: "Dune",
        year: null,
        posterPath: "/dune.jpg",
        voteAverage: 7.8,
      },
    ]);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      "https://api.themoviedb.org/3/search/movie?language=en-US&query=dune&include_adult=false",
    );
    expect(new Headers(init?.headers).get("Authorization")).toBe(
      "Bearer test-token",
    );
  });

  it.each([
    ["an error status", () => respond({}, 500)],
    [
      "a network failure",
      () => fetchMock.mockRejectedValueOnce(new TypeError("fetch failed")),
    ],
    ["a malformed body", () => respond({ results: [{ id: "x" }] })],
  ])("throws a 502 on %s", async (_, arrange) => {
    arrange();
    await expect(searchMovies("dune")).rejects.toMatchObject({
      status: 502,
      code: "tmdb_unavailable",
    });
  });
});

describe("getMovie", () => {
  it("returns detail with the cast capped at 8", async () => {
    const cast = Array.from({ length: 12 }, (_, i) => ({
      name: `Actor ${i}`,
      character: `Role ${i}`,
      profile_path: null,
    }));
    respond({
      ...dune,
      backdrop_path: "/arrakis.jpg",
      runtime: 155,
      overview: "Spice.",
      genres: [{ id: 878, name: "Science Fiction" }],
      credits: { cast },
    });

    const movie = await getMovie(438631);

    expect(movie).toMatchObject({ tmdbId: 438631, year: 2021, runtime: 155 });
    expect(movie?.cast).toHaveLength(8);
    expect(movie?.cast[0]).toEqual({
      name: "Actor 0",
      character: "Role 0",
      profilePath: null,
    });
  });

  it("returns null when TMDB has no such movie", async () => {
    respond({ status_message: "not found" }, 404);
    expect(await getMovie(999999999)).toBeNull();
  });
});

describe("tmdbIdParamSchema", () => {
  it("parses a canonical id", () => {
    expect(tmdbIdParamSchema.parse("438631")).toBe(438631);
  });

  it.each(["0", "007", "1e3", "0x3E8", "12a", "-1", "", "2147483648"])(
    "rejects %j",
    (id) => {
      expect(tmdbIdParamSchema.safeParse(id).success).toBe(false);
    },
  );
});
