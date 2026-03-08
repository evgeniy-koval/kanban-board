import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectHeader } from '@/components/projects/project-header'
import type { Project } from '@/lib/types'

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

  return (
    <div className="flex h-full flex-col">
      <ProjectHeader project={project} />
      <div className="flex-1 p-4" />
    </div>
  )
}
