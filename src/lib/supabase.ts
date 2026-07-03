import { createClient } from '@supabase/supabase-js';

// These come from your Supabase project (Settings → API) and live in
// the `.env` file at the project root. See SETUP-SUPABASE.md.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  throw new Error(
    'Supabase is not configured. Create a `.env` file with VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY, then restart `npm run dev`. See SETUP-SUPABASE.md.',
  );
}

// The anon key is safe in the browser — the database is protected by Row
// Level Security, not by hiding this key.
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
