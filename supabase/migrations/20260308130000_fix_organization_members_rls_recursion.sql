-- ─── Fix infinite recursion in organization_members RLS ────────────────────────
-- The previous policy "Members can view org members" subqueried organization_members
-- itself, causing infinite recursion. Replace with: users can select their own
-- membership rows (user_id = auth.uid()). This is enough for "has user an org?"
-- and for organizations policy to resolve; no self-reference.

drop policy if exists "Members can view org members" on public.organization_members;

create policy "Users can view own memberships"
  on public.organization_members for select
  using (user_id = auth.uid());
