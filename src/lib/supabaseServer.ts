import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client. Prefers service role when set (bypasses RLS for admin APIs).
 */
export function getServerSupabase(): SupabaseClient {
  if (serverClient) return serverClient;

  const url =
    import.meta.env.SUPABASE_URL ||
    import.meta.env.PUBLIC_SUPABASE_URL ||
    '';
  const key =
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!url || !key) {
    throw new Error('[Supabase] Missing URL or API key for server client');
  }

  serverClient = createClient(url, key);
  return serverClient;
}
