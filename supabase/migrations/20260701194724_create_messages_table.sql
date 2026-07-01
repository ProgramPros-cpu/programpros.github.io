/*
# Create messages table

## Overview
Adds a messages table for direct messaging between administrators and field
workers. Supports the Messages page in the portal.

## New Table
### messages
- id (uuid, primary key)
- sender (text, not null) — name of the sender
- recipient (text, not null) — name of the recipient
- body (text, not null) — message content
- created_at (timestamptz, default now())

## Security
- RLS enabled, authenticated-only policies (same shared-data model as all
  other tables in this portal).
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender text NOT NULL,
  recipient text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_messages" ON messages;
CREATE POLICY "auth_select_messages" ON messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_messages" ON messages;
CREATE POLICY "auth_insert_messages" ON messages FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_messages" ON messages;
CREATE POLICY "auth_update_messages" ON messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_messages" ON messages;
CREATE POLICY "auth_delete_messages" ON messages FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
