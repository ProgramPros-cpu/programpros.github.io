/*
# Create activity log, announcements, and notifications tables

## Overview
This migration adds the communication and audit layer: an activity log for
the dashboard feed, announcements broadcast to field workers, and
notifications for individual users.

## New Tables

### activity_log
System-wide activity feed shown on the dashboard. Records who did what and
when — submissions, approvals, edits, flags.
- id (uuid, primary key)
- actor (text, not null) — name of the person or "System"
- action (text, not null) — description of what happened
- entity_type (text) — family | member | form | submission | system
- entity_id (uuid) — optional reference to the related record
- icon (text) — emoji/symbol for the activity dot (✓, !, +, ✎)
- color (text) — hex color for the activity dot background
- created_at (timestamptz, default now())

### announcements
Broadcast messages posted by admins for field workers and members.
- id (uuid, primary key)
- title (text, not null)
- body (text)
- status (text, default 'active') — active | archived
- created_at (timestamptz, default now())

### notifications
Individual notifications (more targeted than announcements). Shown in the
notifications bell dropdown.
- id (uuid, primary key)
- title (text, not null)
- body (text)
- type (text, default 'info') — info | success | warning | error
- is_read (boolean, default false)
- created_at (timestamptz, default now())

## Security
- RLS enabled on ALL tables.
- Single-tenant no-auth portal: all policies use `TO anon, authenticated`
  with `USING (true)` / `WITH CHECK (true)` — data is intentionally shared.
- 4 policies per table (select/insert/update/delete).

## Notes
1. activity_log is append-mostly — the app inserts rows as events happen.
2. notifications.is_read is toggled by the app when a user dismisses/reads it.
3. These tables support the dashboard activity feed, the announcements page,
   and the notifications page respectively.
*/

-- activity_log
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  icon text DEFAULT '✓',
  color text DEFAULT '#eef2ff',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_activity_log" ON activity_log;
CREATE POLICY "anon_select_activity_log" ON activity_log FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_activity_log" ON activity_log;
CREATE POLICY "anon_insert_activity_log" ON activity_log FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_activity_log" ON activity_log;
CREATE POLICY "anon_update_activity_log" ON activity_log FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_activity_log" ON activity_log;
CREATE POLICY "anon_delete_activity_log" ON activity_log FOR DELETE
  TO anon, authenticated USING (true);

-- announcements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_announcements" ON announcements;
CREATE POLICY "anon_select_announcements" ON announcements FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_announcements" ON announcements;
CREATE POLICY "anon_insert_announcements" ON announcements FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_announcements" ON announcements;
CREATE POLICY "anon_update_announcements" ON announcements FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_announcements" ON announcements;
CREATE POLICY "anon_delete_announcements" ON announcements FOR DELETE
  TO anon, authenticated USING (true);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
