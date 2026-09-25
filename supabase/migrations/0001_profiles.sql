-- Profiles: one row per auth user; handle is the only public identifier.

create or replace function public.reserved_handles()
returns text[] language sql immutable set search_path = '' as $$
  select array['admin','api','auth','me','settings','login','signup','u','feed','search',
               'stats','taste','watchlist','movie','movies','members','health','about']
$$;

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  handle       text not null unique
               check (handle ~ '^[a-z0-9_]{3,20}$' and not (handle = any (public.reserved_handles()))),
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- Creates the profile on signup; resolves handle collisions with a numeric suffix.
-- security definer: the collision check must see every profile, which RLS hides from members.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  base      text;
  candidate text;
  n         int := 0;
begin
  base := regexp_replace(
            lower(coalesce(new.raw_user_meta_data ->> 'user_name',
                           new.raw_user_meta_data ->> 'preferred_username',
                           split_part(new.email, '@', 1))),
            '[^a-z0-9_]', '', 'g');
  base := left(base, 20);
  if char_length(base) < 3 then base := 'member'; end if;

  candidate := base;
  while candidate = any (public.reserved_handles())
     or exists (select 1 from public.profiles where handle = candidate) loop
    n := n + 1;
    candidate := left(base, 20 - char_length(n::text)) || n;
  end loop;

  insert into public.profiles (id, handle, display_name, avatar_url)
  values (
    new.id,
    candidate,
    left(coalesce(new.raw_user_meta_data ->> 'full_name',
                  new.raw_user_meta_data ->> 'name',
                  split_part(new.email, '@', 1)), 40),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only the trigger calls it; keep it off the Data API's /rpc endpoint.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Owner-only: the session token is readable in the browser, so a wider select policy would let
-- any member list every profile id through the Data API. Cross-member reads use definer functions.
alter table public.profiles enable row level security;

create policy "users read own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "users update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Members may rename themselves, nothing else: avatar_url and id stay out of reach of the public key.
revoke update on public.profiles from anon, authenticated;
grant update (handle, display_name) on public.profiles to authenticated;
