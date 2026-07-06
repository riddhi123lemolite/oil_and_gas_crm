import {
  LayoutDashboard, Package, PackageOpen, Truck, History, PackageCheck,
  FolderOpen, ReceiptIndianRupee, FileText, ClipboardList, Receipt, FilePlus, FileMinus, Files,
  Wallet, AlertCircle, CalendarClock, Download,
  TrendingUp, Flame, BarChart3, Fuel, LineChart,
  Bell, Megaphone,
  LifeBuoy, HelpCircle, Ticket, Phone,
  UserCircle, User, Building2, Settings,
  type LucideIcon,
} from 'lucide-react';

/** Badge counters resolved live from the data store. */
export type BadgeKey = 'notifications' | 'unpaidInvoices' | 'outstanding';

export interface CustNavItem {
  label: string;
  /** Full route including any query/hash — every item points to a real page. */
  path: string;
  icon: LucideIcon;
  badge?: BadgeKey;
}

export interface CustNavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Flat sections render their single item as a top-level link (no expander). */
  flat?: boolean;
  items: CustNavItem[];
}

// Configuration-driven customer navigation. Add future items here — the sidebar
// renders entirely from this config, so no JSX changes are needed to extend it.
export const CUSTOMER_NAV: CustNavSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    flat: true,
    items: [{ label: 'Dashboard', path: '/portal', icon: LayoutDashboard }],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: Package,
    items: [
      { label: 'Active Orders', path: '/portal/orders?status=active', icon: PackageOpen },
      { label: 'Product Tracking', path: '/portal/products', icon: Truck },
      { label: 'Order History', path: '/portal/history', icon: History },
      { label: 'Delivered Orders', path: '/portal/orders?status=delivered', icon: PackageCheck },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FolderOpen,
    items: [
      { label: 'Invoices', path: '/portal/invoices', icon: ReceiptIndianRupee, badge: 'unpaidInvoices' },
      { label: 'E-Invoices', path: '/portal/documents?type=E-Invoice', icon: FileText },
      { label: 'Delivery Challans', path: '/portal/documents?type=Delivery Challan', icon: FileText },
      { label: 'Purchase Orders', path: '/portal/documents?type=Purchase Order', icon: ClipboardList },
      { label: 'Receipts', path: '/portal/documents?type=Receipt', icon: Receipt },
      { label: 'Credit Notes', path: '/portal/documents?type=Credit Note', icon: FilePlus },
      { label: 'Debit Notes', path: '/portal/documents?type=Debit Note', icon: FileMinus },
      { label: 'Other Documents', path: '/portal/documents?type=Other', icon: Files },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: Wallet,
    items: [
      { label: 'Payment Overview', path: '/portal/payments', icon: Wallet },
      { label: 'Outstanding Payments', path: '/portal/payments?view=outstanding', icon: AlertCircle, badge: 'outstanding' },
      { label: 'Payment History', path: '/portal/payments?view=history', icon: History },
      { label: 'Payment Terms', path: '/portal/payments?view=terms', icon: CalendarClock },
      { label: 'Download Receipts', path: '/portal/payments?view=receipts', icon: Download },
    ],
  },
  {
    id: 'market',
    label: 'Market',
    icon: TrendingUp,
    items: [
      { label: 'Live Brent Oil Price', path: '/portal/market', icon: Flame },
      { label: 'Live Oil Prices', path: '/portal/market#oil', icon: BarChart3 },
      { label: 'Fuel Prices', path: '/portal/market#fuel', icon: Fuel },
      { label: 'Market Trends', path: '/portal/market#trends', icon: LineChart },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    items: [
      { label: 'Notifications', path: '/portal/notifications', icon: Bell, badge: 'notifications' },
      { label: 'Announcements', path: '/portal/notifications#announcements', icon: Megaphone },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    icon: LifeBuoy,
    items: [
      { label: 'Help Center', path: '/portal/support', icon: HelpCircle },
      { label: 'Raise Support Ticket', path: '/portal/support#ticket', icon: Ticket },
      { label: 'Contact Account Manager', path: '/portal/support#contact', icon: Phone },
    ],
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: UserCircle,
    items: [
      { label: 'My Profile', path: '/portal/profile', icon: User },
      { label: 'Company Information', path: '/portal/company', icon: Building2 },
      { label: 'Settings', path: '/portal/settings', icon: Settings },
    ],
  },
];
