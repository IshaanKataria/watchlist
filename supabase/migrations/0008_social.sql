-- Follows: who follows whom. Edges key on profile ids, never handles, so a rename touches nothing here.

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  primary key (follower_id, followee_id),
  constraint no_self_follow check (follower_id <> followee_id)
);

-- The primary key serves lookups by follower; this serves lookups by followee and the delete cascade.
create index follows_followee_idx on public.follows (followee_id);

-- Closed to members entirely: even an own-row select would hand followee ids to the browser, which
-- holds the session token. RLS with no policies denies every row, and the revoked grants keep the
-- table shut if a policy is ever added by mistake. Members reach it only through the functions below.
alter table public.follows enable row level security;
revoke all on public.follows from anon, authenticated;

-- security definer (below): profiles and follows are closed to members, so these run as the owner.
-- Each acts as auth.uid(), addresses other members by handle and returns no ids.

-- Discovery: any member finds others by handle or display name, with their own follow state.
create function public.search_members(q text)
returns table (handle text, display_name text, avatar_url text, is_following boolean)
language sql stable security definer set search_path = '' as $$
  select p.handle, p.display_name, p.avatar_url,
         exists (select 1 from public.follows f
                 where f.follower_id = (select auth.uid()) and f.followee_id = p.id)
  from public.profiles p
  where p.id <> (select auth.uid())
    -- strpos rather than like, so a % or _ in the query matches literally.
    and (strpos(p.handle, lower(q)) > 0 or strpos(lower(p.display_name), lower(q)) > 0)
  order by starts_with(p.handle, lower(q)) desc, p.handle
  limit 20
$$;

create function public.list_following()
returns table (handle text, display_name text, avatar_url text)
language sql stable security definer set search_path = '' as $$
  select p.handle, p.display_name, p.avatar_url
  from public.follows f
  join public.profiles p on p.id = f.followee_id
  where f.follower_id = (select auth.uid())
  order by p.handle
$$;

-- Errors the API maps: an unknown handle raises no_data_found (P0002, from select ... into strict),
-- following yourself raises invalid_parameter_value (22023).
create function public.follow_member(target_handle text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  target uuid;
begin
  select id into strict target from public.profiles where handle = target_handle;
  if target = auth.uid() then
    raise exception 'members cannot follow themselves' using errcode = 'invalid_parameter_value';
  end if;
  insert into public.follows (follower_id, followee_id)
  values (auth.uid(), target)
  on conflict do nothing;
end
$$;

-- Unfollowing someone you don't follow is a no-op, so repeating it is safe.
create function public.unfollow_member(target_handle text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  target uuid;
begin
  select id into strict target from public.profiles where handle = target_handle;
  delete from public.follows where follower_id = auth.uid() and followee_id = target;
end
$$;

revoke execute on function
  public.search_members(text), public.list_following(),
  public.follow_member(text), public.unfollow_member(text)
  from public, anon;
grant execute on function
  public.search_members(text), public.list_following(),
  public.follow_member(text), public.unfollow_member(text)
  to authenticated;
