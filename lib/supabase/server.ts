import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase access. The app reads public content with the anon
 * key, enforced by Row Level Security — there is no service-role usage in
 * the app, and the service-role key must never be exposed to the client.
 *
 * When these env vars are absent the app runs entirely on the typed mock
 * data (see lib/data/provider.ts), so local development needs no Supabase
 * project.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
