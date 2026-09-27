import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import members from "./seed-members.json" with { type: "json" };
import type { Database, TablesInsert } from "../lib/supabase/database.types";

// Published in the README as the demo login.
const PASSWORD = "watchlist-demo";
const DAY = 86_400_000;

type Film = [title: string, year: number];

// demo rates character-driven drama high and blockbusters low, so the taste profile has a contrast to find.
const MEMBERS = z
  .array(
    z.object({
      handle: z.string(),
      name: z.string(),
      watched: z.array(z.tuple([z.string(), z.number(), z.number()])),
      toWatch: z.array(z.tuple([z.string(), z.number()])),
    }),
  )
  .parse(members);

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// The signup trigger turns user_metadata into each profile, so rerunning only skips existing emails.
for (const { handle, name } of MEMBERS) {
  const { error } = await supabase.auth.admin.createUser({
    email: `${handle}@example.com`,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: {
      user_name: handle,
      full_name: name,
      avatar_url: `https://api.dicebear.com/9.x/notionists/svg?seed=${handle}`,
    },
  });
  if (error && error.code !== "email_exists") throw error;
  console.log(`${handle}: ${error ? "already exists" : "created"}`);
}

// Mirrors lib/tmdb.ts and services/movies.ts: plain node resolves neither the @/ alias nor server-only.
const searchSchema = z.object({
  results: z.array(z.object({ id: z.number() })),
});
const movieSchema = z.object({
  title: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  runtime: z.number().nullable(),
  overview: z.string(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
});

async function tmdb(path: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams({ language: "en-US", ...params });
  const res = await fetch(`https://api.themoviedb.org/3${path}?${query}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
  });
  if (!res.ok) throw new Error(`TMDB answered ${res.status} for ${path}`);
  const body: unknown = await res.json();
  return body;
}

const ignoreDuplicates = { ignoreDuplicates: true };
const tmdbIds = new Map<string, number>();

async function cacheFilm([title, year]: Film) {
  const key = `${title} (${year})`;
  const cached = tmdbIds.get(key);
  if (cached) return cached;
  const { results } = searchSchema.parse(
    await tmdb("/search/movie", {
      query: title,
      primary_release_year: String(year),
    }),
  );
  const id = results[0]?.id;
  if (!id) throw new Error(`No TMDB match for ${key}`);
  const movie = movieSchema.parse(await tmdb(`/movie/${id}`));
  await supabase
    .from("movies")
    .upsert(
      {
        tmdb_id: id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_year: year,
        runtime_minutes: movie.runtime,
        overview: movie.overview,
      },
      ignoreDuplicates,
    )
    .throwOnError();
  await supabase
    .from("genres")
    .upsert(movie.genres, ignoreDuplicates)
    .throwOnError();
  await supabase
    .from("movie_genres")
    .upsert(
      movie.genres.map((genre) => ({ tmdb_id: id, genre_id: genre.id })),
      ignoreDuplicates,
    )
    .throwOnError();
  console.log(`${key} → ${id} ${movie.title}`);
  tmdbIds.set(key, id);
  return id;
}

// By email, not handle: members can rename themselves in the app, and a handle given up can be
// taken by another account.
const { data, error: listError } = await supabase.auth.admin.listUsers({
  perPage: 1000,
});
if (listError) throw listError;

function profileId(handle: string) {
  const email = `${handle}@example.com`;
  const id = data.users.find((user) => user.email === email)?.id;
  if (!id) throw new Error(`No account for ${email}`);
  return id;
}

// Restores each member's handle, name and list, so a rerun undoes anything changed in the app. Dates
// step back three days per film and are offset per member, so a feed of their activity interleaves.
for (const [offset, member] of MEMBERS.entries()) {
  const userId = profileId(member.handle);
  await supabase
    .from("profiles")
    .update({ handle: member.handle, display_name: member.name })
    .eq("id", userId)
    .throwOnError();
  const daysAgo = (index: number) =>
    new Date(Date.now() - (index * 3 + offset) * DAY).toISOString();
  const rows: TablesInsert<"watchlist_entries">[] = [];
  for (const [index, [title, year, rating]] of member.watched.entries()) {
    rows.push({
      user_id: userId,
      tmdb_id: await cacheFilm([title, year]),
      status: "watched",
      rating,
      added_at: daysAgo(index),
      watched_at: daysAgo(index),
    });
  }
  for (const [index, film] of member.toWatch.entries()) {
    rows.push({
      user_id: userId,
      tmdb_id: await cacheFilm(film),
      status: "to_watch",
      added_at: daysAgo(index),
    });
  }
  await supabase
    .from("watchlist_entries")
    .delete()
    .eq("user_id", userId)
    .throwOnError();
  await supabase.from("watchlist_entries").insert(rows).throwOnError();
  console.log(
    `${member.handle}: ${member.watched.length} watched, ${member.toWatch.length} to watch`,
  );
}

// demo follows the other two, so its feed has their activity. Replaced like the lists, so a rerun
// also undoes follows made while trying the app.
const demoId = profileId("demo");
await supabase
  .from("follows")
  .delete()
  .eq("follower_id", demoId)
  .throwOnError();
await supabase
  .from("follows")
  .insert(
    ["sam", "mira"].map((handle) => ({
      follower_id: demoId,
      followee_id: profileId(handle),
    })),
  )
  .throwOnError();
console.log("demo: follows sam and mira");
