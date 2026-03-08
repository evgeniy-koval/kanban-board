'use client'

import { useActionState, useState, useEffect } from 'react'
import {
  createOrganization,
  joinOrganization,
  type OnboardingActionResult,
} from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: OnboardingActionResult = {}

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

type Mode = 'create' | 'join'

export function OnboardingForm() {
  const [mode, setMode] = useState<Mode>('create')

  const [createState, createAction, isCreatePending] = useActionState(
    createOrganization,
    initialState,
  )
  const [joinState, joinAction, isJoinPending] = useActionState(
    joinOrganization,
    initialState,
  )

  const [orgName, setOrgName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [joinSlug, setJoinSlug] = useState('')

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugFromName(orgName))
    }
  }, [orgName, slugTouched])

  const error = mode === 'create' ? createState.error : joinState.error
  const isPending = mode === 'create' ? isCreatePending : isJoinPending

  return (
    <div className="flex flex-col gap-5">
      <div className="flex rounded-lg border border-border bg-muted/30 p-1">
        <button
          type="button"
          onClick={() => setMode('create')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'create'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Create organization
        </button>
        <button
          type="button"
          onClick={() => setMode('join')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'join'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Join organization
        </button>
      </div>

      {mode === 'create' ? (
        <form action={createAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="org_name">Organization name</Label>
            <Input
              id="org_name"
              name="org_name"
              type="text"
              placeholder="Acme Inc."
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              type="text"
              placeholder="acme-inc"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              onBlur={() => setSlugTouched(true)}
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly identifier. Auto-generated from the name; you can edit it.
            </p>
          </div>

          {error && (
            <p
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Creating…' : 'Create organization'}
          </Button>
        </form>
      ) : (
        <form action={joinAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="join_slug">Organization slug</Label>
            <Input
              id="join_slug"
              name="slug"
              type="text"
              placeholder="acme-inc"
              required
              value={joinSlug}
              onChange={(e) => setJoinSlug(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Ask your admin for the organization slug (e.g. from the invite link).
            </p>
          </div>

          {error && (
            <p
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Joining…' : 'Join organization'}
          </Button>
        </form>
      )}
    </div>
  )
}
