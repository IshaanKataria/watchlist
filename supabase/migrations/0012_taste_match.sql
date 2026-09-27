-- Taste match on member pages: how closely the caller's ratings agree with those of a member they
-- follow, over the films both have watched and rated.

-- security definer, as in 0009_feed.sql: acts as auth.uid(), takes a handle and returns no ids.
-- Gated on the caller's follow edge, so yourself, a member you don't follow and an unknown handle
-- all give zero rows. Following with nothing in common gives one row with a shared_count of 0.
-- 9 is the largest possible gap on a 1-10 scale, so equal ratings score 100 and opposite ones 0.
-- Below 3 shared films the percent is null, so one film can't read as 100%.
create function public.taste_match(target_handle text)
returns table (shared_count integer, match_percent integer)
language sql stable security definer set search_path = '' as $$
  select count(mine.tmdb_id)::integer,
         case when count(mine.tmdb_id) >= 3
              then round(100 - avg(abs(mine.rating - theirs.rating)) / 9.0 * 100)::integer
         end
  from public.profiles p
  join public.follows f on f.followee_id = p.id and f.follower_id = (select auth.uid())
  left join public.watchlist_entries theirs
    on theirs.user_id = p.id and theirs.status = 'watched' and theirs.rating is not null
  left join public.watchlist_entries mine
    on mine.user_id = f.follower_id and mine.tmdb_id = theirs.tmdb_id
   and mine.status = 'watched' and mine.rating is not null
  where p.handle = target_handle
  group by p.id
$$;

revoke execute on function public.taste_match(text) from public, anon;
grant execute on function public.taste_match(text) to authenticated;
