import { Sparkles, MousePointerClick, RotateCcw, Database } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';

const POINTS = [
  {
    icon: MousePointerClick,
    title: 'Click around freely',
    text: 'Add leads, edit customers, drag deals, create proposals — everything works.',
  },
  {
    icon: Database,
    title: 'Your changes are saved',
    text: 'Data lives in this browser and survives a refresh. Nothing leaves your device.',
  },
  {
    icon: RotateCcw,
    title: 'Reset anytime',
    text: 'Open Settings → System → Reset Demo Data to restore the original sample data.',
  },
];

export function SplashModal() {
  const { splashSeen, dismissSplash } = useUiStore();

  return (
    <Dialog open={!splashSeen} onOpenChange={(o) => !o && dismissSplash()}>
      <DialogContent size="md" hideClose>
        <DialogTitle className="sr-only">Welcome to Clientio</DialogTitle>
        <DialogBody className="pt-7">
          <div className="flex flex-col items-center text-center">
            <Logo showWordmark={false} />
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-secondary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-secondary">
              <Sparkles className="size-3" /> Interactive Demo
            </div>
            <h2 className="mt-3 font-display text-xl font-bold text-content">
              Welcome to Clientio
            </h2>
            <p className="mt-1 max-w-sm text-sm text-content-muted">
              A click-through prototype for petroleum, gas & petrochemical
              trading. This is a demo with realistic mock data.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {POINTS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="flex gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary">
                    <Icon className="size-[18px]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-content">
                      {p.title}
                    </div>
                    <div className="text-xs text-content-muted">{p.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button className="w-full" onClick={dismissSplash}>
            Start exploring
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
