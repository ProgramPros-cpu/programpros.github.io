/*
# Update RLS policies for authenticated-only access

## Overview
The portal now requires authentication. All data is shared among authenticated
users (admin portal model — not per-user isolated data). This migration drops
the old anon-accessible policies and replaces them with authenticated-only
policies. Unauthenticated (anon) users get zero access to all tables.

## Changes
For every table, we:
1. Drop the 4 old anon policies (select/insert/update/delete).
2. Create 4 new authenticated-only policies.
   - SELECT: TO authenticated USING (true) — any signed-in user can read all rows.
   - INSERT: TO authenticated WITH CHECK (true) — any signed-in user can insert.
   - UPDATE: TO authenticated USING (true) WITH CHECK (true) — any signed-in user can update.
   - DELETE: TO authenticated USING (true) — any signed-in user can delete.

## Why USING (true) is correct here
This is NOT a shortcut around ownership checks. The portal is a shared admin
tool where ALL authenticated users manage the SAME dataset. There is no
per-user data isolation — every admin sees every family, form, submission,
etc. The authentication gate is at the app level (route guard), and RLS
ensures only authenticated users can touch the data. Anon (unauthenticated)
requests are blocked entirely.

## Tables affected (all 13)
locations, categories, programs, families, members, forms, form_fields,
submissions, submission_answers, custom_fields, activity_log, announcements,
notifications

## Notes
1. No schema changes — no columns added or removed, no data lost.
2. Only policy definitions change.
3. All policies are idempotent (drop first, then create).
*/

-- Helper: for each table, drop old anon policies and create authenticated policies

-- locations
DROP POLICY IF EXISTS "anon_select_locations" ON locations;
DROP POLICY IF EXISTS "anon_insert_locations" ON locations;
DROP POLICY IF EXISTS "anon_update_locations" ON locations;
DROP POLICY IF EXISTS "anon_delete_locations" ON locations;
CREATE POLICY "auth_select_locations" ON locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_locations" ON locations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_locations" ON locations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_locations" ON locations FOR DELETE TO authenticated USING (true);

-- categories
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "auth_select_categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- programs
DROP POLICY IF EXISTS "anon_select_programs" ON programs;
DROP POLICY IF EXISTS "anon_insert_programs" ON programs;
DROP POLICY IF EXISTS "anon_update_programs" ON programs;
DROP POLICY IF EXISTS "anon_delete_programs" ON programs;
CREATE POLICY "auth_select_programs" ON programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_programs" ON programs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_programs" ON programs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_programs" ON programs FOR DELETE TO authenticated USING (true);

-- families
DROP POLICY IF EXISTS "anon_select_families" ON families;
DROP POLICY IF EXISTS "anon_insert_families" ON families;
DROP POLICY IF EXISTS "anon_update_families" ON families;
DROP POLICY IF EXISTS "anon_delete_families" ON families;
CREATE POLICY "auth_select_families" ON families FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_families" ON families FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_families" ON families FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_families" ON families FOR DELETE TO authenticated USING (true);

-- members
DROP POLICY IF EXISTS "anon_select_members" ON members;
DROP POLICY IF EXISTS "anon_insert_members" ON members;
DROP POLICY IF EXISTS "anon_update_members" ON members;
DROP POLICY IF EXISTS "anon_delete_members" ON members;
CREATE POLICY "auth_select_members" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_members" ON members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_members" ON members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_members" ON members FOR DELETE TO authenticated USING (true);

-- forms
DROP POLICY IF EXISTS "anon_select_forms" ON forms;
DROP POLICY IF EXISTS "anon_insert_forms" ON forms;
DROP POLICY IF EXISTS "anon_update_forms" ON forms;
DROP POLICY IF EXISTS "anon_delete_forms" ON forms;
CREATE POLICY "auth_select_forms" ON forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_forms" ON forms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_forms" ON forms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_forms" ON forms FOR DELETE TO authenticated USING (true);

-- form_fields
DROP POLICY IF EXISTS "anon_select_form_fields" ON form_fields;
DROP POLICY IF EXISTS "anon_insert_form_fields" ON form_fields;
DROP POLICY IF EXISTS "anon_update_form_fields" ON form_fields;
DROP POLICY IF EXISTS "anon_delete_form_fields" ON form_fields;
CREATE POLICY "auth_select_form_fields" ON form_fields FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_form_fields" ON form_fields FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_form_fields" ON form_fields FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_form_fields" ON form_fields FOR DELETE TO authenticated USING (true);

-- submissions
DROP POLICY IF EXISTS "anon_select_submissions" ON submissions;
DROP POLICY IF EXISTS "anon_insert_submissions" ON submissions;
DROP POLICY IF EXISTS "anon_update_submissions" ON submissions;
DROP POLICY IF EXISTS "anon_delete_submissions" ON submissions;
CREATE POLICY "auth_select_submissions" ON submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_submissions" ON submissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_submissions" ON submissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_submissions" ON submissions FOR DELETE TO authenticated USING (true);

-- submission_answers
DROP POLICY IF EXISTS "anon_select_submission_answers" ON submission_answers;
DROP POLICY IF EXISTS "anon_insert_submission_answers" ON submission_answers;
DROP POLICY IF EXISTS "anon_update_submission_answers" ON submission_answers;
DROP POLICY IF EXISTS "anon_delete_submission_answers" ON submission_answers;
CREATE POLICY "auth_select_submission_answers" ON submission_answers FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_submission_answers" ON submission_answers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_submission_answers" ON submission_answers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_submission_answers" ON submission_answers FOR DELETE TO authenticated USING (true);

-- custom_fields
DROP POLICY IF EXISTS "anon_select_custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "anon_insert_custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "anon_update_custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "anon_delete_custom_fields" ON custom_fields;
CREATE POLICY "auth_select_custom_fields" ON custom_fields FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_custom_fields" ON custom_fields FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_custom_fields" ON custom_fields FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_custom_fields" ON custom_fields FOR DELETE TO authenticated USING (true);

-- activity_log
DROP POLICY IF EXISTS "anon_select_activity_log" ON activity_log;
DROP POLICY IF EXISTS "anon_insert_activity_log" ON activity_log;
DROP POLICY IF EXISTS "anon_update_activity_log" ON activity_log;
DROP POLICY IF EXISTS "anon_delete_activity_log" ON activity_log;
CREATE POLICY "auth_select_activity_log" ON activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_activity_log" ON activity_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_activity_log" ON activity_log FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_activity_log" ON activity_log FOR DELETE TO authenticated USING (true);

-- announcements
DROP POLICY IF EXISTS "anon_select_announcements" ON announcements;
DROP POLICY IF EXISTS "anon_insert_announcements" ON announcements;
DROP POLICY IF EXISTS "anon_update_announcements" ON announcements;
DROP POLICY IF EXISTS "anon_delete_announcements" ON announcements;
CREATE POLICY "auth_select_announcements" ON announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_announcements" ON announcements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_announcements" ON announcements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_announcements" ON announcements FOR DELETE TO authenticated USING (true);

-- notifications
DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "auth_select_notifications" ON notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_notifications" ON notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_notifications" ON notifications FOR DELETE TO authenticated USING (true);
