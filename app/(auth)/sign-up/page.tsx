import type { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/sign-up-form'

export const metadata: Metadata = {
  title: 'Sign up — Kanban Board',
}

export default function SignUpPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details and your organization email to get started.
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
