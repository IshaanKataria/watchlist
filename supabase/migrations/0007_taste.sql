-- Taste profile: the member's latest AI summary and recommendations, one row per member.

create table public.taste_profiles (
  user_id         uuid primary key references public.profiles (id) on delete cascade,
  summary         text not null,
  recommendations jsonb not null,  -- [{ tmdbId, title, year, posterPath, reason }]
  input_hash      text not null,   -- sha256 of the prompt the profile was generated from
  generated_at    timestamptz not null default now()
);

-- Members only read their own profile. The server writes it with the service role, so no one
-- can plant a profile or reset the regeneration cooldown (input_hash, generated_at) through
-- the Data API with the browser's session token.
alter table public.taste_profiles enable row level security;

create policy "members read own taste profile"
  on public.taste_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

revoke insert, update, delete, truncate on public.taste_profiles from anon, authenticated;
