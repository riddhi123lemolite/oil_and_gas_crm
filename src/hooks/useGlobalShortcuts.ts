import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUiStore } from '@/stores/uiStore';

/** Context-aware "create new" target keyed by the current section. */
const NEW_TARGETS: { match: RegExp; to: string }[] = [
  { match: /^\/leads/, to: '/leads/new' },
  { match: /^\/customers/, to: '/customers/new' },
  { match: /^\/proposals/, to: '/proposals/new' },
  { match: /^\/items/, to: '/items/new' },
  { match: /^\/tasks/, to: '/tasks/new' },
  { match: /^\/routes/, to: '/routes/new' },
];

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

export function useGlobalShortcuts(): void {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCommandOpen, setShortcutsOpen, commandOpen } = useUiStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Command palette — works even while typing.
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(!commandOpen);
        return;
      }
      if (isTyping(e.target)) return;

      if (e.key === '/') {
        e.preventDefault();
        setCommandOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(true);
      } else if (e.key.toLowerCase() === 'n') {
        const target = NEW_TARGETS.find((t) => t.match.test(location.pathname));
        if (target) {
          e.preventDefault();
          navigate(target.to);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, location.pathname, setCommandOpen, setShortcutsOpen, commandOpen]);
}
