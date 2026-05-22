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

export function AppShell() {
  useGlobalShortcuts();

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-screen bg-base">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 pb-20 lg:pb-0">
            <div className="mx-auto max-w-[1600px] p-4 sm:p-5 lg:p-6">
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
      </div>
    </TooltipProvider>
  );
}
