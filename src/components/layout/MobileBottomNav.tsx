import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, Building2, CheckSquare, Menu } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const ITEMS = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
  { label: 'Leads', path: '/leads', icon: Target },
  { label: 'Customers', path: '/customers', icon: Building2 },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
];

export function MobileBottomNav() {
  const setMobileSidebar = useUiStore((s) => s.setMobileSidebar);

  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-30 flex h-16 items-stretch border-t border-line bg-surface lg:hidden">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-brand-secondary'
                  : 'text-content-muted',
              )
            }
          >
            <Icon className="size-5" strokeWidth={1.5} />
            {item.label}
          </NavLink>
        );
      })}
      <button
        onClick={() => setMobileSidebar(true)}
        className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-content-muted"
      >
        <Menu className="size-5" strokeWidth={1.5} />
        More
      </button>
    </nav>
  );
}
