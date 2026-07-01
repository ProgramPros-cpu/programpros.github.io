/*
# Create core tables for Family Data Collection Portal

## Overview
This migration creates the foundational tables for the family data collection
portal: locations, categories, programs, families, and members. These tables
store the primary entities that field workers collect data about.

## New Tables

### locations
Geographic areas where families reside. Used to organize field workers and
filter records by region/district/area.
- id (uuid, primary key)
- name (text, not null) — e.g. "Asansol"
- region (text) — broader region e.g. "West Bengal"
- code (text, unique) — short code like "ASR"
- created_at (timestamptz)

### categories
Classification groups for family records (health, education, housing, etc.).
- id (uuid, primary key)
- name (text, not null)
- description (text)
- color (text) — hex color for UI badges
- created_at (timestamptz)

### programs
Groupings of related surveys and data collection efforts (welfare, health,
education initiatives).
- id (uuid, primary key)
- name (text, not null)
- description (text)
- status (text, default 'active') — active | paused | completed
- start_date (date)
- end_date (date)
- created_at (timestamptz)

### families
The central entity — a household with a head of family and members.
- id (uuid, primary key)
- family_code (text, unique, not null) — human-readable ID like "FAM-2847"
- head_of_family (text, not null) — name of the head
- location_id (uuid, FK → locations.id, nullable)
- program_id (uuid, FK → programs.id, nullable)
- category_id (uuid, FK → categories.id, nullable)
- member_count (int, default 0) — denormalized count for quick display
- status (text, default 'pending') — pending | complete | review | incomplete
- survey_name (text) — which survey this family was collected under
- last_updated (date) — date of last data update
- created_at (timestamptz)

### members
Individual people belonging to a family.
- id (uuid, primary key)
- family_id (uuid, FK → families.id ON DELETE CASCADE, not null)
- full_name (text, not null)
- role (text) — head | spouse | son | daughter | other
- age (int)
- gender (text) — male | female | other
- contact (text)
- status (text, default 'pending') — pending | verified | review | incomplete
- created_at (timestamptz)

## Security
- RLS enabled on ALL tables.
- This is a single-tenant admin portal with NO sign-in screen, so all policies
  use `TO anon, authenticated` with `USING (true)` — the data is intentionally
  shared/public across the portal.
- 4 policies per table (select/insert/update/delete).

## Notes
1. Foreign keys use ON DELETE CASCADE for members → families so deleting a
   family removes its members automatically.
2. family_code is unique so duplicate IDs are prevented at the DB level.
3. member_count is a denormalized convenience column; the app keeps it in sync.
*/

-- locations
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region text,
  code text UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_locations" ON locations;
CREATE POLICY "anon_select_locations" ON locations FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_locations" ON locations;
CREATE POLICY "anon_insert_locations" ON locations FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_locations" ON locations;
CREATE POLICY "anon_update_locations" ON locations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_locations" ON locations;
CREATE POLICY "anon_delete_locations" ON locations FOR DELETE
  TO anon, authenticated USING (true);

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text DEFAULT '#4f46e5',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

-- programs
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_programs" ON programs;
CREATE POLICY "anon_select_programs" ON programs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_programs" ON programs;
CREATE POLICY "anon_insert_programs" ON programs FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_programs" ON programs;
CREATE POLICY "anon_update_programs" ON programs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_programs" ON programs;
CREATE POLICY "anon_delete_programs" ON programs FOR DELETE
  TO anon, authenticated USING (true);

-- families
CREATE TABLE IF NOT EXISTS families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_code text UNIQUE NOT NULL,
  head_of_family text NOT NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  member_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  survey_name text,
  last_updated date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_families" ON families;
CREATE POLICY "anon_select_families" ON families FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_families" ON families;
CREATE POLICY "anon_insert_families" ON families FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_families" ON families;
CREATE POLICY "anon_update_families" ON families FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_families" ON families;
CREATE POLICY "anon_delete_families" ON families FOR DELETE
  TO anon, authenticated USING (true);

-- members
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text,
  age int,
  gender text,
  contact text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_members" ON members;
CREATE POLICY "anon_select_members" ON members FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_members" ON members;
CREATE POLICY "anon_insert_members" ON members FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_members" ON members;
CREATE POLICY "anon_update_members" ON members FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_members" ON members;
CREATE POLICY "anon_delete_members" ON members FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_families_location_id ON families(location_id);
CREATE INDEX IF NOT EXISTS idx_families_status ON families(status);
CREATE INDEX IF NOT EXISTS idx_families_family_code ON families(family_code);
CREATE INDEX IF NOT EXISTS idx_members_family_id ON members(family_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
