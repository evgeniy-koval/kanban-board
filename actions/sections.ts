'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SectionActionResult = { error?: string }

export async function createSection(
  projectId: string,
  _prevState: SectionActionResult,
  formData: FormData,
): Promise<SectionActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Section name is required' }

  const { data: maxPos } = await supabase
    .from('sections')
    .select('position')
    .eq('project_id', projectId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = (maxPos?.position ?? -1) + 1

  const { error } = await supabase.from('sections').insert({
    name,
    position,
    project_id: projectId,
  })

  if (error) return { error: error.message }
  revalidatePath(`/projects/${projectId}`)
  return {}
}

export async function updateSectionName(sectionId: string, name: string): Promise<SectionActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const trimmed = name?.trim()
  if (!trimmed) return { error: 'Section name is required' }

  const { data: section } = await supabase
    .from('sections')
    .select('project_id')
    .eq('id', sectionId)
    .single()
  if (!section) return { error: 'Section not found' }

  const { error } = await supabase
    .from('sections')
    .update({ name: trimmed, updated_at: new Date().toISOString() })
    .eq('id', sectionId)

  if (error) return { error: error.message }
  revalidatePath(`/projects/${section.project_id}`)
  return {}
}

export async function updateSectionsOrder(
  projectId: string,
  sectionIds: string[],
): Promise<SectionActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  for (let i = 0; i < sectionIds.length; i++) {
    const { error } = await supabase
      .from('sections')
      .update({ position: i, updated_at: new Date().toISOString() })
      .eq('id', sectionIds[i])
      .eq('project_id', projectId)
    if (error) return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return {}
}

export async function deleteSection(sectionId: string): Promise<SectionActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: section } = await supabase
    .from('sections')
    .select('project_id')
    .eq('id', sectionId)
    .single()
  if (!section) return { error: 'Section not found' }

  const { error } = await supabase.from('sections').delete().eq('id', sectionId)
  if (error) return { error: error.message }
  revalidatePath(`/projects/${section.project_id}`)
  return {}
}
