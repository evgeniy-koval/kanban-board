import type { Metadata } from 'next'
import { OnboardingForm } from '@/components/auth/onboarding-form'

export const metadata: Metadata = {
  title: 'Get started — Kanban Board',
}

export default function OnboardingPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
            Get started
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new organization or join an existing one.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  )
}
