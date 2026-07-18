import type { Role } from '@/types';

// ---------------------------------------------------------------------------
// Visual RBAC matrix. This is a prototype — permissions shape what the UI
// shows; there is no server enforcing anything.
// ---------------------------------------------------------------------------

export type PermModule =
  | 'dashboard'
  | 'leads'
  | 'customers'
  | 'items'
  | 'proposals'
  | 'orders'
  | 'invoices'
  | 'operations'
  | 'tasks'
  | 'communication'
  | 'reports'
  | 'staff'
  | 'settings'
  | 'portal'
  | 'erp'
  | 'hrms';

export type PermAction = 'view' | 'create' | 'edit' | 'delete' | 'approve';

export const PERM_MODULES: { key: PermModule; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'leads', label: 'Leads' },
  { key: 'customers', label: 'Customers' },
  { key: 'items', label: 'Items & Products' },
  { key: 'proposals', label: 'Proposals' },
  { key: 'orders', label: 'Sales Orders' },
  { key: 'invoices', label: 'Invoices & Payments' },
  { key: 'operations', label: 'Operations & Dispatch' },
  { key: 'tasks', label: 'Tasks & Calendar' },
  { key: 'communication', label: 'Communication' },
  { key: 'reports', label: 'Reports' },
  { key: 'staff', label: 'Staff Management' },
  { key: 'settings', label: 'Admin & Settings' },
  { key: 'portal', label: 'Customer Portal' },
  { key: 'erp', label: 'ERP Tools' },
  { key: 'hrms', label: 'My Attendance (HRMS)' },
];

export const PERM_ACTIONS: PermAction[] = [
  'view',
  'create',
  'edit',
  'delete',
  'approve',
];

type Matrix = Record<Role, Record<PermModule, PermAction[]>>;

const ALL: PermAction[] = ['view', 'create', 'edit', 'delete', 'approve'];
const VCE: PermAction[] = ['view', 'create', 'edit'];
const VIEW: PermAction[] = ['view'];

export const DEFAULT_PERMISSIONS: Matrix = {
  ADMIN: {
    dashboard: ALL,
    leads: ALL,
    customers: ALL,
    items: ALL,
    proposals: ALL,
    orders: ALL,
    invoices: ALL,
    operations: ALL,
    tasks: ALL,
    communication: ALL,
    reports: ALL,
    staff: ALL,
    settings: ALL,
    portal: [],
    erp: ALL,
    hrms: ALL,
  },
  SALES_MANAGER: {
    dashboard: VIEW,
    leads: ['view', 'create', 'edit', 'delete'],
    customers: ['view', 'create', 'edit', 'delete'],
    items: VIEW,
    proposals: ['view', 'create', 'edit', 'approve'],
    orders: VCE,
    invoices: VIEW,
    operations: VCE,
    tasks: ['view', 'create', 'edit', 'delete'],
    communication: VCE,
    reports: VIEW,
    staff: VIEW,
    settings: [],
    portal: [],
    erp: [],
    hrms: VCE,
  },
  SALES_EXECUTIVE: {
    dashboard: VIEW,
    leads: VCE,
    customers: VCE,
    items: VIEW,
    proposals: VCE,
    orders: VIEW,
    invoices: [],
    operations: VIEW,
    tasks: VCE,
    communication: VCE,
    reports: VIEW,
    staff: [],
    settings: [],
    portal: [],
    erp: [],
    hrms: VCE,
  },
  ACCOUNTS: {
    dashboard: VIEW,
    leads: VIEW,
    customers: VIEW,
    items: VIEW,
    proposals: VIEW,
    orders: VIEW,
    invoices: ALL,
    operations: VIEW,
    tasks: VCE,
    communication: VCE,
    reports: VIEW,
    staff: [],
    settings: [],
    portal: [],
    erp: [],
    hrms: VCE,
  },
  CUSTOMER: {
    dashboard: [],
    leads: [],
    customers: [],
    items: [],
    proposals: [],
    orders: [],
    invoices: [],
    operations: [],
    tasks: [],
    communication: [],
    reports: [],
    staff: [],
    settings: [],
    portal: ALL,
    erp: [],
    hrms: [],
  },
};

export function can(
  permissions: Matrix,
  role: Role,
  module: PermModule,
  action: PermAction,
): boolean {
  // Fall back to built-in defaults when a role/module is absent from a stored
  // (possibly older) matrix — so newly added modules work without a re-seed.
  const perms =
    permissions[role]?.[module] ?? DEFAULT_PERMISSIONS[role]?.[module] ?? [];
  return perms.includes(action);
}

/** Margin / cost-rate visibility — hidden from executives. */
export function canSeeMargins(role: Role): boolean {
  return role === 'ADMIN' || role === 'SALES_MANAGER';
}
