-- Feed and member pages: what members see of each other. You see only the accounts you follow,
-- and of those only watched entries (film, rating, watched_at); to-watch lists stay private.
-- A member you don't follow shows their handle, name, avatar and follow counts, nothing else.

-- Serves the feed's pages, each member's watched list and user_stats().
create index watchlist_entries_watched_idx
  on public.watchlist_entries (user_id, watched_at desc) where status = 'watched';

-- security definer, as in 0008_social.sql: profiles, follows and watchlist_entries are owner-only.
-- Each function acts as auth.uid(), addresses members by handle and returns no ids.

-- Watched entries of everyone the caller follows, newest first. Pages by keyset: pass the last
-- row's watched_at as before to get the next 30.
create function public.feed(before timestamptz default null)
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
  limit 30
$$;

-- Any member's header, whoever asks. An unknown handle raises no_data_found (P0002), like follow_member().
create function public.member_profile(target_handle text)
returns table (handle text, display_name text, avatar_url text, is_following boolean,
               is_self boolean, follower_count bigint, following_count bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  return query
  select p.handle, p.display_name, p.avatar_url,
         exists (select 1 from public.follows f
                 where f.follower_id = (select auth.uid()) and f.followee_id = p.id),
         p.id = (select auth.uid()),
         (select count(*) from public.follows f where f.followee_id = p.id),
         (select count(*) from public.follows f where f.follower_id = p.id)
  from public.profiles p
  where p.handle = target_handle;
  if not found then
    raise exception 'no member has that handle' using errcode = 'no_data_found';
  end if;
end
$$;

-- The next two answer only for the caller or someone they follow: zero rows or null otherwise,
-- the same as for an unknown handle.
create function public.member_watched(target_handle text)
returns table (tmdb_id integer, title text, release_year smallint, poster_path text,
               rating smallint, watched_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select m.tmdb_id, m.title, m.release_year, m.poster_path, e.rating, e.watched_at
  from public.profiles p
  join public.watchlist_entries e on e.user_id = p.id and e.status = 'watched'
  join public.movies m on m.tmdb_id = e.tmdb_id
  where p.handle = target_handle
    and (p.id = (select auth.uid())
         or exists (select 1 from public.follows f
                    where f.follower_id = (select auth.uid()) and f.followee_id = p.id))
  order by e.watched_at desc
$$;

-- Reuses user_stats(): it runs as its caller, which here is this function's owner, so it counts
-- the target's entries instead of only the member's own.
create function public.member_stats(target_handle text)
returns jsonb
language sql stable security definer set search_path = '' as $$
  select public.user_stats(p.id)
  from public.profiles p
  where p.handle = target_handle
    and (p.id = (select auth.uid())
         or exists (select 1 from public.follows f
                    where f.follower_id = (select auth.uid()) and f.followee_id = p.id))
$$;

-- For each of the given films, the people the caller follows who have watched it, most recent first.
-- Only the first 500 ids count, so a direct call stays cheap; the longest grid, an unpaginated
-- watchlist, fits unless it passes 500 films.
create function public.friends_who_watched(tmdb_ids integer[])
returns table (tmdb_id integer, handle text, display_name text, avatar_url text)
language sql stable security definer set search_path = '' as $$
  select e.tmdb_id, p.handle, p.display_name, p.avatar_url
  from public.follows f
  join public.watchlist_entries e on e.user_id = f.followee_id and e.status = 'watched'
  join public.profiles p on p.id = f.followee_id
  where f.follower_id = (select auth.uid())
    and e.tmdb_id = any (tmdb_ids[1:500])
  order by e.tmdb_id, e.watched_at desc
$$;

revoke execute on function
  public.feed(timestamptz), public.member_profile(text), public.member_watched(text),
  public.member_stats(text), public.friends_who_watched(integer[])
  from public, anon;
grant execute on function
  public.feed(timestamptz), public.member_profile(text), public.member_watched(text),
  public.member_stats(text), public.friends_who_watched(integer[])
  to authenticated;
