import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BoardView } from '@/components/board/board-view'
import { ProjectHeader } from '@/components/projects/project-header'
import type { Project } from '@/lib/types'
import type { Section } from '@/lib/types'

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
      <ProjectHeader project={project} />
      <BoardView
        projectId={id}
        sections={sections}
        taskCountBySectionId={taskCountBySectionId}
      />
    </div>
  )
}
