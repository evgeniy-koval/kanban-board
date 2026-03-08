import { createClient } from "@/lib/supabase/server";
import { ProjectsSidebar } from "@/components/projects/projects-sidebar";
import type { Project } from "@/lib/types";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: membership } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user?.id ?? "")
    .limit(1)
    .single();

  let projects: Project[] = [];
  if (membership?.org_id) {
    const { data } = await supabase
      .from("projects")
      .select("id, name, description, due_date, org_id, created_at, updated_at")
      .eq("org_id", membership.org_id)
      .order("updated_at", { ascending: false });
    projects = (data ?? []) as Project[];
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] flex-1 flex-col gap-0 sm:flex-row">
      <ProjectsSidebar projects={projects} />
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
