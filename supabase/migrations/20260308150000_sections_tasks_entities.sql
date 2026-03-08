-- ─── Sections (columns in a project) ───────────────────────────────────────

create table public.sections (
  id         uuid        not null default gen_random_uuid(),
  name       text        not null,
  position   int         not null default 0,
  project_id uuid        not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (id)
);

-- ─── Tasks (core task entity) ──────────────────────────────────────────────

create table public.tasks (
  id              uuid        not null default gen_random_uuid(),
  title           text        not null,
  description     text,
  due_date        date,
  parent_task_id  uuid        references public.tasks(id) on delete set null,
  assignee_id     uuid        references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  primary key (id)
);

-- ─── Task dependency (dependent_id is blocked by blocking_id) ───────────────

create table public.task_dependencies (
  id           uuid        not null default gen_random_uuid(),
  dependent_id uuid        not null references public.tasks(id) on delete cascade,
  blocking_id  uuid        not null references public.tasks(id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  primary key (id),
  unique (dependent_id, blocking_id),
  check (dependent_id <> blocking_id)
);

-- ─── Task field value (custom field value on a task) ────────────────────────

create table public.task_field_values (
  id                    uuid        not null default gen_random_uuid(),
  task_id               uuid        not null references public.tasks(id) on delete cascade,
  project_field_id      uuid        not null references public.project_fields(id) on delete cascade,
  project_field_option_id uuid      not null references public.project_field_options(id) on delete cascade,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  primary key (id),
  unique (task_id, project_field_id)
);

-- ─── Task comment ──────────────────────────────────────────────────────────

create table public.task_comments (
  id         uuid        not null default gen_random_uuid(),
  task_id    uuid        not null references public.tasks(id) on delete cascade,
  content    text        not null,
  author_id  uuid        not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (id)
);

-- ─── Task project (task placement in a project/section) ─────────────────────

create table public.task_projects (
  id         uuid        not null default gen_random_uuid(),
  task_id    uuid        not null references public.tasks(id) on delete cascade,
  project_id uuid        not null references public.projects(id) on delete cascade,
  section_id uuid        not null references public.sections(id) on delete cascade,
  position   int         not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (id),
  unique (task_id, project_id)
);

-- ─── RLS ───────────────────────────────────────────────────────────────────

alter table public.sections enable row level security;
alter table public.tasks enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.task_field_values enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_projects enable row level security;

-- Helper: user can access project (org member)
-- Sections: via project
create policy "Org members can view sections"
  on public.sections for select
  using (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where p.id = sections.project_id
    )
  );

create policy "Org members can insert sections"
  on public.sections for insert
  with check (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where p.id = sections.project_id
    )
  );

create policy "Org members can update sections"
  on public.sections for update
  using (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where p.id = sections.project_id
    )
  );

create policy "Org members can delete sections"
  on public.sections for delete
  using (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where p.id = sections.project_id
    )
  );

-- Tasks: accessible if task appears in any project the user's org can see
create policy "Org members can view tasks"
  on public.tasks for select
  using (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = tasks.id
    )
  );

create policy "Org members can insert tasks"
  on public.tasks for insert
  with check (true);

create policy "Org members can update tasks"
  on public.tasks for update
  using (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = tasks.id
    )
  );

create policy "Org members can delete tasks"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = tasks.id
    )
  );

-- Task dependencies: via either task
create policy "Org members can view task dependencies"
  on public.task_dependencies for select
  using (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = task_dependencies.dependent_id or tp.task_id = task_dependencies.blocking_id
    )
  );

create policy "Org members can insert task dependencies"
  on public.task_dependencies for insert
  with check (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = task_dependencies.dependent_id
    )
  );

create policy "Org members can update task dependencies"
  on public.task_dependencies for update
  using (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = task_dependencies.dependent_id or tp.task_id = task_dependencies.blocking_id
    )
  );

create policy "Org members can delete task dependencies"
  on public.task_dependencies for delete
  using (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = task_dependencies.dependent_id or tp.task_id = task_dependencies.blocking_id
    )
  );

-- Task field values: via task
create policy "Org members can view task field values"
  on public.task_field_values for select
  using (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = task_field_values.task_id
    )
  );

create policy "Org members can insert task field values"
  on public.task_field_values for insert
  with check (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = task_field_values.task_id
    )
  );

create policy "Org members can update task field values"
  on public.task_field_values for update
  using (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = task_field_values.task_id
    )
  );

create policy "Org members can delete task field values"
  on public.task_field_values for delete
  using (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = task_field_values.task_id
    )
  );

-- Task comments: via task
create policy "Org members can view task comments"
  on public.task_comments for select
  using (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = task_comments.task_id
    )
  );

create policy "Org members can insert task comments"
  on public.task_comments for insert
  with check (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = task_comments.task_id
    )
  );

create policy "Org members can update task comments"
  on public.task_comments for update
  using (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = task_comments.task_id
    )
  );

create policy "Org members can delete task comments"
  on public.task_comments for delete
  using (
    exists (
      select 1 from public.task_projects tp
      join public.projects p on p.id = tp.project_id
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where tp.task_id = task_comments.task_id
    )
  );

-- Task projects: via project
create policy "Org members can view task projects"
  on public.task_projects for select
  using (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where p.id = task_projects.project_id
    )
  );

create policy "Org members can insert task projects"
  on public.task_projects for insert
  with check (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where p.id = task_projects.project_id
    )
  );

create policy "Org members can update task projects"
  on public.task_projects for update
  using (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where p.id = task_projects.project_id
    )
  );

create policy "Org members can delete task projects"
  on public.task_projects for delete
  using (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.org_id = p.org_id and om.user_id = auth.uid()
      where p.id = task_projects.project_id
    )
  );
