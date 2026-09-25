-- Stats: aggregated in SQL from the member's watched entries.

-- security invoker: watchlist RLS is owner-only, so a member calling this directly only ever
-- counts their own entries, whatever target they pass.
create function public.user_stats(target uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with watched as (
    select e.rating, e.tmdb_id, m.runtime_minutes
    from public.watchlist_entries e
    join public.movies m on m.tmdb_id = e.tmdb_id
    where e.user_id = target and e.status = 'watched'
  )
  select jsonb_build_object(
    'watched_count',         (select count(*) from watched),
    'rated_count',           (select count(rating) from watched),
    'average_rating',        (select round(avg(rating), 1) from watched),
    'total_runtime_minutes', (select coalesce(sum(runtime_minutes), 0) from watched),
    'genres', (
      select coalesce(jsonb_agg(jsonb_build_object('name', g.name, 'count', x.c) order by x.c desc, g.name), '[]'::jsonb)
      from (
        select mg.genre_id, count(*) as c
        from watched w join public.movie_genres mg on mg.tmdb_id = w.tmdb_id
        group by mg.genre_id
      ) x
      join public.genres g on g.id = x.genre_id
    ),
    -- Always ten counts, index = rating - 1, so the chart never fills gaps.
    'rating_histogram', (
      select jsonb_agg((select count(*) from watched w where w.rating = r) order by r)
      from generate_series(1, 10) r
    )
  );
$$;

revoke execute on function public.user_stats(uuid) from public, anon;
grant execute on function public.user_stats(uuid) to authenticated;
