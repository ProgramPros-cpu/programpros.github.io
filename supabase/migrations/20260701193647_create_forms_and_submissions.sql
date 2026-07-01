/*
# Create forms, submissions, and custom fields tables

## Overview
This migration adds the data-collection layer: survey forms, the fields that
make up each form, individual submissions from field workers, and the answers
within each submission. It also adds custom fields for capturing data beyond
the standard schema.

## New Tables

### forms
Survey/questionnaire definitions that field workers fill out per family.
- id (uuid, primary key)
- title (text, not null) — e.g. "Health Survey 2025"
- description (text)
- program_id (uuid, FK → programs.id, nullable)
- status (text, default 'draft') — draft | active | paused
- target_responses (int, default 0) — goal for number of responses
- response_count (int, default 0) — denormalized count
- deadline (date)
- created_at (timestamptz)

### form_fields
Individual questions/fields within a form.
- id (uuid, primary key)
- form_id (uuid, FK → forms.id ON DELETE CASCADE, not null)
- label (text, not null) — the question text
- field_type (text, not null) — text | number | date | dropdown | checkbox | radio
- options (jsonb) — for dropdown/radio/checkbox: array of option strings
- required (boolean, default false)
- sort_order (int, default 0)
- created_at (timestamptz)

### submissions
A single completed (or in-progress) form instance submitted by a field worker
for a specific family.
- id (uuid, primary key)
- form_id (uuid, FK → forms.id ON DELETE CASCADE, not null)
- family_id (uuid, FK → families.id ON DELETE SET NULL, nullable)
- submitted_by (text) — name of the field worker
- status (text, default 'pending') — pending | verified | review | rejected
- submitted_at (timestamptz, default now())
- created_at (timestamptz)

### submission_answers
The actual answers for each field within a submission.
- id (uuid, primary key)
- submission_id (uuid, FK → submissions.id ON DELETE CASCADE, not null)
- field_id (uuid, FK → form_fields.id ON DELETE CASCADE, not null)
- value (text) — the answer value (stored as text, cast by app as needed)
- created_at (timestamptz)

### custom_fields
User-defined fields for capturing additional family data beyond the standard
schema. These appear on family records.
- id (uuid, primary key)
- name (text, not null)
- field_type (text, not null) — text | number | date | dropdown
- options (jsonb) — for dropdown type
- entity_type (text, default 'family') — family | member (which entity it applies to)
- created_at (timestamptz)

## Security
- RLS enabled on ALL tables.
- Single-tenant no-auth portal: all policies use `TO anon, authenticated`
  with `USING (true)` / `WITH CHECK (true)` — data is intentionally shared.
- 4 policies per table (select/insert/update/delete).

## Notes
1. form_fields and submission_answers cascade-delete with their parent form /
   submission respectively, so removing a form cleans up its fields and
   removing a submission cleans up its answers.
2. submissions.family_id is SET NULL on family delete — the submission record
   is preserved for audit even if the family is removed.
3. response_count on forms is a denormalized convenience for the dashboard.
*/

-- forms
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  target_responses int NOT NULL DEFAULT 0,
  response_count int NOT NULL DEFAULT 0,
  deadline date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_forms" ON forms;
CREATE POLICY "anon_select_forms" ON forms FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_forms" ON forms;
CREATE POLICY "anon_insert_forms" ON forms FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_forms" ON forms;
CREATE POLICY "anon_update_forms" ON forms FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_forms" ON forms;
CREATE POLICY "anon_delete_forms" ON forms FOR DELETE
  TO anon, authenticated USING (true);

-- form_fields
CREATE TABLE IF NOT EXISTS form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  label text NOT NULL,
  field_type text NOT NULL,
  options jsonb,
  required boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_form_fields" ON form_fields;
CREATE POLICY "anon_select_form_fields" ON form_fields FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_form_fields" ON form_fields;
CREATE POLICY "anon_insert_form_fields" ON form_fields FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_form_fields" ON form_fields;
CREATE POLICY "anon_update_form_fields" ON form_fields FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_form_fields" ON form_fields;
CREATE POLICY "anon_delete_form_fields" ON form_fields FOR DELETE
  TO anon, authenticated USING (true);

-- submissions
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  family_id uuid REFERENCES families(id) ON DELETE SET NULL,
  submitted_by text,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_submissions" ON submissions;
CREATE POLICY "anon_select_submissions" ON submissions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_submissions" ON submissions;
CREATE POLICY "anon_insert_submissions" ON submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_submissions" ON submissions;
CREATE POLICY "anon_update_submissions" ON submissions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_submissions" ON submissions;
CREATE POLICY "anon_delete_submissions" ON submissions FOR DELETE
  TO anon, authenticated USING (true);

-- submission_answers
CREATE TABLE IF NOT EXISTS submission_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
  value text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE submission_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_submission_answers" ON submission_answers;
CREATE POLICY "anon_select_submission_answers" ON submission_answers FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_submission_answers" ON submission_answers;
CREATE POLICY "anon_insert_submission_answers" ON submission_answers FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_submission_answers" ON submission_answers;
CREATE POLICY "anon_update_submission_answers" ON submission_answers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_submission_answers" ON submission_answers;
CREATE POLICY "anon_delete_submission_answers" ON submission_answers FOR DELETE
  TO anon, authenticated USING (true);

-- custom_fields
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  field_type text NOT NULL,
  options jsonb,
  entity_type text NOT NULL DEFAULT 'family',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_custom_fields" ON custom_fields;
CREATE POLICY "anon_select_custom_fields" ON custom_fields FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_custom_fields" ON custom_fields;
CREATE POLICY "anon_insert_custom_fields" ON custom_fields FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_custom_fields" ON custom_fields;
CREATE POLICY "anon_update_custom_fields" ON custom_fields FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_custom_fields" ON custom_fields;
CREATE POLICY "anon_delete_custom_fields" ON custom_fields FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_family_id ON submissions(family_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submission_answers_submission_id ON submission_answers(submission_id);
