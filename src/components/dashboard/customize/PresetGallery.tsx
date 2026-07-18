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
                'relative flex items-start gap-3 overflow-hidden rounded-2xl border p-3.5 text-left',
                'backdrop-blur-sm transition-colors duration-200 focus-ring',
                active
                  ? 'glass-strong border-transparent shadow-pop'
                  : 'glass-soft border-white/40 hover:border-brand-secondary/50 dark:border-white/10',
              )}
              style={
                active ? { boxShadow: `0 0 0 2px ${p.accent}` } : undefined
              }
            >
              {/* accent wash bleeding from the top-left corner */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  background: `radial-gradient(120% 90% at 0% 0%, ${p.accent}1F, transparent 62%)`,
                }}
              />
              <span
                className="relative flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-white/20"
                style={{ background: `${p.accent}24`, color: p.accent }}
              >
                <Icon className="size-[18px]" strokeWidth={1.75} />
              </span>

              <span className="relative min-w-0 flex-1">
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
        <p className="glass-note rounded-xl border border-white/30 px-3 py-2 text-[11px] text-content-secondary backdrop-blur-sm dark:border-white/10">
          Your layout is custom — it doesn’t match any preset. Picking one
          replaces your current show/hide choices.
        </p>
      )}
    </div>
  );
}
