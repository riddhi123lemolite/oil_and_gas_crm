import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepDef {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  optional?: boolean;
}

interface Props {
  steps: StepDef[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Small trailing figure per step, e.g. "4/7". */
  badgeFor?: (id: string) => string | null;
}

/**
 * Vertical rail on desktop, horizontal scroller on small screens. Steps are
 * jumpable rather than strictly linear — the numbers convey a suggested path
 * without trapping anyone in a wizard.
 */
export function StepNav({ steps, activeId, onSelect, badgeFor }: Props) {
  return (
    <nav
      aria-label="Customisation steps"
      className={cn(
        'flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      )}
    >
      {steps.map((s, i) => {
        const Icon = s.icon;
        const active = s.id === activeId;
        const badge = badgeFor?.(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            aria-current={active ? 'step' : undefined}
            className={cn(
              'relative flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors focus-ring lg:w-full',
              active
                ? 'bg-brand-primary/[0.07] dark:bg-brand-secondary/[0.12]'
                : 'hover:bg-muted',
            )}
          >
            {active && (
              <motion.span
                layoutId="customise-step-rail"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand-secondary"
              />
            )}

            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold transition-colors',
                active
                  ? 'bg-brand-primary text-white dark:bg-brand-secondary'
                  : 'bg-muted text-content-muted',
              )}
            >
              {active ? <Icon className="size-3.5" /> : i + 1}
            </span>

            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  'block truncate text-sm font-medium',
                  active ? 'text-content' : 'text-content-secondary',
                )}
              >
                {s.label}
              </span>
              <span className="hidden truncate text-[11px] text-content-muted lg:block">
                {s.optional ? 'Optional' : s.hint}
              </span>
            </span>

            {badge && (
              <span className="num hidden shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-content-secondary lg:inline">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
