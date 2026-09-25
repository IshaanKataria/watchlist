import { notFound } from "next/navigation";

import { TmdbImage } from "@/components/tmdb-image";
import { getMovie, tmdbIdParamSchema } from "@/lib/tmdb";

function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export default async function MoviePage({
  params,
}: PageProps<"/movie/[tmdbId]">) {
  const tmdbId = tmdbIdParamSchema.safeParse((await params).tmdbId);
  if (!tmdbId.success) notFound();
  const movie = await getMovie(tmdbId.data);
  if (!movie) notFound();

  const facts = [
    movie.year,
    movie.runtime && formatRuntime(movie.runtime),
    movie.genres.map((genre) => genre.name).join(", "),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="grid gap-8">
      {/* -mx-4 -mt-6 cancel the (app) layout's px-4 pt-6 so the backdrop bleeds edge to edge on phones. */}
      <section className="relative isolate -mx-4 -mt-6 overflow-hidden px-4 pt-40 pb-6 md:mx-0 md:mt-0 md:rounded-xl md:px-8 md:pt-56 md:pb-8">
        {movie.backdropPath && (
          <div className="absolute inset-0 -z-10">
            <TmdbImage
              path={movie.backdropPath}
              size="w1280"
              preload
              className="opacity-60"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-transparent" />
          </div>
        )}
        <div className="flex items-end gap-4 md:gap-8">
          <div className="relative aspect-2/3 w-28 shrink-0 overflow-hidden rounded-lg shadow-2xl sm:w-36 md:w-48">
            <TmdbImage path={movie.posterPath} size="w500" preload />
          </div>
          <div className="grid min-w-0 gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-4xl">
              {movie.title}
            </h1>
            <p className="text-sm text-muted-foreground">{facts}</p>
          </div>
        </div>
      </section>

      <p className="max-w-prose leading-relaxed text-pretty">
        {movie.overview || "No overview on TMDB yet."}
      </p>

      {movie.cast.length > 0 && (
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Cast</h2>
          {/* Scrolls inside its own box so the page never scrolls sideways. */}
          <ul className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:scroll-px-0 md:px-0">
            {movie.cast.map((person, index) => (
              <li
                // TMDB can list one actor twice under the same role; the order never changes.
                key={index}
                className="w-24 shrink-0 snap-start"
              >
                <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-muted">
                  <TmdbImage path={person.profilePath} size="w185" />
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium">
                  {person.name}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {person.character}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
