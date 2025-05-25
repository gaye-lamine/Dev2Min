/*
  # Fix episodes table foreign key constraint

  1. Changes
    - Update foreign key constraint for episodes table to reference auth.users instead of profiles
    - Drop existing constraint and create new one
    - Ensure RLS policies are maintained
*/

-- Drop the existing foreign key constraint
ALTER TABLE episodes
DROP CONSTRAINT IF EXISTS episodes_user_id_fkey;

-- Add new foreign key constraint referencing auth.users
ALTER TABLE episodes
ADD CONSTRAINT episodes_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Ensure RLS is enabled
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies (in case they were affected)
DROP POLICY IF EXISTS "Episodes are viewable by everyone" ON episodes;
DROP POLICY IF EXISTS "Users can delete their own episodes" ON episodes;
DROP POLICY IF EXISTS "Users can insert their own episodes" ON episodes;
DROP POLICY IF EXISTS "Users can update their own episodes" ON episodes;

CREATE POLICY "Episodes are viewable by everyone"
ON episodes FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can delete their own episodes"
ON episodes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own episodes"
ON episodes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episodes"
ON episodes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);