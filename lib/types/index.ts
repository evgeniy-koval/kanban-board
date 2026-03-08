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

export type Project = {
  id: string;
  name: string;
  description: string | null;
  due_date: string | null;
  org_id: string;
  created_at: string;
  updated_at: string;
};

export type ProjectField = {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type ProjectFieldOption = {
  id: string;
  field_id: string;
  value: string;
  position: number;
  color: string | null;
  created_at: string;
  updated_at: string;
};
