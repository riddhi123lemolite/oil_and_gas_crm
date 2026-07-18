import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { SplashModal } from '@/components/shared/SplashModal';
import { KeyboardShortcutsModal } from '@/components/shared/KeyboardShortcutsModal';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { useCurrencyStore } from '@/stores/currencyStore';
import { AiFab } from '@/components/ai/AiFab';

export function AppShell() {
  useGlobalShortcuts();
  // Re-render the page content when the currency changes so every amount reformats.
  const currency = useCurrencyStore((s) => s.code);

  return (
    <TooltipProvider delayDuration={300}>
      {/* Transparent, not bg-base: an opaque fill here would cover the body's
          ambient gradient and every frosted surface would have nothing to
          refract. */}
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 pb-20 lg:pb-0">
            <div key={currency} className="mx-auto max-w-[1600px] p-4 sm:p-5 lg:p-6">
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className="card overflow-hidden">
                      <TableSkeleton />
                    </div>
                  }
                >
                  <Outlet />
                </Suspense>
              </ErrorBoundary>
            </div>
          </main>
        </div>
        <MobileBottomNav />
        <CommandPalette />
        <SplashModal />
        <KeyboardShortcutsModal />
        <AiFab />
      </div>
    </TooltipProvider>
  );
}
