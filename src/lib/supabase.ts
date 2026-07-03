import { createClient } from '@supabase/supabase-js';
import { DEMO_MODE } from './config';

// These come from your Supabase project (Settings → API) and live in
// the `.env` file at the project root. See SETUP-SUPABASE.md.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// In demo mode we never call Supabase, so missing keys are fine. Outside demo
// mode, real keys are required.
if (!DEMO_MODE && (!url || !anonKey)) {
  throw new Error(
    'Supabase is not configured. Create a `.env` file with VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY, then restart `npm run dev`. See SETUP-SUPABASE.md.',
  );
}

// The anon key is safe in the browser — the database is protected by Row
// Level Security, not by hiding this key. (Demo mode passes harmless
// placeholders that are never used.)
export const supabase = createClient(url ?? 'https://demo.invalid', anonKey ?? 'demo-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
