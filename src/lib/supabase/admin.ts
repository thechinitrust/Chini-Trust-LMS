import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS entirely -- server-only, never
 * import this from a "use client" file or a component that could end up in
 * a client bundle. Currently used only by the invite-user Route Handler
 * (creating a real auth.users row requires the admin API, which requires
 * this key).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
