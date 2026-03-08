import Link from "next/link";
import { signOut } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { AccountMenu } from "./account-menu";
import { AppLogo } from "../app-logo";

const NAV_ITEMS = [
  {
    label: "Projects",
    href: "/projects",
  },
  {
    label: "Posts",
    href: "/",
  },
  {
    label: "Notifications",
    href: "/",
  },
  {
    label: "Settings",
    href: "/",
  },
  {
    label: "Employees",
    href: "/",
  },
  {
    label: "Memberships",
    href: "/",
  },
  {
    label: "Search",
    href: "/",
  },
  {
    label: "Billing",
    href: "/",
  },
];

export async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between px-6">
        <Link
          href="/"
          className="font-semibold text-foreground transition-colors hover:text-foreground/90"
        >
          <AppLogo />
        </Link>
        <nav className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <AccountMenu signOutAction={signOut} user={user} />
      </div>
    </header>
  );
}
