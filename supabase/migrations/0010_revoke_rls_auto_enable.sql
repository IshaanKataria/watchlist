-- Supabase creates public.rls_auto_enable() for its ensure_rls event trigger, which switches RLS on for
-- every new table. It is security definer and granted to anon and authenticated, which puts it on the
-- Data API's /rpc endpoint. Only the event trigger calls it, and firing one checks no execute grant.
-- Guarded because projects created before the platform added it don't have the function.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end
$$;
