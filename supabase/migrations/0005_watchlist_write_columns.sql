-- Members write only what the API sends: the film on insert, status and rating on update.
-- added_at and watched_at stay server-set (column defaults and track_watched_at), so a direct
-- Data API call can't backdate an entry or pin it to the top of a list with a future date.
revoke insert, update on public.watchlist_entries from anon, authenticated;
grant insert (user_id, tmdb_id), update (status, rating) on public.watchlist_entries to authenticated;
