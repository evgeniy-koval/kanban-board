-- ─── RPC: join existing organization by slug ───────────────────────────────────
-- Allows an authenticated user to become a member by providing the org slug.

create or replace function public.join_organization_by_slug(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id   uuid;
  v_user_id  uuid := auth.uid();
  v_normalized_slug text := trim(lower(p_slug));
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  if v_normalized_slug = '' then
    raise exception 'Organization slug is required';
  end if;

  select id into v_org_id
  from public.organizations
  where slug = v_normalized_slug;

  if v_org_id is null then
    raise exception 'Organization not found';
  end if;

  insert into public.organization_members (org_id, user_id)
  values (v_org_id, v_user_id)
  on conflict (org_id, user_id) do nothing;
end;
$$;
