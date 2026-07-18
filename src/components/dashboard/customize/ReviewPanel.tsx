import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WidgetDef } from '@/lib/dashboard/widgets';
import { cn } from '@/lib/utils';

function ChipRow({ widgets }: { widgets: WidgetDef[] }) {
  if (widgets.length === 0) {
    return (
      <p className="text-xs text-content-muted">None — all hidden.</p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {widgets.map((w) => (
        <span
          key={w.id}
          className="inline-flex items-center gap-1.5 rounded-full border glass-tile border-white/40 py-1 pl-1.5 pr-2.5 text-xs font-medium text-content-secondary backdrop-blur-sm dark:border-white/10"
        >
          <i
            className="size-2 shrink-0 rounded-full"
            style={{ background: w.accent }}
          />
          {w.label}
        </span>
      ))}
    </div>
  );
}

interface Props {
  kpis: WidgetDef[];
  sections: WidgetDef[];
  hidden: WidgetDef[];
  isCustomised: boolean;
  onReset: () => void;
  onDone: () => void;
}

export function ReviewPanel({
  kpis,
  sections,
  hidden,
  isCustomised,
  onReset,
  onDone,
}: Props) {
  return (
    <div className="space-y-4">
      <div
        className={cn(
          'flex items-start gap-3 rounded-2xl border p-3.5',
          'border-brand-accent/30 bg-brand-accent/[0.08] backdrop-blur-sm',
        )}
      >
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-accent" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-content">
            Everything is saved already
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-content-secondary">
            Changes apply the moment you make them — there is no Save button.
            Your layout is stored in this browser and only you see it.
          </p>
        </div>
      </div>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-content-muted">
          KPI cards · {kpis.length}
        </h4>
        <ChipRow widgets={kpis} />
      </section>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-content-muted">
          Sections · {sections.length}
        </h4>
        <ChipRow widgets={sections} />
      </section>

      {hidden.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-content-muted">
            Hidden · {hidden.length}
          </h4>
          <div className="flex flex-wrap gap-1.5 opacity-60">
            {hidden.map((w) => (
              <span
                key={w.id}
                className="inline-flex items-center rounded-full border border-dashed border-line px-2.5 py-1 text-xs text-content-muted"
              >
                {w.label}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={!isCustomised}
          title={
            isCustomised
              ? 'Restore the default layout'
              : 'Already on the default layout'
          }
        >
          <RotateCcw /> Reset to default
        </Button>
        <Button variant="primary" size="sm" className="ml-auto" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
