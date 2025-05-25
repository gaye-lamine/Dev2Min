import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

/**
 * Supabase client initialization
 * Ensure you have set the environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * in your .env file or through your build system.
 * If these variables are not set, an error will be logged to the console.
 * * @see https://supabase.com/docs/guides/with-react
 * 
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please connect to Supabase first.');
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export const getAudioUrl = (path: string) => {
  const { data } = supabase.storage.from('podcasts').getPublicUrl(`public/${path}`);
  return data.publicUrl;
};