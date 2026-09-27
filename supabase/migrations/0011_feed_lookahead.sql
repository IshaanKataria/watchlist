-- feed() returns one row past its page of 30, so the API can tell whether an older page exists. A
-- feed of exactly 30 or 60 rows used to offer Load more once more and fetch an empty page.
-- create or replace keeps the execute grants from 0009_feed.sql.
create or replace function public.feed(before timestamptz default null)
returns table (handle text, display_name text, avatar_url text, tmdb_id integer, title text,
               poster_path text, rating smallint, watched_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select p.handle, p.display_name, p.avatar_url, m.tmdb_id, m.title, m.poster_path, e.rating, e.watched_at
  from public.follows f
  join public.profiles p on p.id = f.followee_id
  join public.watchlist_entries e on e.user_id = f.followee_id and e.status = 'watched'
  join public.movies m on m.tmdb_id = e.tmdb_id
  where f.follower_id = (select auth.uid())
    and (before is null or e.watched_at < before)
  order by e.watched_at desc
  limit 31
$$;
