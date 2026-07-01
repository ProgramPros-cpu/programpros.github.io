export type Location = {
  id: string;
  name: string;
  region: string | null;
  code: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
};

export type Program = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

export type Family = {
  id: string;
  family_code: string;
  head_of_family: string;
  location_id: string | null;
  program_id: string | null;
  category_id: string | null;
  member_count: number;
  status: string;
  survey_name: string | null;
  last_updated: string | null;
  created_at: string;
  locations?: Location;
};

export type Member = {
  id: string;
  family_id: string;
  full_name: string;
  role: string | null;
  age: number | null;
  gender: string | null;
  contact: string | null;
  status: string;
  created_at: string;
  families?: Pick<Family, "family_code">;
};

export type Form = {
  id: string;
  title: string;
  description: string | null;
  program_id: string | null;
  status: string;
  target_responses: number;
  response_count: number;
  deadline: string | null;
  created_at: string;
};

export type FormField = {
  id: string;
  form_id: string;
  label: string;
  field_type: string;
  options: string[] | null;
  required: boolean;
  sort_order: number;
  created_at: string;
};

export type Submission = {
  id: string;
  form_id: string;
  family_id: string | null;
  submitted_by: string | null;
  status: string;
  submitted_at: string;
  created_at: string;
  forms?: Pick<Form, "title">;
  families?: Pick<Family, "family_code" | "head_of_family">;
};

export type CustomField = {
  id: string;
  name: string;
  field_type: string;
  options: string[] | null;
  entity_type: string;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  actor: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string | null;
  status: string;
  created_at: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      locations: { Row: Location; Insert: Partial<Location> };
      categories: { Row: Category; Insert: Partial<Category> };
      programs: { Row: Program; Insert: Partial<Program> };
      families: { Row: Family; Insert: Partial<Family> };
      members: { Row: Member; Insert: Partial<Member> };
      forms: { Row: Form; Insert: Partial<Form> };
      form_fields: { Row: FormField; Insert: Partial<FormField> };
      submissions: { Row: Submission; Insert: Partial<Submission> };
      custom_fields: { Row: CustomField; Insert: Partial<CustomField> };
      activity_log: { Row: ActivityLog; Insert: Partial<ActivityLog> };
      announcements: { Row: Announcement; Insert: Partial<Announcement> };
      notifications: { Row: Notification; Insert: Partial<Notification> };
    };
  };
};
