import type {
  CustomerSegment,
  DispatchStatus,
  InvoiceStatus,
  ItemCategory,
  LeadSource,
  LeadStatus,
  LeadTemperature,
  Priority,
  ProposalStatus,
  Role,
  TaskStatus,
  Unit,
} from '@/types';

// A badge tone maps to a colour treatment used by <StatusBadge />.
export type BadgeTone =
  | 'hot'
  | 'warm'
  | 'cold'
  | 'followup'
  | 'neutral'
  | 'success'
  | 'danger'
  | 'info'
  | 'brand';

export interface LabelDef {
  label: string;
  tone: BadgeTone;
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  SALES_MANAGER: 'Sales Manager',
  SALES_EXECUTIVE: 'Sales Executive',
  ACCOUNTS: 'Accounts',
  CUSTOMER: 'Customer',
};

export const LEAD_STATUS: Record<LeadStatus, LabelDef> = {
  NEW: { label: 'New', tone: 'info' },
  CONTACTED: { label: 'Contacted', tone: 'cold' },
  QUALIFIED: { label: 'Qualified', tone: 'warm' },
  PROPOSAL_SENT: { label: 'Proposal Sent', tone: 'brand' },
  NEGOTIATION: { label: 'Negotiation', tone: 'warm' },
  WON: { label: 'Won', tone: 'success' },
  LOST: { label: 'Lost', tone: 'danger' },
};

export const LEAD_STAGES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
];

export const LEAD_TEMPERATURE: Record<LeadTemperature, LabelDef> = {
  HOT: { label: 'Hot', tone: 'hot' },
  WARM: { label: 'Warm', tone: 'warm' },
  COLD: { label: 'Cold', tone: 'cold' },
  FOLLOWUP: { label: 'Follow-up', tone: 'followup' },
  IRRELEVANT: { label: 'Irrelevant', tone: 'neutral' },
  OTHER: { label: 'Other', tone: 'neutral' },
};

/** Very subtle row tint for the lead list, keyed by temperature. */
export const LEAD_ROW_TINT: Record<LeadTemperature, string> = {
  HOT: 'bg-[var(--row-hot)]',
  WARM: 'bg-[var(--row-warm)]',
  COLD: 'bg-[var(--row-cold)]',
  FOLLOWUP: 'bg-[var(--row-followup)]',
  IRRELEVANT: '',
  OTHER: '',
};

export const LEAD_SOURCE: Record<LeadSource, string> = {
  WEBSITE: 'Website',
  REFERRAL: 'Referral',
  COLD_CALL: 'Cold Call',
  TRADE_SHOW: 'Trade Show',
  INDIAMART: 'IndiaMART',
  JUSTDIAL: 'JustDial',
  WHATSAPP: 'WhatsApp',
  WALK_IN: 'Walk-in',
  OTHER: 'Other',
};

export const CUSTOMER_SEGMENT: Record<CustomerSegment, LabelDef> = {
  VIP: { label: 'VIP', tone: 'brand' },
  STANDARD: { label: 'Standard', tone: 'neutral' },
  NEW: { label: 'New', tone: 'info' },
  DORMANT: { label: 'Dormant', tone: 'warm' },
  INDUSTRIAL: { label: 'Industrial', tone: 'cold' },
  RETAIL: { label: 'Retail', tone: 'followup' },
  RESELLER: { label: 'Reseller', tone: 'neutral' },
};

export const ITEM_CATEGORY: Record<
  ItemCategory,
  { label: string; color: string }
> = {
  OIL_FUEL: { label: 'Oil & Fuel', color: 'var(--tw-cat-oil, #B45309)' },
  SOLVENT: { label: 'Solvents', color: '#7C3AED' },
  GLYCOL: { label: 'Glycols', color: '#0891B2' },
  PLASTIC_GRANULE: { label: 'Plastic Granules', color: '#65A30D' },
  LUBRICANT: { label: 'Lubricants', color: '#C2410C' },
  SPECIALTY: { label: 'Specialty Chemicals', color: '#9333EA' },
};

export const ITEM_CATEGORY_COLOR: Record<ItemCategory, string> = {
  OIL_FUEL: '#B45309',
  SOLVENT: '#7C3AED',
  GLYCOL: '#0891B2',
  PLASTIC_GRANULE: '#65A30D',
  LUBRICANT: '#C2410C',
  SPECIALTY: '#9333EA',
};

export const PROPOSAL_STATUS: Record<ProposalStatus, LabelDef> = {
  DRAFT: { label: 'Draft', tone: 'neutral' },
  SENT: { label: 'Sent', tone: 'info' },
  UNDER_REVIEW: { label: 'Under Review', tone: 'cold' },
  NEGOTIATION: { label: 'Negotiation', tone: 'warm' },
  WON: { label: 'Won', tone: 'success' },
  LOST: { label: 'Lost', tone: 'danger' },
  EXPIRED: { label: 'Expired', tone: 'neutral' },
};

export const INVOICE_STATUS: Record<InvoiceStatus, LabelDef> = {
  PAID: { label: 'Paid', tone: 'success' },
  UNPAID: { label: 'Unpaid', tone: 'warm' },
  PARTIAL: { label: 'Partial', tone: 'info' },
  OVERDUE: { label: 'Overdue', tone: 'danger' },
};

export const DISPATCH_STATUS: Record<DispatchStatus, LabelDef> = {
  SCHEDULED: { label: 'Scheduled', tone: 'neutral' },
  LOADING: { label: 'Loading', tone: 'info' },
  IN_TRANSIT: { label: 'In Transit', tone: 'warm' },
  DELIVERED: { label: 'Delivered', tone: 'success' },
  RETURNED: { label: 'Returned', tone: 'danger' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
};

export const DISPATCH_FLOW: DispatchStatus[] = [
  'SCHEDULED',
  'LOADING',
  'IN_TRANSIT',
  'DELIVERED',
];

export const TASK_STATUS: Record<TaskStatus, LabelDef> = {
  NOT_STARTED: { label: 'Not Started', tone: 'neutral' },
  IN_PROGRESS: { label: 'In Progress', tone: 'info' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
};

export const PRIORITY: Record<Priority, LabelDef> = {
  LOW: { label: 'Low', tone: 'neutral' },
  MEDIUM: { label: 'Medium', tone: 'info' },
  HIGH: { label: 'High', tone: 'warm' },
  URGENT: { label: 'Urgent', tone: 'danger' },
};

export const UNITS: Unit[] = ['KL', 'MT', 'L', 'KG', 'MTS', 'DRUM', 'BARREL'];

export const GST_RATES = [0, 5, 12, 18, 28];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

// GST state codes for GSTIN generation / IGST detection.
export const STATE_GST_CODE: Record<string, string> = {
  'Andhra Pradesh': '37',
  Assam: '18',
  Bihar: '10',
  Chhattisgarh: '22',
  Delhi: '07',
  Goa: '30',
  Gujarat: '24',
  Haryana: '06',
  'Himachal Pradesh': '02',
  Jharkhand: '20',
  Karnataka: '29',
  Kerala: '32',
  'Madhya Pradesh': '23',
  Maharashtra: '27',
  Odisha: '21',
  Punjab: '03',
  Rajasthan: '08',
  'Tamil Nadu': '33',
  Telangana: '36',
  'Uttar Pradesh': '09',
  Uttarakhand: '05',
  'West Bengal': '19',
};
