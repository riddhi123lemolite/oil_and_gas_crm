// ============================================================================
// Entity type definitions for the OilGas CRM prototype.
// ============================================================================

export type Role = 'ADMIN' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'ACCOUNTS';

export interface User {
  id: string;
  userCode: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  city: string;
  state: string;
  reportsToId?: string;
  avatarUrl?: string;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------
export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type LeadTemperature =
  | 'HOT'
  | 'WARM'
  | 'COLD'
  | 'FOLLOWUP'
  | 'IRRELEVANT'
  | 'OTHER';

export type LeadSource =
  | 'WEBSITE'
  | 'REFERRAL'
  | 'COLD_CALL'
  | 'TRADE_SHOW'
  | 'INDIAMART'
  | 'JUSTDIAL'
  | 'WHATSAPP'
  | 'WALK_IN'
  | 'OTHER';

export interface Lead {
  id: string;
  code: string;
  name: string;
  companyName?: string;
  phone: string;
  altPhone?: string;
  email?: string;
  city: string;
  state: string;
  source: LeadSource;
  status: LeadStatus;
  temperature: LeadTemperature;
  productInterest: string[];
  estimatedValue?: number;
  assignedToId: string;
  createdById: string;
  notes?: string;
  lostReason?: string;
  lastActivityAt?: string;
  nextFollowUpAt?: string;
  convertedCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
export type CustomerSegment =
  | 'VIP'
  | 'STANDARD'
  | 'NEW'
  | 'DORMANT'
  | 'INDUSTRIAL'
  | 'RETAIL'
  | 'RESELLER';

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ContactPerson {
  id: string;
  name: string;
  designation: string;
  phone: string;
  email?: string;
  type: 'DECISION_MAKER' | 'ACCOUNTS' | 'DISPATCH' | 'OTHER';
}

export interface Customer {
  id: string;
  code: string;
  companyName: string;
  contactPerson: string;
  email?: string;
  phone: string;
  altPhone?: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  industry?: string;
  segment: CustomerSegment;
  creditLimit: number;
  paymentTermsDays: number;
  outstanding: number;
  totalRevenue: number;
  billingAddress: Address;
  shippingAddress: Address;
  contacts: ContactPerson[];
  state: string;
  city: string;
  pincode: string;
  ownerId: string;
  active: boolean;
  lastOrderAt?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------
export type ItemCategory =
  | 'OIL_FUEL'
  | 'SOLVENT'
  | 'GLYCOL'
  | 'PLASTIC_GRANULE'
  | 'LUBRICANT'
  | 'SPECIALTY';

export type Unit = 'KL' | 'MT' | 'L' | 'KG' | 'MTS' | 'DRUM' | 'BARREL';

export interface PricePoint {
  date: string;
  rate: number;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  description?: string;
  hsnCode: string;
  category: ItemCategory;
  group?: string;
  unit: Unit;
  rate: number;
  costRate?: number;
  gstPercent: number;
  specifications?: string;
  stockTotal: number;
  warehouse: string;
  priceHistory: PricePoint[];
  active: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Proposals
// ---------------------------------------------------------------------------
export type ProposalStatus =
  | 'DRAFT'
  | 'SENT'
  | 'UNDER_REVIEW'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'EXPIRED';

export interface ProposalItem {
  id: string;
  itemId: string;
  description: string;
  quantity: number;
  unit: Unit;
  rate: number;
  discount: number;
  gstPercent: number;
  amount: number;
}

export interface Proposal {
  id: string;
  number: string;
  customerId?: string;
  leadId?: string;
  subject: string;
  proposalDate: string;
  validUntil: string;
  status: ProposalStatus;
  state: string;
  city: string;
  items: ProposalItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  transportCharge: number;
  total: number;
  terms?: string;
  notes?: string;
  createdById: string;
  approvedById?: string;
  needsApproval: boolean;
  wonAt?: string;
  lostAt?: string;
  lostReason?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Sales orders / Invoices / Payments
// ---------------------------------------------------------------------------
export type OrderStatus =
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PARTIALLY_DISPATCHED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface SalesOrder {
  id: string;
  number: string;
  customerId: string;
  proposalId?: string;
  orderDate: string;
  status: OrderStatus;
  items: ProposalItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  createdById: string;
  createdAt: string;
}

export type InvoiceStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'OVERDUE';

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  orderId?: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: ProposalItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  transportCharge: number;
  total: number;
  amountPaid: number;
  paidAt?: string;
  createdById: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  number: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  mode: 'NEFT' | 'RTGS' | 'CHEQUE' | 'UPI' | 'CASH';
  reference: string;
  paidAt: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Transportation
// ---------------------------------------------------------------------------
export interface TransportRoute {
  id: string;
  fromLocation: string;
  toLocation: string;
  distanceKm: number;
  baseRent?: number;
  perKmRate?: number;
  carrier?: string;
  active: boolean;
}

export type DispatchStatus =
  | 'SCHEDULED'
  | 'LOADING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED';

export interface Dispatch {
  id: string;
  number: string;
  orderId?: string;
  customerId: string;
  itemId: string;
  quantity: number;
  unit: Unit;
  vehicleNo?: string;
  driverName?: string;
  driverPhone?: string;
  routeId?: string;
  status: DispatchStatus;
  currentLocation?: string;
  scheduledAt: string;
  loadedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
}

export interface Vehicle {
  id: string;
  registrationNo: string;
  type: string;
  capacityKL: number;
  ownerType: 'OWNED' | 'CONTRACT';
  rcExpiry: string;
  fitnessExpiry: string;
  insuranceExpiry: string;
  currentDriverId?: string;
  active: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNo: string;
  licenseExpiry: string;
  experienceYears: number;
  currentVehicleId?: string;
  currentTripId?: string;
  active: boolean;
}

export interface InventoryRecord {
  id: string;
  itemId: string;
  warehouse: string;
  quantity: number;
  reorderLevel: number;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
export type TaskStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type RelatedEntityType =
  | 'lead'
  | 'customer'
  | 'proposal'
  | 'dispatch'
  | 'invoice';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  type: 'CALL' | 'MEETING' | 'FOLLOW_UP' | 'EMAIL' | 'OTHER';
  assignedToId: string;
  relatedType?: RelatedEntityType;
  relatedId?: string;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  createdById: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Activity / Communication
// ---------------------------------------------------------------------------
export type ActivityType =
  | 'CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'NOTE'
  | 'WHATSAPP'
  | 'STATUS_CHANGE'
  | 'PROPOSAL'
  | 'PAYMENT'
  | 'SYSTEM';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  entityType: RelatedEntityType;
  entityId: string;
  userId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  body: string;
  createdAt: string;
  delivered: boolean;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'DM' | 'GROUP';
  memberIds: string[];
}

export interface EmailRecord {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  folder: 'SENT' | 'DRAFT';
}

export interface CallLog {
  id: string;
  contactName: string;
  phone: string;
  direction: 'INBOUND' | 'OUTBOUND' | 'MISSED';
  durationSec: number;
  outcome: string;
  userId: string;
  relatedType?: RelatedEntityType;
  relatedId?: string;
  loggedAt: string;
}

export type NotificationKind =
  | 'LEAD'
  | 'PROPOSAL'
  | 'INVOICE'
  | 'DISPATCH'
  | 'TASK'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Documents / Audit / Definitions
// ---------------------------------------------------------------------------
export interface CrmDocument {
  id: string;
  name: string;
  category: 'PO' | 'AGREEMENT' | 'KYC' | 'INVOICE' | 'OTHER';
  entityType: RelatedEntityType;
  entityId: string;
  sizeKb: number;
  dataUrl?: string;
  uploadedById: string;
  uploadedAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  detail: string;
  createdAt: string;
}

export interface DefinitionItem {
  id: string;
  label: string;
  colorKey?: string;
  active: boolean;
}

export interface Definitions {
  leadStatuses: DefinitionItem[];
  lostReasons: DefinitionItem[];
  industries: DefinitionItem[];
  leadSources: DefinitionItem[];
}

export interface CompanySettings {
  name: string;
  legalName: string;
  gstin: string;
  pan: string;
  email: string;
  phone: string;
  website: string;
  address: Address;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  invoicePrefix: string;
  proposalPrefix: string;
  terms: string;
  logoDataUrl?: string;
}
