/*
# Create helper RPC for family member count

## Overview
Creates a stored procedure that increments the member_count column on the
families table when a new member is added. This keeps the denormalized count
in sync without requiring the app to do a separate UPDATE.

## New Functions
- increment_family_count(fam_id uuid) — increments families.member_count by 1
  for the given family ID. Returns the new count. Safe to call multiple times.

## Security
- The function is SECURITY DEFINER so it can run even though the caller is
  authenticated (not the owner). It only does a simple increment.
- Granted EXECUTE to authenticated role.

## Notes
1. Idempotent creation — uses CREATE OR REPLACE.
2. Only increments; does not decrement on member deletion (the app handles
   count updates separately if needed).
*/

CREATE OR REPLACE FUNCTION increment_family_count(fam_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count int;
BEGIN
  UPDATE families SET member_count = member_count + 1 WHERE id = fam_id
  RETURNING member_count INTO new_count;
  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_family_count(uuid) TO authenticated;
