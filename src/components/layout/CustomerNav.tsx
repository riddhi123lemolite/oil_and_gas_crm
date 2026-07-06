import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, LogOut, LifeBuoy } from 'lucide-react';
import { CUSTOMER_NAV, type CustNavItem, type CustNavSection, type BadgeKey } from '@/lib/customerNav';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { Tooltip } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { usePortalCustomer, usePortalCustomers, usePortalStore } from '@/hooks/usePortalCustomer';
import { readStorage, writeStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';

const EXPAND_KEY = 'oilgas-crm:cust-nav-expanded';

function useBadges(): Record<BadgeKey, number> {
  const invoices = useDataStore((s) => s.invoices);
  const notifications = useDataStore((s) => s.notifications);
  const me = usePortalCustomer();
  const myInv = me ? invoices.filter((i) => i.customerId === me.id) : [];
  return {
    notifications: notifications.filter((n) => !n.read).length,
    unpaidInvoices: myInv.filter((i) => i.status !== 'PAID').length,
    outstanding: myInv.filter((i) => i.status === 'OVERDUE').length,
  };
}

function useActiveMatcher() {
  const loc = useLocation();
  const full = `${loc.pathname}${loc.search}${loc.hash}`;
  return (item: CustNavItem) => {
    if (item.path.includes('?') || item.path.includes('#')) return full === item.path;
    return loc.pathname === item.path && !loc.search && !loc.hash;
  };
}

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="num ml-auto inline-flex min-w-[18px] items-center justify-center rounded-full bg-brand-secondary px-1.5 text-[10px] font-bold text-white">
      {n > 99 ? '99+' : n}
    </span>
  );
}

