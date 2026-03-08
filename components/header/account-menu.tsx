"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { signOut } from "@/actions/auth";
import { UserAvatar } from "../ui/user-avatar";

const LOGOUT_FORM_ID = "header-logout-form";

type AccountMenuProps = {
  signOutAction: typeof signOut;
  user: User | null;
};

export function AccountMenu({ signOutAction, user }: AccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="icon" size="sm" className="text-sm border border-border rounded-full p-0">
          <UserAvatar user={user} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/account">Account settings</Link>
        </DropdownMenuItem>
        <form id={LOGOUT_FORM_ID} action={signOutAction} className="hidden" />
        <DropdownMenuItem asChild>
          <button type="submit" form={LOGOUT_FORM_ID}>
            Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
