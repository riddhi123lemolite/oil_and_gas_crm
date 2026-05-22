import { useUiStore } from '@/stores/uiStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';

export const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['⌘', 'K'], label: 'Open command palette' },
  { keys: ['/'], label: 'Search anything' },
  { keys: ['N'], label: 'Create new (context-aware)' },
  { keys: ['?'], label: 'Show this shortcuts dialog' },
  { keys: ['Esc'], label: 'Close dialog / palette' },
  { keys: ['J'], label: 'Move down in lists' },
  { keys: ['K'], label: 'Move up in lists' },
  { keys: ['Ctrl', 'P'], label: 'Print invoice / proposal' },
];

export function KeyboardShortcutsModal() {
  const { shortcutsOpen, setShortcutsOpen } = useUiStore();

  return (
    <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="divide-y divide-line">
            {SHORTCUTS.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between py-2.5"
              >
                <span className="text-sm text-content-secondary">
                  {s.label}
                </span>
                <span className="flex gap-1">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="min-w-[24px] rounded border border-line bg-base px-1.5 py-0.5 text-center font-mono text-[11px] text-content-secondary"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
