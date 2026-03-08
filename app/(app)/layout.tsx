import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/header/app-header";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership?.org_id) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto">{children}</main>
    </div>
  );
}
