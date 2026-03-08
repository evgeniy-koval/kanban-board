'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ProjectFieldActionResult = { error?: string }

type OptionInput = { value: string; color?: string | null }

function parseOptions(formData: FormData): OptionInput[] {
  const raw = formData.get('options') as string
  if (!raw?.trim()) return []
  try {
    const arr = JSON.parse(raw) as OptionInput[]
    return Array.isArray(arr) ? arr.filter((o) => o?.value?.trim()) : []
  } catch {
    return []
  }
}

export async function createProjectField(
  projectId: string,
  _prevState: ProjectFieldActionResult,
  formData: FormData,
): Promise<ProjectFieldActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Field name is required' }

  const options = parseOptions(formData)

  const { data: field, error: fieldError } = await supabase
    .from('project_fields')
    .insert({ project_id: projectId, name })
    .select('id')
    .single()

  if (fieldError) return { error: fieldError.message }
  if (!field?.id) return { error: 'Failed to create field' }

  if (options.length > 0) {
    const rows = options.map((o, i) => ({
      field_id: field.id,
      value: o.value.trim(),
      position: i,
      color: o.color?.trim() || null,
    }))
    const { error: optsError } = await supabase.from('project_field_options').insert(rows)
    if (optsError) return { error: optsError.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return {}
}

export async function updateProjectField(
  fieldId: string,
  projectId: string,
  _prevState: ProjectFieldActionResult,
  formData: FormData,
): Promise<ProjectFieldActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Field name is required' }

  const options = parseOptions(formData)

  const { error: fieldError } = await supabase
    .from('project_fields')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', fieldId)

  if (fieldError) return { error: fieldError.message }

  const { data: existing } = await supabase
    .from('project_field_options')
    .select('id')
    .eq('field_id', fieldId)

  const existingIds = (existing ?? []).map((r) => r.id)
  const { error: deleteError } = await supabase
    .from('project_field_options')
    .delete()
    .eq('field_id', fieldId)
  if (deleteError) return { error: deleteError.message }

  if (options.length > 0) {
    const rows = options.map((o, i) => ({
      field_id: fieldId,
      value: o.value.trim(),
      position: i,
      color: o.color?.trim() || null,
    }))
    const { error: insertError } = await supabase.from('project_field_options').insert(rows)
    if (insertError) return { error: insertError.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return {}
}

export async function deleteProjectField(
  fieldId: string,
  projectId: string,
): Promise<ProjectFieldActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('project_fields').delete().eq('id', fieldId)
  if (error) return { error: error.message }
  revalidatePath(`/projects/${projectId}`)
  return {}
}

export async function deleteProjectFieldForm(
  _prevState: ProjectFieldActionResult,
  formData: FormData,
): Promise<ProjectFieldActionResult> {
  const fieldId = formData.get('fieldId') as string
  const projectId = formData.get('projectId') as string
  if (!fieldId || !projectId) return { error: 'Missing field or project' }
  return deleteProjectField(fieldId, projectId)
}
