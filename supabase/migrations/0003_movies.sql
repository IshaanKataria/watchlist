-- Movies: a shared cache of TMDB data, keyed by TMDB's own id.

create table public.movies (
  tmdb_id         integer primary key check (tmdb_id > 0),
  title           text not null,
  poster_path     text,
  backdrop_path   text,
  release_year    smallint,
  runtime_minutes smallint,
  overview        text,
  created_at      timestamptz not null default now()
);

create table public.genres (
  id   integer primary key,
  name text not null
);

create table public.movie_genres (
  tmdb_id  integer not null references public.movies (tmdb_id) on delete cascade,
  genre_id integer not null references public.genres (id),
  primary key (tmdb_id, genre_id)
);

-- TMDB's fixed movie genre list (GET /genre/movie/list), seeded so no request ever writes it.
insert into public.genres (id, name) values
  (28, 'Action'), (12, 'Adventure'), (16, 'Animation'), (35, 'Comedy'), (80, 'Crime'),
  (99, 'Documentary'), (18, 'Drama'), (10751, 'Family'), (14, 'Fantasy'), (36, 'History'),
  (27, 'Horror'), (10402, 'Music'), (9648, 'Mystery'), (10749, 'Romance'),
  (878, 'Science Fiction'), (10770, 'TV Movie'), (53, 'Thriller'), (10752, 'War'), (37, 'Western');

-- Members read; only the server writes, through the service-role client. A member insert
-- policy would let anyone holding the browser's session token plant a fake title for a real
-- tmdb_id through the Data API, and with no update path it would stick for everyone.
alter table public.movies       enable row level security;
alter table public.genres       enable row level security;
alter table public.movie_genres enable row level security;

create policy "members read movies"       on public.movies       for select to authenticated using (true);
create policy "members read genres"       on public.genres       for select to authenticated using (true);
create policy "members read movie genres" on public.movie_genres for select to authenticated using (true);

revoke insert, update, delete, truncate on public.movies, public.genres, public.movie_genres
  from anon, authenticated;
