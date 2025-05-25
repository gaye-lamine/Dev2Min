/*
  # Fix database schema and relationships

  1. Changes
    - Drop and recreate episodes table with proper foreign key to auth.users
    - Update RLS policies
    - Add indexes for better query performance
  
  2. Security
    - Enable RLS
    - Add policies for CRUD operations
*/

-- Drop existing episodes table
DROP TABLE IF EXISTS episodes;

-- Recreate episodes table with proper constraints
CREATE TABLE episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  duration integer NOT NULL,
  
  -- Add index on user_id for faster lookups
  CONSTRAINT episodes_user_id_idx UNIQUE (user_id, id)
);

-- Enable RLS
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
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