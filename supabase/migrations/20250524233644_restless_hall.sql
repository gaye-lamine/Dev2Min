/*
  # Fix storage policies and bucket setup

  1. Changes
    - Drop existing policies to avoid conflicts
    - Recreate storage bucket with proper configuration
    - Add new policies with unique names
    
  2. Security
    - Maintain public read access for podcasts
    - Restrict upload/delete to authenticated users
    - Ensure users can only manage their own files
*/

-- First drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload podcasts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own podcasts" ON storage.objects;

-- Ensure bucket exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'podcasts'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('podcasts', 'podcasts', true);
  END IF;
END $$;

-- Create new policies with unique names
CREATE POLICY "Allow public podcast access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'podcasts' );

CREATE POLICY "Allow authenticated users to upload podcasts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'podcasts' AND
  (storage.foldername(name))[1] = 'public'
);

CREATE POLICY "Allow users to delete their own podcasts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'podcasts' AND
  auth.uid()::text = (storage.foldername(name))[2]
);