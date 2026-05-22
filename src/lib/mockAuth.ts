import type { Role } from '@/types';

// Hardcoded demo credentials. These map to seeded user records user_01..04.
// This is a prototype — there is no real authentication.

export interface DemoAccount {
  email: string;
  password: string;
  role: Role;
  label: string;
  hint: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin@oilgas.in',
    password: 'admin123',
    role: 'ADMIN',
    label: 'Admin',
    hint: 'Full access to every screen',
  },
  {
    email: 'manager@oilgas.in',
    password: 'manager123',
    role: 'SALES_MANAGER',
    label: 'Sales Manager',
    hint: 'Manages team, approves proposals',
  },
  {
    email: 'exec@oilgas.in',
    password: 'exec123',
    role: 'SALES_EXECUTIVE',
    label: 'Sales Executive',
    hint: 'Works leads, creates proposals',
  },
  {
    email: 'accounts@oilgas.in',
    password: 'accounts123',
    role: 'ACCOUNTS',
    label: 'Accounts',
    hint: 'Invoices and payments',
  },
];

export const DEMO_USER_ID_BY_ROLE: Record<Role, string> = {
  ADMIN: 'user_01',
  SALES_MANAGER: 'user_02',
  SALES_EXECUTIVE: 'user_03',
  ACCOUNTS: 'user_04',
};
