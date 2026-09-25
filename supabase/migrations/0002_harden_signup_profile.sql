-- Signup metadata is client-controlled: anyone can pass avatar_url or a blank name to auth.signUp().
-- Avatars are kept only from the hosts the app issues them from (Google sign-in, DiceBear seeds),
-- so other members' browsers never load an attacker's URL; blank names fall back to the email.
-- create or replace keeps the execute revoke from 0001.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  meta      jsonb := new.raw_user_meta_data;
  base      text;
  candidate text;
  n         int := 0;
begin
  base := regexp_replace(
            lower(coalesce(meta ->> 'user_name',
                           meta ->> 'preferred_username',
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
    left(coalesce(nullif(btrim(meta ->> 'full_name'), ''),
                  nullif(btrim(meta ->> 'name'), ''),
                  split_part(new.email, '@', 1)), 40),
    case when meta ->> 'avatar_url' ~ '^https://(lh[0-9]+\.googleusercontent\.com|api\.dicebear\.com)/'
         then meta ->> 'avatar_url' end
  );
  return new;
end
$$;
