import { Keyboard } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { SHORTCUTS } from '@/components/shared/KeyboardShortcutsModal';

export default function ShortcutsPage() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageHeader
        title="Keyboard Shortcuts"
        description="Work faster with these handy shortcuts"
        icon={<Keyboard />}
      />
      <Card>
        <CardContent className="divide-y divide-line p-0">
          {SHORTCUTS.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between px-5 py-3"
            >
              <span className="text-sm text-content-secondary">{s.label}</span>
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="min-w-[26px] rounded border border-line bg-base px-1.5 py-0.5 text-center font-mono text-[11px] text-content-secondary"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="text-center text-xs text-content-muted">
        Press <kbd className="rounded border border-line bg-base px-1 font-mono">?</kbd>{' '}
        anywhere to open this as a quick dialog.
      </p>
    </div>
  );
}
