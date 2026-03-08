'use client'

import { useActionState, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { signUp, checkUsername, type AuthActionResult } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: AuthActionResult = {}
const DEBOUNCE_MS = 400

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUp, initialState)
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [usernameError, setUsernameError] = useState<string | null>(null)

  const check = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setUsernameStatus('idle')
      setUsernameError(null)
      return
    }
    setUsernameStatus('checking')
    setUsernameError(null)
    const result = await checkUsername(trimmed)
    if (result.error) {
      setUsernameStatus('idle')
      setUsernameError(result.error)
      return
    }
    setUsernameStatus(result.available ? 'available' : 'taken')
  }, [])

  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus('idle')
      return
    }
    const t = setTimeout(() => check(username), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [username, check])

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="Jane Doe"
          autoComplete="name"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="janedoe"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-describedby="username-feedback"
        />
        <p id="username-feedback" className="text-xs text-muted-foreground" role="status">
          {usernameStatus === 'checking' && 'Checking…'}
          {usernameStatus === 'available' && (
            <span className="text-green-600 dark:text-green-400">Available</span>
          )}
          {usernameStatus === 'taken' && (
            <span className="text-destructive">This username is taken</span>
          )}
          {usernameError && (
            <span className="text-destructive">{usernameError}</span>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>

      {state.error && (
        <p
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending || usernameStatus === 'taken' || usernameStatus === 'checking'}
        className="w-full"
      >
        {isPending ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Button asChild variant="link" className="text-sm font-medium">
          <Link href="/login">Log in</Link>
        </Button>
      </p>
    </form>
  )
}
