import { motion } from 'framer-motion';
import { EyeOff } from 'lucide-react';
import { sectionSpanFor, type WidgetDef } from '@/lib/dashboard/widgets';
import { cn } from '@/lib/utils';

const SPAN_CLASS: Record<1 | 2 | 3, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
};

const SPRING = { type: 'spring' as const, stiffness: 420, damping: 34 };

interface Props {
  kpis: WidgetDef[];
  sections: WidgetDef[];
  stateMapShown: boolean;
  /** Pulses the matching block when a row is hovered in the list. */
  highlightId?: string | null;
  className?: string;
}

/**
 * A miniature of the real dashboard. Column spans come from the same
 * sectionSpanFor() the dashboard grid uses, so the preview cannot drift from
 * what actually renders.
 *
 * Blocks animate in and spring between positions, but hidden widgets unmount
 * immediately rather than playing an exit — a preview that lags behind the
 * real layout is worse than one that changes abruptly.
 */
export function LayoutPreview({
  kpis,
  sections,
  stateMapShown,
  highlightId,
  className,
}: Props) {
  const empty = kpis.length === 0 && sections.length === 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-line bg-base/60 p-3',
        className,
      )}
      aria-hidden="true"
    >
      {/* brand hairline, echoing GlassCard */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-secondary/40 to-transparent" />

      {empty ? (
        <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line text-center">
          <EyeOff className="size-5 text-content-muted" />
          <p className="text-xs font-medium text-content-secondary">
            Nothing to show
          </p>
          <p className="max-w-[15rem] text-[11px] text-content-muted">
            Every widget is hidden. Turn some back on and they appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {kpis.length > 0 && (
            <div className="grid grid-cols-6 gap-1">
              {kpis.map((w) => (
                  <motion.div
                    key={w.id}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{
                      opacity: 1,
                      scale: highlightId === w.id ? 1.08 : 1,
                    }}
                    transition={SPRING}
                    className="flex h-7 flex-col justify-center gap-[3px] rounded-[4px] px-1"
                    style={{
                      background: `${w.accent}1A`,
                      boxShadow:
                        highlightId === w.id
                          ? `inset 2px 0 0 ${w.accent}, 0 0 0 1.5px ${w.accent}`
                          : `inset 2px 0 0 ${w.accent}`,
                    }}
                  >
                    <i
                      className="block h-[3px] w-3/5 rounded-full"
                      style={{ background: `${w.accent}80` }}
                    />
                    <i
                      className="block h-[5px] w-4/5 rounded-full"
                      style={{ background: w.accent }}
                    />
                  </motion.div>
                ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-1">
            {sections.map((w) => {
                const span = sectionSpanFor(w.id, stateMapShown);
                const lit = highlightId === w.id;
                return (
                  <motion.div
                    key={w.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: lit ? 1.03 : 1 }}
                    transition={SPRING}
                    className={cn(
                      'flex items-center gap-1 overflow-hidden rounded-[4px] px-1.5 py-2',
                      SPAN_CLASS[span],
                      span === 3 ? 'h-9' : 'h-12',
                    )}
                    style={{
                      background: `${w.accent}14`,
                      boxShadow: lit
                        ? `inset 0 0 0 1.5px ${w.accent}`
                        : `inset 0 0 0 1px ${w.accent}33`,
                    }}
                  >
                    <i
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: w.accent }}
                    />
                    <span className="truncate text-[9px] font-medium leading-none text-content-secondary">
                      {w.label}
                    </span>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
