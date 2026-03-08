-- ─── Projects & custom fields ─────────────────────────────────────────────────

create table public.projects (
  id          uuid        not null default gen_random_uuid(),
  name        text        not null,
  description text,
  due_date    date,
  org_id      uuid        not null references public.organizations(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  primary key (id)
);

create table public.project_fields (
  id         uuid        not null default gen_random_uuid(),
  project_id uuid        not null references public.projects(id) on delete cascade,
  name       text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (id)
);

create table public.project_field_options (
  id         uuid        not null default gen_random_uuid(),
  field_id   uuid        not null references public.project_fields(id) on delete cascade,
  value      text        not null,
  position   int         not null default 0,
  color      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (id)
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

alter table public.projects enable row level security;
alter table public.project_fields enable row level security;
alter table public.project_field_options enable row level security;

-- projects: org members can select/insert/update/delete their org's projects
create policy "Org members can view org projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.organization_members om
      where om.org_id = projects.org_id and om.user_id = auth.uid()
    )
  );

create policy "Org members can insert org projects"
  on public.projects for insert
  with check (
    exists (
      select 1 from public.organization_members om
      where om.org_id = projects.org_id and om.user_id = auth.uid()
    )
  );

create policy "Org members can update org projects"
  on public.projects for update
  using (
    exists (
      select 1 from public.organization_members om
      where om.org_id = projects.org_id and om.user_id = auth.uid()
    )
  );

create policy "Org members can delete org projects"
  on public.projects for delete
  using (
    exists (
      select 1 from public.organization_members om
      where om.org_id = projects.org_id and om.user_id = auth.uid()
    )
  );

-- project_fields: access via project's org
create policy "Org members can view project fields"
  on public.project_fields for select
  using (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where p.id = project_fields.project_id
    )
  );

create policy "Org members can insert project fields"
  on public.project_fields for insert
  with check (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where p.id = project_fields.project_id
    )
  );

create policy "Org members can update project fields"
  on public.project_fields for update
  using (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where p.id = project_fields.project_id
    )
  );

create policy "Org members can delete project fields"
  on public.project_fields for delete
  using (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where p.id = project_fields.project_id
    )
  );

-- project_field_options: access via field -> project -> org
create policy "Org members can view field options"
  on public.project_field_options for select
  using (
    exists (
      select 1 from public.project_fields pf
      join public.projects p on p.id = pf.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where pf.id = project_field_options.field_id
    )
  );

create policy "Org members can insert field options"
  on public.project_field_options for insert
  with check (
    exists (
      select 1 from public.project_fields pf
      join public.projects p on p.id = pf.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where pf.id = project_field_options.field_id
    )
  );

create policy "Org members can update field options"
  on public.project_field_options for update
  using (
    exists (
      select 1 from public.project_fields pf
      join public.projects p on p.id = pf.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where pf.id = project_field_options.field_id
    )
  );

create policy "Org members can delete field options"
  on public.project_field_options for delete
  using (
    exists (
      select 1 from public.project_fields pf
      join public.projects p on p.id = pf.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where pf.id = project_field_options.field_id
    )
  );
