/*
# Create user_profiles and workflows tables

## Overview
Adds two tables:
1. user_profiles — stores display info for portal users (name, role, email).
   This supplements auth.users with app-level metadata visible to all admins.
2. workflows — stores data review workflow definitions.

## New Tables
### user_profiles
- id (uuid, primary key)
- user_id (uuid, nullable) — links to auth.users if applicable
- full_name (text, not null)
- email (text, nullable)
- role (text, default 'viewer') — admin | field_worker | reviewer | viewer
- status (text, default 'active') — active | suspended
- created_at (timestamptz)

### workflows
- id (uuid, primary key)
- name (text, not null)
- description (text)
- steps (jsonb) — array of step definitions
- status (text, default 'active') — active | inactive
- created_at (timestamptz)

## Security
- RLS enabled, authenticated-only policies on both tables.
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  email text,
  role text NOT NULL DEFAULT 'viewer',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_user_profiles" ON user_profiles;
CREATE POLICY "auth_select_user_profiles" ON user_profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_user_profiles" ON user_profiles;
CREATE POLICY "auth_insert_user_profiles" ON user_profiles FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_user_profiles" ON user_profiles;
CREATE POLICY "auth_update_user_profiles" ON user_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_user_profiles" ON user_profiles;
CREATE POLICY "auth_delete_user_profiles" ON user_profiles FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  steps jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_workflows" ON workflows;
CREATE POLICY "auth_select_workflows" ON workflows FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_workflows" ON workflows;
CREATE POLICY "auth_insert_workflows" ON workflows FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_workflows" ON workflows;
CREATE POLICY "auth_update_workflows" ON workflows FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_workflows" ON workflows;
CREATE POLICY "auth_delete_workflows" ON workflows FOR DELETE TO authenticated USING (true);
