// ---------------------------------------------------------------------------
// Demo mode.
//
// When ON, the CRM runs entirely in the browser with mocked sample data (no
// Supabase): any email/password logs you in and you go straight to the app.
//
// It turns ON automatically when Supabase isn't properly configured (missing or
// placeholder keys) so a demo never crashes at login. You can also force it with
// VITE_DEMO_MODE=true, or force it OFF with VITE_DEMO_MODE=false.
// ---------------------------------------------------------------------------
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const flag = import.meta.env.VITE_DEMO_MODE as string | undefined;

const looksUnconfigured =
  !url ||
  !key ||
  url.includes('placeholder') ||
  url.includes('YOUR-') ||
  url.includes('your-') ||
  key.includes('placeholder') ||
  key.includes('your-anon');

export const DEMO_MODE =
  flag === 'true' ? true : flag === 'false' ? false : looksUnconfigured;
