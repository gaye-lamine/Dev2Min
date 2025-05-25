/*
  # Setup storage and fix relations

  1. Storage Setup
    - Create podcasts storage bucket
    - Add policies for public access and user operations
  
  2. Table Relations
    - Fix episodes table foreign key to reference auth.users
    - Update RLS policies
*/

-- Create podcasts storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'podcasts'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('podcasts', 'podcasts', true);
  END IF;
END $$;

-- Storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'podcasts' );

CREATE POLICY "Users can upload podcasts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'podcasts' AND
  (storage.foldername(name))[1] = 'public'
);

CREATE POLICY "Users can delete own podcasts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'podcasts' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Fix episodes table foreign key
ALTER TABLE episodes
DROP CONSTRAINT IF EXISTS episodes_user_id_fkey;

ALTER TABLE episodes
ADD CONSTRAINT episodes_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Ensure RLS is enabled
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
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