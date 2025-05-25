/*
  # Initial database setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, not null)
      - `avatar_url` (text, nullable)
      - `updated_at` (timestamptz, nullable)
    - `episodes`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `user_id` (uuid, references profiles.id)
      - `audio_url` (text, not null)
      - `created_at` (timestamptz, default: now())
      - `duration` (integer, not null)
  
  2. Security
    - Enable RLS on all tables
    - Create policies for authenticated users
*/

-- Create profiles table that extends the auth.users table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  username TEXT NOT NULL,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ
);

-- Create episodes table for storing podcast episodes
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  audio_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  duration INTEGER NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for episodes
CREATE POLICY "Episodes are viewable by everyone"
  ON episodes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own episodes"
  ON episodes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episodes"
  ON episodes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own episodes"
  ON episodes
  FOR DELETE
  USING (auth.uid() = user_id);