import {
  LayoutDashboard,
  UserCircle,
  Target,
  KanbanSquare,
  Building2,
  CheckSquare,
  Sun,
  CalendarDays,
  Package,
  FileText,
  ShoppingCart,
  ReceiptIndianRupee,
  Wallet,
  Route,
  Truck,
  Navigation,
  Bus,
  IdCard,
  Boxes,
  MessageSquare,
  Mail,
  Bell,
  PhoneCall,
  TrendingUp,
  BarChart3,
  Filter,
  Map,
  Settings2,
  Users,
  CalendarClock,
  ShieldCheck,
  ListChecks,
  Building,
  Plug,
  ScrollText,
  SlidersHorizontal,
  Calculator,
  Fingerprint,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { PermModule } from './permissions';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  module: PermModule;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard, module: 'dashboard' },
      { label: 'AI Assistant', path: '/assistant', icon: Sparkles, module: 'dashboard' },
      { label: 'My Dashboard', path: '/my-dashboard', icon: UserCircle, module: 'dashboard' },
      { label: 'Leads', path: '/leads', icon: Target, module: 'leads' },
      { label: 'Pipeline', path: '/leads/pipeline', icon: KanbanSquare, module: 'leads' },
      { label: 'Customers', path: '/customers', icon: Building2, module: 'customers' },
      { label: 'Tasks', path: '/tasks', icon: CheckSquare, module: 'tasks' },
      { label: 'My Day', path: '/my-day', icon: Sun, module: 'tasks' },
      { label: 'Calendar', path: '/calendar', icon: CalendarDays, module: 'tasks' },
      { label: 'ERP Calculator', path: '/erp-calculator', icon: Calculator, module: 'erp' },
      { label: 'My Attendance', path: '/my-attendance', icon: Fingerprint, module: 'hrms' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Items & Products', path: '/items', icon: Package, module: 'items' },
      { label: 'Proposals & Quotations', path: '/proposals', icon: FileText, module: 'proposals' },
      { label: 'Sales Orders', path: '/orders', icon: ShoppingCart, module: 'orders' },
      { label: 'Invoices', path: '/invoices', icon: ReceiptIndianRupee, module: 'invoices' },
      { label: 'Payments', path: '/payments', icon: Wallet, module: 'invoices' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Transport Routes', path: '/routes', icon: Route, module: 'operations' },
      { label: 'Dispatch Schedule', path: '/dispatch', icon: Truck, module: 'operations' },
      { label: 'Trip Tracking', path: '/trips', icon: Navigation, module: 'operations' },
      { label: 'Vehicles', path: '/vehicles', icon: Bus, module: 'operations' },
      { label: 'Drivers', path: '/drivers', icon: IdCard, module: 'operations' },
      { label: 'Inventory', path: '/inventory', icon: Boxes, module: 'operations' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Chat', path: '/chat', icon: MessageSquare, module: 'communication' },
      { label: 'Email', path: '/email', icon: Mail, module: 'communication' },
      { label: 'Notifications', path: '/notifications', icon: Bell, module: 'communication' },
      { label: 'Call Logs', path: '/call-logs', icon: PhoneCall, module: 'communication' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Sales Analytics', path: '/analytics', icon: TrendingUp, module: 'reports' },
      { label: 'Sales Reports', path: '/reports/sales', icon: BarChart3, module: 'reports' },
      { label: 'Lead Funnel', path: '/reports/funnel', icon: Filter, module: 'reports' },
      { label: 'Geographic', path: '/reports/geo', icon: Map, module: 'reports' },
      { label: 'Report Builder', path: '/reports/builder', icon: Settings2, module: 'reports' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Staff', path: '/staff', icon: Users, module: 'staff' },
      { label: 'Attendance', path: '/attendance', icon: CalendarClock, module: 'staff' },
      { label: 'Roles & Permissions', path: '/settings/roles', icon: ShieldCheck, module: 'settings' },
      { label: 'Definitions', path: '/settings/definitions', icon: ListChecks, module: 'settings' },
      { label: 'Company', path: '/settings/company', icon: Building, module: 'settings' },
      { label: 'Integrations', path: '/settings/integrations', icon: Plug, module: 'settings' },
      { label: 'Audit Log', path: '/settings/audit', icon: ScrollText, module: 'settings' },
      { label: 'System', path: '/settings/system', icon: SlidersHorizontal, module: 'settings' },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
