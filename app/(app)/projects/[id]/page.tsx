import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BoardView } from '@/components/board/board-view'
import { ProjectHeader } from '@/components/projects/project-header'
import type { Project, ProjectFieldWithOptions, Section } from '@/lib/types'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('id, name, description, due_date, org_id, created_at, updated_at')
    .eq('id', id)
    .single()

  if (!data) notFound()
  const project = data as Project

  const { data: sectionsData } = await supabase
    .from('sections')
    .select('id, name, position, project_id, created_at, updated_at')
    .eq('project_id', id)
    .order('position', { ascending: true })

  const sections = (sectionsData ?? []) as Section[]

  const { data: fieldsData } = await supabase
    .from('project_fields')
    .select(`
      id,
      project_id,
      name,
      created_at,
      updated_at,
      project_field_options (
        id,
        field_id,
        value,
        position,
        color,
        created_at,
        updated_at
      )
    `)
    .eq('project_id', id)

  const fields: ProjectFieldWithOptions[] = (fieldsData ?? []).map((f) => {
    const row = f as Record<string, unknown> & { project_field_options?: Array<{ position: number }> }
    const opts = row.project_field_options ?? []
    const options = [...opts].sort((a, b) => a.position - b.position) as ProjectFieldWithOptions['options']
    const { project_field_options: _, ...field } = row
    return { ...field, options } as ProjectFieldWithOptions
  })

  const { data: taskCounts } = await supabase
    .from('task_projects')
    .select('section_id')
    .eq('project_id', id)

  const taskCountBySectionId: Record<string, number> = {}
  for (const row of taskCounts ?? []) {
    const sid = (row as { section_id: string }).section_id
    taskCountBySectionId[sid] = (taskCountBySectionId[sid] ?? 0) + 1
  }

  return (
    <div className="flex h-full flex-col">
      <ProjectHeader project={project} fields={fields} />
      <BoardView
        projectId={id}
        sections={sections}
        taskCountBySectionId={taskCountBySectionId}
      />
    </div>
  )
}
