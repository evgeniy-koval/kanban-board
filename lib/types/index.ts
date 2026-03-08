import { User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  created_at: string;
  avatar_url: string;
};

export type Organization = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  website: string | null;
  slug: string;
  created_at: string;
};

export type OrganizationMember = {
  id: string;
  org_id: string;
  user_id: string;
};
