'use client';

import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './routes';
import { useDataStore } from './stores/dataStore';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { useUiStore } from './stores/uiStore';
import { useCurrencyStore } from './stores/currencyStore';
import { useLanguageStore, LANGUAGES } from './lib/i18n';
import { Logo } from './components/shared/Logo';

function BootScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-base">
      <Logo showWordmark={false} className="scale-150" />
      <div className="flex flex-col items-center gap-2">
        <div className="size-5 animate-spin rounded-full border-2 border-brand-secondary border-t-transparent" />
        <p className="text-sm text-content-muted">{label}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [label, setLabel] = useState('Starting Sarvadesk…');
  const langCode = useLanguageStore((s) => s.code);

  // Apply the selected language + text direction (RTL for Arabic) to <html>.
  useEffect(() => {
    const lang = LANGUAGES.find((l) => l.code === langCode);
    document.documentElement.lang = langCode;
    document.documentElement.dir = lang?.dir ?? 'ltr';
  }, [langCode]);

  useEffect(() => {
    let active = true;
    (async () => {
      useThemeStore.getState().init();
      useUiStore.getState().init();
      useCurrencyStore.getState().init();
      useLanguageStore.getState().init();
      setLabel('Connecting…');
      await useAuthStore.getState().init();
      if (!active) return;
      if (useAuthStore.getState().currentUser) {
        setLabel('Loading your workspace…');
        await useDataStore.getState().hydrate();
        if (!active) return;
      }
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return <BootScreen label={label} />;

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontSize: '13px',
            borderRadius: '8px',
            boxShadow: '0 4px 16px -2px rgb(15 23 42 / 0.12)',
          },
        }}
      />
    </>
  );
}
