-- Watchlist: one row per member per film; the rating lives on the entry.

create type public.watch_status as enum ('to_watch', 'watched');

-- tmdb_id references the shared cache, so services/movies.ts caches the film before the insert.
-- The unique index leads with user_id, so it also serves every per-member query.
create table public.watchlist_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  tmdb_id    integer not null references public.movies (tmdb_id),
  status     public.watch_status not null default 'to_watch',
  rating     smallint check (rating between 1 and 10),
  added_at   timestamptz not null default now(),
  watched_at timestamptz,
  unique (user_id, tmdb_id),
  constraint rating_only_when_watched check (status = 'watched' or (rating is null and watched_at is null)),
  constraint watched_has_timestamp    check (status = 'to_watch' or watched_at is not null)
);

-- watched_at is the first time a film was marked watched: changing the rating keeps it,
-- and moving the film back to the list clears it along with the rating.
create function public.track_watched_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = 'to_watch' then
    new.rating := null;
    new.watched_at := null;
  else
    new.watched_at := coalesce(old.watched_at, now());
  end if;
  return new;
end
$$;

create trigger track_watched_at
  before update on public.watchlist_entries
  for each row execute function public.track_watched_at();

-- Owner-only: followers will read watched entries through definer functions, never this table.
alter table public.watchlist_entries enable row level security;

create policy "members manage own entries"
  on public.watchlist_entries for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
