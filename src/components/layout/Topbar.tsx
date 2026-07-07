import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  LogOut,
  UserCog,
  Repeat,
  Target,
  Building2,
  FileText,
  CheckSquare,
  Check,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useUiStore } from '@/stores/uiStore';
import { useDataStore } from '@/stores/dataStore';
import { ALL_NAV_ITEMS } from '@/lib/nav';
import { CUSTOMER_NAV } from '@/lib/customerNav';
import { ROLE_LABELS } from '@/lib/constants';
import { DEMO_ACCOUNTS } from '@/lib/mockAuth';
import { DEMO_MODE } from '@/lib/config';
import { useCurrencyStore, CURRENCIES } from '@/stores/currencyStore';
import { useT, useLanguageStore, LANGUAGES } from '@/lib/i18n';
import type { Role } from '@/types';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';

// Every path a breadcrumb segment can safely link to (staff nav + portal nav).
const ROUTABLE_PATHS = new Set<string>([
  '/',
  ...ALL_NAV_ITEMS.map((i) => i.path),
  ...CUSTOMER_NAV.flatMap((s) => s.items).map((it) => it.path.split(/[?#]/)[0] ?? it.path),
]);
// Friendly labels for segments that aren't staff nav items (e.g. portal roots).
const SEGMENT_LABELS: Record<string, string> = {
  portal: 'Portal',
  settings: 'Settings',
  reports: 'Reports',
  leads: 'Leads',
};

function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  const match = ALL_NAV_ITEMS.find((i) => i.path === pathname);

  const crumbs: { label: string; to?: string }[] = [
    { label: 'Home', to: '/' },
  ];
  if (match && match.path !== '/') {
    crumbs.push({ label: match.label });
  } else if (segments.length > 0) {
    let acc = '';
    segments.forEach((seg) => {
      acc += `/${seg}`;
      const navMatch = ALL_NAV_ITEMS.find((i) => i.path === acc);
      // Link an intermediate crumb to its own path when that path is routable
      // (so "Portal" in Home › Portal › Documents redirects to /portal, etc.).
      crumbs.push({
        label:
          navMatch?.label ??
          SEGMENT_LABELS[seg] ??
          seg.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
        to: navMatch?.path ?? (ROUTABLE_PATHS.has(acc) ? acc : undefined),
      });
    });
  }

  return (
    <nav className="hidden items-center gap-1 text-sm md:flex">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3.5 text-content-muted" />}
          {c.to && i < crumbs.length - 1 ? (
            <Link
              to={c.to}
              className="text-content-muted hover:text-content"
            >
              {c.label}
            </Link>
          ) : (
            <span
              className={cn(
                i === crumbs.length - 1
                  ? 'font-medium text-content'
                  : 'text-content-muted',
              )}
            >
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Topbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logout, switchRole } = useAuthStore();
  const currencyCode = useCurrencyStore((s) => s.code);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const activeCur = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0]!;
  const t = useT();
  const langCode = useLanguageStore((s) => s.code);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const { theme, toggle } = useThemeStore();
  const { setMobileSidebar, setCommandOpen } = useUiStore();
  const notifications = useDataStore((s) => s.notifications);
  const updateNotif = useDataStore((s) => s.update);

  const unread = notifications.filter((n) => !n.read).length;
  const recent = notifications.slice(0, 6);

  return (
    <header className="no-print sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
      <button
        onClick={() => setMobileSidebar(true)}
        className="rounded-md p-1.5 text-content-secondary hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <Breadcrumbs />

      <button
        onClick={() => setCommandOpen(true)}
        className="ml-auto flex h-9 items-center gap-2 rounded-md border border-line bg-base px-3 text-sm text-content-muted transition-colors hover:border-brand-secondary/40 md:w-64"
      >
        <Search className="size-4" />
        <span className="hidden md:inline">{t('Search anything…')}</span>
        <kbd className="ml-auto hidden rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] md:inline">
          ⌘K
        </kbd>
      </button>

      {/* Quick add */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="primary" aria-label="Quick add">
            <Plus className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('Create New')}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate('/leads/new')}>
            <Target /> {t('Lead')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/customers/new')}>
            <Building2 /> {t('Customer')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/proposals/new')}>
            <FileText /> {t('Proposal')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/tasks/new')}>
            <CheckSquare /> {t('Task')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-content-secondary transition-colors hover:bg-muted"
            aria-label="Switch language"
          >
            <Globe className="size-[18px]" />
            <span className="hidden uppercase sm:inline">{langCode}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-[70vh] w-48 overflow-y-auto">
          <DropdownMenuLabel>{t('Language')}</DropdownMenuLabel>
          {LANGUAGES.map((l) => (
            <DropdownMenuItem key={l.code} onClick={() => setLanguage(l.code)}>
              <span className="flex w-full items-center justify-between gap-4">
                {l.name}
                {langCode === l.code && (
                  <Check className="size-3.5 text-brand-secondary" />
                )}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Currency switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-content-secondary transition-colors hover:bg-muted"
            aria-label="Switch currency"
          >
            <span className="num font-semibold">{activeCur.code}</span>
            <ChevronDown className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{t('Display currency')}</DropdownMenuLabel>
          {CURRENCIES.map((c) => (
            <DropdownMenuItem key={c.code} onClick={() => setCurrency(c.code)}>
              <span className="flex w-full items-center justify-between gap-4">
                <span>
                  <span className="num mr-2 inline-block w-12 text-xs text-content-muted">
                    {c.symbol}
                  </span>
                  {c.name}
                </span>
                {currencyCode === c.code && (
                  <Check className="size-3.5 text-brand-secondary" />
                )}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="rounded-md p-2 text-content-secondary transition-colors hover:bg-muted"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="size-[18px]" />
        ) : (
          <Moon className="size-[18px]" />
        )}
      </button>

      {/* Notifications */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="relative rounded-md p-2 text-content-secondary transition-colors hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="size-[18px]" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-brand-secondary text-[9px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
            <span className="font-display text-sm font-semibold">
              {t('Notifications')}
            </span>
            {unread > 0 && (
              <button
                onClick={() =>
                  notifications
                    .filter((n) => !n.read)
                    .forEach((n) =>
                      updateNotif('notifications', n.id, { read: true }),
                    )
                }
                className="text-xs font-medium text-brand-secondary hover:underline"
              >
                {t('Mark all read')}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {recent.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  updateNotif('notifications', n.id, { read: true });
                  if (n.link) navigate(n.link);
                }}
                className="flex w-full gap-2.5 border-b border-line px-3.5 py-2.5 text-left transition-colors hover:bg-muted"
              >
                {!n.read && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-secondary" />
                )}
                <div className={cn(n.read && 'pl-[18px]')}>
                  <div className="text-sm font-medium text-content">
                    {n.title}
                  </div>
                  <div className="line-clamp-2 text-xs text-content-muted">
                    {n.body}
                  </div>
                  <div className="mt-0.5 text-[10px] text-content-muted">
                    {formatRelative(n.createdAt)}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <Link
            to="/notifications"
            className="block border-t border-line py-2 text-center text-xs font-medium text-brand-secondary hover:underline"
          >
            View all notifications
          </Link>
        </PopoverContent>
      </Popover>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md p-1 pr-2 transition-colors hover:bg-muted">
            <EntityAvatar name={user?.name ?? 'User'} size="sm" />
            <div className="hidden text-left sm:block">
              <div className="text-sm font-medium leading-tight text-content">
                {user?.name}
              </div>
              <div className="text-[11px] leading-tight text-content-muted">
                {user ? ROLE_LABELS[user.role] : ''}
              </div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <UserCog /> {t('Profile Settings')}
          </DropdownMenuItem>
          {DEMO_MODE && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                <span className="flex items-center gap-1.5">
                  <Repeat className="size-3" /> {t('Switch Role (Demo)')}
                </span>
              </DropdownMenuLabel>
              {DEMO_ACCOUNTS.map((acc) => (
                <DropdownMenuItem
                  key={acc.role}
                  onClick={() => {
                    switchRole(acc.role as Role);
                    navigate('/');
                  }}
                >
                  <span className="flex w-full items-center justify-between">
                    {acc.label}
                    {user?.role === acc.role && (
                      <Check className="size-3.5 text-brand-secondary" />
                    )}
                  </span>
                </DropdownMenuItem>
              ))}
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            destructive
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            <LogOut /> {t('Sign Out')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
