import { ApiError } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMovie } from "@/lib/tmdb";

const ignoreDuplicates = { ignoreDuplicates: true };

// Members can only read the cache (0003), so it is written with the service role.
// Every statement skips rows that exist, which also repairs a film whose genres failed to save.
export async function cacheMovie(tmdbId: number) {
  const movie = await getMovie(tmdbId);
  if (!movie) {
    throw new ApiError(404, "movie_not_found", "TMDB has no film with that id");
  }
  const admin = createAdminClient();
  await Promise.all([
    admin
      .from("movies")
      .upsert(
        {
          tmdb_id: tmdbId,
          title: movie.title,
          poster_path: movie.posterPath,
          backdrop_path: movie.backdropPath,
          release_year: movie.year,
          runtime_minutes: movie.runtime,
          overview: movie.overview,
        },
        ignoreDuplicates,
      )
      .throwOnError(),
    // TMDB can add a genre after 0003 seeded the list; movie_genres has a foreign key to it.
    admin.from("genres").upsert(movie.genres, ignoreDuplicates).throwOnError(),
  ]);
  await admin
    .from("movie_genres")
    .upsert(
      movie.genres.map((genre) => ({ tmdb_id: tmdbId, genre_id: genre.id })),
      ignoreDuplicates,
    )
    .throwOnError();
}
