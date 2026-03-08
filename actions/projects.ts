'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ProjectActionResult = { error?: string }

export async function createProject(_prevState: ProjectActionResult, formData: FormData): Promise<ProjectActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()
  if (!membership?.org_id) return { error: 'No organization' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Project name is required' }

  const dueDateRaw = formData.get('due_date') as string
  const due_date = dueDateRaw?.trim() || null

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name,
      description: null,
      due_date,
      org_id: membership.org_id,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/projects')
  redirect(`/projects/${project.id}`)
}

export async function updateProject(
  projectId: string,
  _prevState: ProjectActionResult,
  formData: FormData,
): Promise<ProjectActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Project name is required' }

  const description = (formData.get('description') as string)?.trim() || null
  const dueDateRaw = (formData.get('due_date') as string)?.trim()
  const due_date = dueDateRaw || null

  const { error } = await supabase
    .from('projects')
    .update({ name, description, due_date, updated_at: new Date().toISOString() })
    .eq('id', projectId)

  if (error) return { error: error.message }
  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
  return {}
}

export async function deleteProject(projectId: string): Promise<ProjectActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) return { error: error.message }
  revalidatePath('/projects')
  redirect('/projects')
}

export async function deleteProjectForm(_prevState: ProjectActionResult, formData: FormData): Promise<ProjectActionResult> {
  const projectId = formData.get('projectId') as string
  if (!projectId) return { error: 'Missing project' }
  return deleteProject(projectId)
}
