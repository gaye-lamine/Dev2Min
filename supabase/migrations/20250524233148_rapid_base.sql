/*
  # Create storage bucket for podcasts

  1. New Storage
    - Create 'podcasts' bucket for storing audio files
  
  2. Security
    - Enable public access for reading podcast files
    - Allow authenticated users to upload files to their own folder
*/

-- Create a new storage bucket for podcasts
insert into storage.buckets (id, name, public)
values ('podcasts', 'podcasts', true);

-- Allow public access to podcast files
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'podcasts' );

-- Allow authenticated users to upload files
create policy "Users can upload podcasts"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'podcasts' AND
  (storage.foldername(name))[1] = 'public'
);

-- Allow users to delete their own files
create policy "Users can delete own podcasts"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'podcasts' AND
  auth.uid()::text = (storage.foldername(name))[2]
);