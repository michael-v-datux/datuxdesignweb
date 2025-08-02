import { createClient } from '@supabase/supabase-js';

// Використовуємо публічні ключі (безпечно для читання)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing URL or Anon Key. Supabase client not initialized.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);