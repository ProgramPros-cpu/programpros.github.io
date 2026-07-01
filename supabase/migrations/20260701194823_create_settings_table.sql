/*
# Create settings table

## Overview
Adds a key-value settings table for storing organization profile and portal
preferences. The Settings page reads and writes to this table.

## New Table
### settings
- id (uuid, primary key)
- key (text, unique, not null) — e.g. "org_name", "org_email", "notif_email"
- value (text) — the setting value as a string
- updated_at (timestamptz, default now())

## Security
- RLS enabled, authenticated-only policies.
*/

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_settings" ON settings;
CREATE POLICY "auth_select_settings" ON settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_settings" ON settings;
CREATE POLICY "auth_insert_settings" ON settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_settings" ON settings;
CREATE POLICY "auth_update_settings" ON settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_settings" ON settings;
CREATE POLICY "auth_delete_settings" ON settings FOR DELETE TO authenticated USING (true);
