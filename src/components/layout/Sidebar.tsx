import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { NAV_GROUPS, type NavItem } from '@/lib/nav';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/lib/i18n';
import { useUiStore } from '@/stores/uiStore';
import { Logo } from '@/components/shared/Logo';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

function SidebarLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const t = useT();
  const link = (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary'
            : 'text-content-secondary hover:bg-muted hover:text-content',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-brand-secondary" />
          )}
          <Icon className="size-[18px] shrink-0" strokeWidth={1.5} />
          {!collapsed && <span className="truncate">{t(item.label)}</span>}
        </>
      )}
    </NavLink>
  );

  return collapsed ? (
    <Tooltip content={t(item.label)} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

export function Sidebar() {
  const { can } = useAuth();
  const t = useT();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebar } =
    useUiStore();

  const collapsed = sidebarCollapsed;

  const content = (mobile: boolean) => {
    const isCollapsed = mobile ? false : collapsed;
    return (
      <div className="flex h-full flex-col bg-surface">
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-line px-4',
            isCollapsed && 'justify-center px-0',
          )}
        >
          <Logo showWordmark={!isCollapsed} />
          {mobile && (
            <button
              onClick={() => setMobileSidebar(false)}
              className="ml-auto rounded-md p-1.5 text-content-muted hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => {
            const visible = group.items.filter((it) => can(it.module, 'view'));
            if (visible.length === 0) return null;
            return (
              <div key={group.label}>
                {!isCollapsed && (
                  <div className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-content-muted">
                    {t(group.label)}
                  </div>
                )}
                {isCollapsed && (
                  <div className="mx-auto mb-1.5 h-px w-6 bg-line" />
                )}
                <div className="space-y-0.5">
                  {visible.map((item) => (
                    <SidebarLink
                      key={item.path}
                      item={item}
                      collapsed={isCollapsed}
                      onNavigate={() => mobile && setMobileSidebar(false)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {!mobile && (
          <div className="shrink-0 border-t border-line p-3">
            <button
              onClick={toggleSidebar}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-content-muted transition-colors hover:bg-muted hover:text-content',
                isCollapsed && 'justify-center px-0',
              )}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="size-[18px]" strokeWidth={1.5} />
              ) : (
                <>
                  <PanelLeftClose className="size-[18px]" strokeWidth={1.5} />
                  <span>{t('Collapse')}</span>
                </>
              )}
            </button>
            {!isCollapsed && (
              <div className="mt-1 px-2.5 text-[10px] text-content-muted">
                Sarvadesk v1.0.0 · Demo
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          'no-print hidden shrink-0 border-r border-line transition-[width] duration-200 lg:block',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
          <div
            className={cn(
              'h-full border-r border-line transition-[width] duration-200',
              collapsed ? 'w-16' : 'w-60',
            )}
          >
            {content(false)}
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 animate-fade-in"
            onClick={() => setMobileSidebar(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-line shadow-pop animate-slide-in-right">
            {content(true)}
          </div>
        </div>
      )}
    </>
  );
}