// -------- Sidebar header: avatar, name, company, id, account status --------
export function CustomerHeader({ collapsed }: { collapsed: boolean }) {
  const me = usePortalCustomer();
  const accounts = usePortalCustomers();
  const index = usePortalStore((s) => s.index);
  const setIndex = usePortalStore((s) => s.setIndex);
  const label = me?.companyName ?? 'Customer';
  if (collapsed) {
    return (
      <div className="flex justify-center border-b border-line py-3">
        <EntityAvatar name={label} size="sm" />
      </div>
    );
  }
  return (
    <div className="border-b border-line p-4">
      <div className="flex items-center gap-3">
        <EntityAvatar name={label} size="md" />
        <div className="min-w-0">
          <div className="truncate font-semibold text-content">{label}</div>
          <div className="truncate text-xs text-content-muted">{me?.industry ?? '—'}</div>
        </div>
      </div>

      {/* Demo account switcher — view the portal as any of these customers */}
      {accounts.length > 1 && (
        <label className="mt-3 block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-content-muted">
            Viewing account
          </span>
          <select
            value={Math.min(index, accounts.length - 1)}
            onChange={(e) => setIndex(Number(e.target.value))}
            aria-label="Switch customer account"
            className="input-base h-9 text-sm font-medium"
          >
            {accounts.map((c, i) => (
              <option key={c.id} value={i}>
                {c.companyName}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="mt-2.5 flex items-center justify-between text-[11px]">
        <span className="num text-content-muted">ID: {me?.code ?? '—'}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" /> {me?.active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
}

// -------- Sidebar footer: help + logout --------
export function CustomerFooter({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const doLogout = async () => {
    await logout();
    navigate('/login');
  };
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 border-t border-line py-2">
        <Tooltip content="Contact Support" side="right">
          <Link to="/portal/support" onClick={onNavigate} className="rounded-md p-2 text-content-muted hover:bg-muted hover:text-content">
            <LifeBuoy className="size-[18px]" />
          </Link>
        </Tooltip>
        <Tooltip content="Logout" side="right">
          <button onClick={doLogout} className="rounded-md p-2 text-danger hover:bg-danger/10">
            <LogOut className="size-[18px]" />
          </button>
        </Tooltip>
      </div>
    );
  }
  return (
    <div className="space-y-2 border-t border-line p-3">
      <div className="rounded-lg bg-muted/60 p-3">
        <div className="text-xs font-semibold text-content">Need help?</div>
        <Link to="/portal/support" onClick={onNavigate} className="text-xs font-medium text-brand-secondary hover:underline">
          Contact Support
        </Link>
      </div>
      <button
        onClick={doLogout}
        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
      >
        <LogOut className="size-[18px]" strokeWidth={1.5} /> Logout
      </button>
    </div>
  );
}

// -------- The navigation list --------
export function CustomerNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  const isActive = useActiveMatcher();
  const badges = useBadges();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string[]>(() => readStorage(EXPAND_KEY, ['orders', 'documents', 'payments']));

  const activeSection = CUSTOMER_NAV.find((sec) => sec.items.some(isActive))?.id;

  useEffect(() => {
    if (activeSection && !expanded.includes(activeSection)) setExpanded((e) => [...e, activeSection]);
  }, [activeSection, expanded]);
  useEffect(() => {
    writeStorage(EXPAND_KEY, expanded);
  }, [expanded]);

  const toggle = (id: string) => setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  const badgeFor = (item: CustNavItem) => (item.badge ? badges[item.badge] : 0);
  const sectionBadge = (sec: CustNavSection) => sec.items.reduce((n, it) => n + badgeFor(it), 0);

  // ---- Collapsed: section icons only, with tooltips ----
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 py-3">
        {CUSTOMER_NAV.map((sec) => {
          const first = sec.flat ? sec.items[0] : sec.items[0];
          if (!first) return null;
          const active = sec.id === activeSection;
          const Icon = sec.icon;
          const n = sectionBadge(sec);
          return (
            <Tooltip key={sec.id} content={sec.label} side="right">
              <Link
                to={first.path}
                onClick={onNavigate}
                className={cn(
                  'relative rounded-md p-2 transition-colors',
                  active ? 'bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary' : 'text-content-secondary hover:bg-muted hover:text-content',
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.5} />
                {n > 0 && <span className="absolute right-1 top-1 size-1.5 rounded-full bg-brand-secondary" />}
              </Link>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const sections = CUSTOMER_NAV.map((sec) => ({
    ...sec,
    items: q ? sec.items.filter((it) => it.label.toLowerCase().includes(q)) : sec.items,
  })).filter((sec) => !q || sec.items.length > 0);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative px-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search menu…"
          aria-label="Search navigation"
          className="input-base h-9 pl-8"
        />
      </div>

      {sections.map((sec) => {
        const Icon = sec.icon;
        // Flat section → render its single item as a top-level link.
        if (sec.flat) {
          const item = sec.items[0];
          if (!item) return null;
          return <SubLink key={sec.id} item={item} active={isActive(item)} badge={badgeFor(item)} onNavigate={onNavigate} top />;
        }
        const open = q ? true : expanded.includes(sec.id);
        const secActive = sec.items.some(isActive);
        const n = sectionBadge(sec);
        return (
          <div key={sec.id}>
            <button
              onClick={() => toggle(sec.id)}
              aria-expanded={open}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                secActive ? 'text-content' : 'text-content-secondary hover:text-content hover:bg-muted',
              )}
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={1.5} />
              <span className="truncate">{sec.label}</span>
              {n > 0 && <Badge n={n} />}
              <ChevronDown className={cn('ml-auto size-4 shrink-0 text-content-muted transition-transform', open && 'rotate-180', n > 0 && 'ml-1.5')} />
            </button>
            {open && (
              <div className="mt-0.5 space-y-0.5 pl-3.5">
                {sec.items.map((item) => (
                  <SubLink key={item.path} item={item} active={isActive(item)} badge={badgeFor(item)} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubLink({ item, active, badge, onNavigate, top }: { item: CustNavItem; active: boolean; badge: number; onNavigate: () => void; top?: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-md py-2 text-sm transition-colors',
        top ? 'px-2.5 font-medium' : 'px-2.5',
        active
          ? 'bg-brand-primary/8 font-medium text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary'
          : 'text-content-secondary hover:bg-muted hover:text-content',
      )}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-brand-secondary" />}
      <Icon className="size-4 shrink-0" strokeWidth={1.5} />
      <span className="truncate">{item.label}</span>
      <Badge n={badge} />
    </Link>
  );
}
