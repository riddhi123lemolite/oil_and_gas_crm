import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { PRESETS, presetWidgets, type DashboardPreset } from '@/lib/dashboard/presets';
import type { WidgetId } from '@/lib/dashboard/widgets';
import { cn } from '@/lib/utils';

interface Props {
  availableIds: WidgetId[];
  activePresetId: string | null;
  onApply: (preset: DashboardPreset) => void;
}

export function PresetGallery({ availableIds, activePresetId, onApply }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-content-secondary">
        Start from a layout that fits how you work, then fine-tune it in the next
        steps. Presets change which widgets are shown — never the order you have
        arranged.
      </p>

      <div
        role="radiogroup"
        aria-label="Dashboard presets"
        className="grid gap-2.5 sm:grid-cols-2"
      >
        {PRESETS.map((p) => {
          const Icon = p.icon;
          const count = presetWidgets(p, availableIds).length;
          const active = activePresetId === p.id;
          return (
            <motion.button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onApply(p)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className={cn(
                'relative flex items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-ring',
                active
                  ? 'border-transparent bg-surface shadow-pop'
                  : 'border-line bg-surface hover:border-brand-secondary/40',
              )}
              style={
                active ? { boxShadow: `0 0 0 2px ${p.accent}` } : undefined
              }
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${p.accent}1A`, color: p.accent }}
              >
                <Icon className="size-[18px]" strokeWidth={1.75} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-content">
                    {p.label}
                  </span>
                  {active && (
                    <span
                      className="flex size-4 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: p.accent }}
                    >
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-content-secondary">
                  {p.description}
                </span>
                <span className="num mt-1.5 block text-[10px] font-semibold uppercase tracking-wide text-content-muted">
                  {count} widget{count === 1 ? '' : 's'}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {!activePresetId && (
        <p className="rounded-lg border border-line bg-muted/40 px-3 py-2 text-[11px] text-content-muted">
          Your layout is custom — it doesn’t match any preset. Picking one
          replaces your current show/hide choices.
        </p>
      )}
    </div>
  );
}
