'use client';

import dynamic from 'next/dynamic';

// The whole CRM is a client-rendered SPA (react-router mounted in the browser).
// Load it with ssr:false so browser-only code (createBrowserRouter, localStorage,
// IndexedDB, matchMedia…) never runs on the server. A catch-all route lets
// react-router keep owning every path.
const App = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="size-6 animate-spin rounded-full border-2 border-brand-secondary border-t-transparent" />
    </div>
  ),
});

export default function CatchAllPage() {
  return <App />;
}
