import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/stores/dashboardStore';
import {
  DEFAULT_ORDER,
  WIDGET_BY_ID,
  isWidgetAvailable,
  isWidgetVisibleByDefault,
  type WidgetContext,
  type WidgetDef,
  type WidgetId,
} from '@/lib/dashboard/widgets';
import { matchPreset, presetWidgets, type DashboardPreset } from '@/lib/dashboard/presets';
import { StepNav, type StepDef } from './StepNav';
import { PresetGallery } from './PresetGallery';
import { WidgetList } from './WidgetList';
import { LayoutPreview } from './LayoutPreview';
import { ReviewPanel } from './ReviewPanel';

const STEPS: StepDef[] = [
  {
    id: 'start',
    label: 'Quick start',
    hint: 'Pick a starting layout',
    icon: Sparkles,
    optional: true,
  },
  {
    id: 'kpis',
    label: 'KPI cards',
    hint: 'The strip up top',
    icon: LayoutGrid,
  },
  {
    id: 'sections',
    label: 'Sections',
    hint: 'Charts and tables',
    icon: BarChart3,
  },
  {
    id: 'review',
    label: 'Review',
    hint: 'Check and finish',
    icon: ClipboardCheck,
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ctx: WidgetContext;
}

export function CustomizeDashboardDialog({ open, onOpenChange, ctx }: Props) {
  const order = useDashboardStore((s) => s.order);
  const visibility = useDashboardStore((s) => s.visibility);
  const toggle = useDashboardStore((s) => s.toggle);
  const setMany = useDashboardStore((s) => s.setMany);
  const setExact = useDashboardStore((s) => s.setExact);
  const reorderGroup = useDashboardStore((s) => s.reorderGroup);
  const reset = useDashboardStore((s) => s.reset);

  const [step, setStep] = useState('start');
  const [hovered, setHovered] = useState<WidgetId | null>(null);

  // Every change applies to the dashboard behind the dialog immediately — there
  // is no draft to commit, which is why there is no Save button anywhere.
  const available = useMemo(
    () =>
      order
        .filter((id) => isWidgetAvailable(id, ctx))
        .map((id) => WIDGET_BY_ID[id])
        .filter((w): w is WidgetDef => Boolean(w)),
    [order, ctx],
  );

  const isVisible = (id: WidgetId) =>
    visibility[id] ?? isWidgetVisibleByDefault(id, ctx);

  const kpis = available.filter((w) => w.group === 'kpi');
  const sections = available.filter((w) => w.group === 'section');
  const visibleKpis = kpis.filter((w) => isVisible(w.id));
  const visibleSections = sections.filter((w) => isVisible(w.id));
  const hidden = available.filter((w) => !isVisible(w.id));

  const availableIds = available.map((w) => w.id);
  const visibleIds = available.filter((w) => isVisible(w.id)).map((w) => w.id);
  const shownCount = visibleIds.length;
  const pct = available.length
    ? Math.round((shownCount / available.length) * 100)
    : 0;

  const activePreset = useMemo(
    () => matchPreset(visibleIds, availableIds),
    [visibleIds, availableIds],
  );

  // Derived rather than read through the store's getter, so the Reset button
  // enables/disables reactively as the layout changes.
  const isCustomised =
    Object.keys(visibility).length > 0 ||
    order.some((id, i) => DEFAULT_ORDER[i] !== id);

  function applyPreset(p: DashboardPreset) {
    setExact(availableIds, presetWidgets(p, availableIds));
    toast.success(`${p.label} layout applied`);
  }

  function handleReset() {
    reset();
    toast.success('Dashboard reset to default');
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const prev = stepIndex > 0 ? STEPS[stepIndex - 1] : null;
  const next = stepIndex < STEPS.length - 1 ? STEPS[stepIndex + 1] : null;

  const badgeFor = (id: string) => {
    if (id === 'kpis') return `${visibleKpis.length}/${kpis.length}`;
    if (id === 'sections') return `${visibleSections.length}/${sections.length}`;
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="xl"
        className="max-w-[min(76rem,calc(100vw-2rem))] sm:max-h-[90vh]"
      >
        <DialogHeader className="relative overflow-hidden">
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-primary/[0.07] via-transparent to-brand-secondary/[0.09]" />
          <div className="relative flex items-start gap-3">
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-sm">
              <LayoutGrid className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle>Customise dashboard</DialogTitle>
              <DialogDescription>
                Choose what appears on your dashboard and in what order. Changes
                save automatically.
              </DialogDescription>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <p className="num text-xl font-bold leading-none text-content">
                {shownCount}
                <span className="text-sm font-medium text-content-muted">
                  /{available.length}
                </span>
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-content-muted">
                widgets shown
              </p>
            </div>
          </div>

          <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary"
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            />
          </div>
        </DialogHeader>

        <DialogBody className="px-4 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row">
            {/* Steps */}
            <div className="order-1 shrink-0 lg:w-[186px]">
              <StepNav
                steps={STEPS}
                activeId={step}
                onSelect={setStep}
                badgeFor={badgeFor}
              />
            </div>

            {/* Preview — above the controls on small screens, beside them on xl */}
            <aside className="order-2 shrink-0 xl:order-3 xl:w-[286px]">
              <div className="xl:sticky xl:top-0">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-content-muted">
                  <Sparkles className="size-3 text-brand-secondary" />
                  Live preview
                </p>
                <LayoutPreview
                  kpis={visibleKpis}
                  sections={visibleSections}
                  stateMapShown={isVisible('salesByState')}
                  highlightId={hovered}
                />
                <p className="mt-2 text-center text-[11px] leading-relaxed text-content-muted">
                  Mirrors your live dashboard layout.
                </p>
              </div>
            </aside>

            {/* Active step */}
            <div className="order-3 min-w-0 flex-1 xl:order-2">
              {/* Keyed remount fades each step in. Deliberately not
                  AnimatePresence: `mode="wait"` would hold the incoming step
                  behind the outgoing one's exit animation, leaving a dead gap
                  on every switch (and showing nothing at all if the animation
                  clock is throttled). */}
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
              >
                  {step === 'start' && (
                    <PresetGallery
                      availableIds={availableIds}
                      activePresetId={activePreset}
                      onApply={applyPreset}
                    />
                  )}

                  {step === 'kpis' && (
                    <WidgetList
                      group="kpi"
                      widgets={kpis}
                      isVisible={isVisible}
                      onToggle={toggle}
                      onReorder={reorderGroup}
                      onSetMany={setMany}
                      onHover={setHovered}
                      hint="The headline figures across the top of your dashboard. Drag to reorder them left to right."
                    />
                  )}

                  {step === 'sections' && (
                    <WidgetList
                      group="section"
                      widgets={sections}
                      isVisible={isVisible}
                      onToggle={toggle}
                      onReorder={reorderGroup}
                      onSetMany={setMany}
                      onHover={setHovered}
                      hint="Charts, maps and tables below the KPI strip. Drag to reorder them top to bottom."
                    />
                  )}

                  {step === 'review' && (
                    <ReviewPanel
                      kpis={visibleKpis}
                      sections={visibleSections}
                      hidden={hidden}
                      isCustomised={isCustomised}
                      onReset={handleReset}
                      onDone={() => onOpenChange(false)}
                    />
                  )}
              </motion.div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => prev && setStep(prev.id)}
            disabled={!prev}
          >
            <ArrowLeft /> {prev?.label ?? 'Back'}
          </Button>

          <div className="flex items-center gap-2">
            <span className="num hidden text-xs text-content-muted sm:inline">
              Step {stepIndex + 1} of {STEPS.length}
            </span>
            {next ? (
              <Button variant="primary" size="sm" onClick={() => setStep(next.id)}>
                {next.label} <ArrowRight />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
