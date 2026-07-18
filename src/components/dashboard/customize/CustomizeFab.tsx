import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onClick: () => void;
  /** Hides the launcher while the panel is open, so it never fights the dialog. */
  hidden?: boolean;
  /** Plays the one-shot sheen — first visit only. */
  showSheen?: boolean;
}

/**
 * Floating glass launcher for the customisation workspace.
 *
 * Docks on the right edge directly above the AI assistant fab (which owns
 * bottom-20/bottom-6), so the two read as one deliberate action rail rather
 * than two buttons that happen to overlap. Collapses to a circle on mobile
 * where horizontal room is scarce.
 */
export function CustomizeFab({ onClick, hidden, showSheen }: Props) {
  if (hidden) return null;

  return (
    <div className="group no-print fixed bottom-36 right-4 z-40 lg:bottom-24 lg:right-6">
      <button
        type="button"
        onClick={onClick}
        aria-haspopup="dialog"
        aria-label="Customise dashboard"
        className={cn(
          'customise-fab relative flex items-center gap-2.5 overflow-hidden rounded-full',
          'h-12 w-12 justify-center md:h-12 md:w-auto md:justify-start md:pl-3.5 md:pr-4',
          // Frosted glass: translucent brand wash over a blurred backdrop, with
          // a hairline that reads as a lit edge rather than a border.
          'border border-white/25 bg-gradient-to-br from-brand-primary/85 to-brand-primary/70',
          'text-white shadow-lg backdrop-blur-xl backdrop-saturate-150',
          'dark:border-white/15 dark:from-brand-primary/70 dark:to-slate-900/60',
          'transition-[transform,box-shadow] duration-300 ease-out',
          'hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.97] active:duration-75',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-base',
          showSheen && 'customise-sheen',
        )}
      >
        {/* inner top highlight — the classic glass "lip" */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
        />
        {/* soft radial sheen so the surface reads as curved glass, not flat fill */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-full bg-[radial-gradient(120%_80%_at_20%_0%,rgba(255,255,255,0.35),transparent_60%)]"
        />

        <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-inset ring-white/25">
          <LayoutGrid className="size-3.5" strokeWidth={2.25} />
        </span>
        <span className="relative hidden whitespace-nowrap text-sm font-semibold tracking-tight md:inline">
          Customise
        </span>
      </button>

      {/* Tooltip for the icon-only (mobile / narrow) presentation. */}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-1/2 right-full mr-3 hidden translate-y-1/2 whitespace-nowrap rounded-md bg-brand-primary px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block md:hidden"
      >
        Customise dashboard
      </span>
    </div>
  );
}
