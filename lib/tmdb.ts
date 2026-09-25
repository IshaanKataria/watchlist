import { z } from "zod";

import { ApiError } from "@/lib/http";
import type { MovieSummary } from "@/services/dto";

const API_URL = "https://api.themoviedb.org/3";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
});

const movieFields = {
  id: z.number(),
  title: z.string(),
  release_date: z.string().optional(),
  poster_path: z.string().nullable(),
  vote_average: z.number(),
};

function toSummary(movie: z.infer<z.ZodObject<typeof movieFields>>) {
  return {
    tmdbId: movie.id,
    title: movie.title,
    // TMDB sends "" for unreleased films.
    year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
    posterPath: movie.poster_path,
    voteAverage: movie.vote_average,
  } satisfies MovieSummary;
}

const searchSchema = z.object({ results: z.array(z.object(movieFields)) });

const detailSchema = z.object({
  ...movieFields,
  backdrop_path: z.string().nullable(),
  runtime: z.number().nullable(),
  overview: z.string(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  credits: z.object({
    cast: z.array(
      z.object({
        name: z.string(),
        character: z.string(),
        profile_path: z.string().nullable(),
      }),
    ),
  }),
});

function unavailable(cause: unknown) {
  return new ApiError(
    502,
    "tmdb_unavailable",
    "TMDB is unavailable, try again shortly",
    { cause },
  );
}

// Resolves to null on 404 so pages can render notFound(); every other failure is a 502.
async function tmdb<T extends z.ZodType>(
  path: string,
  params: Record<string, string>,
  schema: T,
): Promise<z.infer<T> | null> {
  const url = `${API_URL}${path}?${new URLSearchParams({ language: "en-US", ...params })}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
    signal: AbortSignal.timeout(8000),
  }).catch((error: unknown) => {
    throw unavailable(error);
  });
  if (res.status === 404) return null;
  if (!res.ok) throw unavailable(`TMDB answered ${res.status} for ${path}`);
  const body: unknown = await res.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw unavailable(parsed.error);
  return parsed.data;
}

export async function searchMovies(q: string) {
  const data = await tmdb(
    "/search/movie",
    { query: q, include_adult: "false" },
    searchSchema,
  );
  return data?.results.map(toSummary) ?? [];
}

export async function getMovie(tmdbId: number) {
  const movie = await tmdb(
    `/movie/${tmdbId}`,
    { append_to_response: "credits" },
    detailSchema,
  );
  if (!movie) return null;
  return {
    ...toSummary(movie),
    backdropPath: movie.backdrop_path,
    runtime: movie.runtime,
    overview: movie.overview,
    genres: movie.genres,
    cast: movie.credits.cast.slice(0, 8).map((person) => ({
      name: person.name,
      character: person.character,
      profilePath: person.profile_path,
    })),
  };
}
