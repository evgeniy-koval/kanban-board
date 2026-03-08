# Cursor Agent Prompt — Auth + Profiles + Org Flow

## Project Stack
- Next.js 16 App Router
- Supabase (email confirmation is **disabled**)

---

## Environment Variables

Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

---

## Database

Replace the existing initial migration with a fresh one that includes:

**`profiles` table**
- `id` referencing `auth.users` as primary key
- `username` — unique, not null
- `full_name` — not null
- `created_at`
- RLS so users can only read and update their own profile

**`organizations` table**
- id, name, email, address(optional), website(optional), unique slug, created_at
- RLS so users can only see organizations they belong to

**`organization_members` join table**
- Links auth users to organizations
- RLS so users can only see members of their own organization

**RPC function**
- A Postgres function that atomically creates an organization and adds the calling user as its first member in a single transaction

---

## Folder Structure

```
proxy.ts                     ← Next.js convention: matcher config + calls lib/supabase/proxy.ts
lib/
  supabase/
    proxy.ts                 ← session refresh logic (updateSession)
    client.ts                ← browser client
    server.ts                ← server client
app/
  (auth)/
    signup/page.tsx
    login/page.tsx
  (onboarding)/
    onboarding/page.tsx
  (app)/
    dashboard/page.tsx
```

---

## Proxy Setup (two files)

**`lib/supabase/proxy.ts`** — contains the `updateSession` function responsible for refreshing the Supabase auth token via cookies and returning the response. This is where all Supabase session handling logic lives.

**`proxy.ts`** (root) — the Next.js proxy entry point. It imports and calls `updateSession` from `lib/supabase/proxy.ts`, then applies the routing rules below. Also exports a `config` with a matcher that excludes `_next/static`, `_next/image`, `favicon.ico`, and static file extensions.

---

## Routing Rules (applied in root proxy.ts after updateSession)

- Unauthenticated user visiting a protected route → redirect to `/login`
- Authenticated user with no org visiting any route other than `/onboarding` → redirect to `/onboarding`
- Authenticated user with an org visiting `/onboarding` → redirect to `/dashboard`
- Authenticated user visiting `/login` or `/signup` → redirect to `/dashboard`

---

## Auth Flow

**Signup:** A single form with email, password, username, and full name fields. On submit:
1. Debounced real-time username availability check against the `profiles` table — show inline feedback before the user submits
2. Call `supabase.auth.signUp()` with email and password
3. Immediately insert into `profiles` with the returned user id, username, and full name
4. On success redirect to `/onboarding`

Treat both operations as a unit — surface a clear error if the profile insert fails. Do not leave orphaned auth users without a profile.

**Login:** Email and password form. On success redirect to `/dashboard`. The proxy will intercept and redirect to `/onboarding` if the user has no org.

**Signout:** Available from the dashboard. Redirects to `/login`.

---

## Onboarding

Shown to any authenticated user without an organization. Single form with org name and slug. Slug is auto-generated from the org name but stays user-editable. On submit, call the RPC to atomically create the org and add the user as a member. On success redirect to `/dashboard`. Show a clear error if the slug is already taken.

---

## Dashboard

Server-rendered. Fetches and displays the user's full name and organization name. Includes a sign out button.

---

## Notes

- Use `@supabase/ssr` — not the deprecated `auth-helpers-nextjs`
- Always use `supabase.auth.getUser()` server-side, never `getSession()` — `getUser()` validates the token with the Supabase Auth server on every call
- Server components and both proxy files must use the server client from `lib/supabase/server.ts`; client components use the browser client from `lib/supabase/client.ts`
- Signup is a single form — do not split into multiple steps or pages
