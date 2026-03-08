-- ─── Schema & default privileges ─────────────────────────────────────────────

grant usage on schema public to anon, authenticated;

alter default privileges in schema public
  grant all on tables to anon, authenticated;
alter default privileges in schema public
  grant all on sequences to anon, authenticated;

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table public.profiles (
  id         uuid        not null references auth.users on delete cascade,
  username   text        not null unique,
  full_name  text        not null,
  created_at timestamptz not null default now(),

  primary key (id)
);

create table public.organizations (
  id         uuid        not null default gen_random_uuid(),
  name       text        not null,
  email      text,
  address    text,
  website    text,
  slug       text        not null unique,
  created_at timestamptz not null default now(),

  primary key (id)
);

create table public.organization_members (
  id         uuid        not null default gen_random_uuid(),
  org_id     uuid        not null references public.organizations(id) on delete cascade,
  user_id    uuid        not null references auth.users on delete cascade,

  primary key (id),
  unique (org_id, user_id)
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- profiles: users can only read and update their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- organizations: users can only see organizations they belong to
create policy "Members can view their organizations"
  on public.organizations for select
  using (
    exists (
      select 1 from public.organization_members om
      where om.org_id = organizations.id and om.user_id = auth.uid()
    )
  );

-- organization_members: users can only see members of their own organizations
create policy "Members can view org members"
  on public.organization_members for select
  using (
    exists (
      select 1 from public.organization_members om
      where om.org_id = organization_members.org_id and om.user_id = auth.uid()
    )
  );

-- ─── RPC: create organization and add caller as first member ───────────────────

create or replace function public.create_organization_and_join(
  p_name   text,
  p_slug   text,
  p_email  text default null,
  p_address text default null,
  p_website text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.organizations (name, slug, email, address, website)
  values (p_name, p_slug, p_email, p_address, p_website)
  returning id into v_org_id;

  insert into public.organization_members (org_id, user_id)
  values (v_org_id, v_user_id);

  return v_org_id;
end;
$$;
