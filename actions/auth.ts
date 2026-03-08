'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthActionResult = {
  error?: string
}

export type OnboardingActionResult = {
  error?: string
}

export async function checkUsername(username: string): Promise<{ available: boolean; error?: string }> {
  if (!username?.trim()) return { available: false }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username.trim())
    .maybeSingle()
  if (error) return { available: false, error: error.message }
  return { available: !data }
}

export async function signIn(
  _prevState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

export async function signUp(
  _prevState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const username = (formData.get('username') as string)?.trim()

  if (!username) {
    return { error: 'Username is required.' }
  }

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name: fullName },
    },
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  redirect('/onboarding')
}

export async function createOrganization(
  _prevState: OnboardingActionResult,
  formData: FormData,
): Promise<OnboardingActionResult> {
  const supabase = await createClient()

  const name = (formData.get('org_name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  if (!name || !slug) {
    return { error: 'Organization name and slug are required.' }
  }

  const { error } = await supabase.rpc('create_organization_and_join', {
    p_name: name,
    p_slug: slug,
    p_email: null,
    p_address: null,
    p_website: null,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'This slug is already taken. Please choose another.' }
    }
    return { error: error.message }
  }

  redirect('/')
}

export async function joinOrganization(
  _prevState: OnboardingActionResult,
  formData: FormData,
): Promise<OnboardingActionResult> {
  const supabase = await createClient()

  const slug = (formData.get('slug') as string)?.trim()
  if (!slug) {
    return { error: 'Organization slug is required.' }
  }

  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const { error } = await supabase.rpc('join_organization_by_slug', {
    p_slug: normalizedSlug,
  })

  if (error) {
    if (error.message === 'Organization not found') {
      return { error: 'No organization found with this slug. Check the link or ask your admin.' }
    }
    return { error: error.message }
  }

  redirect('/')
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
