import { faker } from '@faker-js/faker';
import type {
  Activity,
  AppNotification,
  AuditLogEntry,
  CallLog,
  ChatChannel,
  CompanySettings,
  CrmDocument,
  Customer,
  Definitions,
  Dispatch,
  Driver,
  EmailRecord,
  InventoryRecord,
  Invoice,
  Item,
  Lead,
  Message,
  Payment,
  Proposal,
  ProposalItem,
  SalesOrder,
  Task,
  TransportRoute,
  User,
  Vehicle,
} from '@/types';
import { STATE_GST_CODE } from '@/lib/constants';
import {
  CARRIERS,
  CITIES,
  COMPANY_PREFIX,
  COMPANY_SUFFIX,
  COMPANY_TYPE,
  FIRST_NAMES,
  INDUSTRIES,
  ITEM_CATALOG,
  LAST_NAMES,
  LOST_REASONS,
  TASK_TITLES,
  WAREHOUSES,
} from './pools';

export interface SeedData {
  users: User[];
  leads: Lead[];
  customers: Customer[];
  items: Item[];
  proposals: Proposal[];
  orders: SalesOrder[];
  invoices: Invoice[];
  payments: Payment[];
  routes: TransportRoute[];
  dispatches: Dispatch[];
  vehicles: Vehicle[];
  drivers: Driver[];
  inventory: InventoryRecord[];
  tasks: Task[];
  activities: Activity[];
  messages: Message[];
  channels: ChatChannel[];
  emails: EmailRecord[];
  callLogs: CallLog[];
  notifications: AppNotification[];
  documents: CrmDocument[];
  auditLog: AuditLogEntry[];
  definitions: Definitions;
  company: CompanySettings;
}

const pick = <T>(arr: readonly T[]): T =>
  faker.helpers.arrayElement(arr as T[]);
const pickMany = <T>(arr: readonly T[], min: number, max: number): T[] =>
  faker.helpers.arrayElements(
    arr as T[],
    faker.number.int({ min, max }),
  );
const chance = (p: number): boolean => faker.number.float() < p;
const iso = (d: Date): string => d.toISOString();
const pad = (n: number, len = 5): string => String(n).padStart(len, '0');

function personName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function phone(): string {
  return `+91 ${faker.helpers.arrayElement(['98', '97', '99', '90', '88', '70', '63'])}${faker.string.numeric(3)} ${faker.string.numeric(5)}`;
}

function companyName(): string {
  const suffix = pick(COMPANY_SUFFIX);
  return `${pick(COMPANY_PREFIX)} ${pick(COMPANY_TYPE)}${suffix ? ' ' + suffix : ''}`;
}

function panNo(): string {
  return (
    faker.string.alpha({ length: 5, casing: 'upper' }) +
    faker.string.numeric(4) +
    faker.string.alpha({ length: 1, casing: 'upper' })
  );
}

function gstinNo(state: string, pan: string): string {
  const code = STATE_GST_CODE[state] ?? '24';
  return `${code}${pan}1Z${faker.string.alphanumeric({ length: 1, casing: 'upper' })}`;
}

const COMPANY_STATE = 'Gujarat';

// ---------------------------------------------------------------------------

export function generateSeed(): SeedData {
  faker.seed(20260521);

  const now = new Date('2026-06-30T10:00:00+05:30');
  const monthsAgo = (m: number): Date =>
    faker.date.between({
      from: new Date(now.getTime() - m * 30 * 86_400_000),
      to: now,
    });

  // -------- Users --------------------------------------------------------
  const users: User[] = [
    {
      id: 'user_01',
      userCode: 'USER01',
      name: 'Rohan Mehta',
      email: 'admin@oilgas.in',
      phone: '+91 98250 10001',
      password: 'admin123',
      role: 'ADMIN',
      city: 'Surat',
      state: 'Gujarat',
      active: true,
      lastLoginAt: iso(monthsAgo(0.05)),
      createdAt: iso(new Date('2023-04-01T09:00:00+05:30')),
    },
    {
      id: 'user_02',
      userCode: 'USER02',
      name: 'Anil Deshmukh',
      email: 'manager@oilgas.in',
      phone: '+91 98250 10002',
      password: 'manager123',
      role: 'SALES_MANAGER',
      city: 'Ahmedabad',
      state: 'Gujarat',
      reportsToId: 'user_01',
      active: true,
      lastLoginAt: iso(monthsAgo(0.1)),
      createdAt: iso(new Date('2023-04-05T09:00:00+05:30')),
    },
    {
      id: 'user_03',
      userCode: 'USER03',
      name: 'Priya Sharma',
      email: 'exec@oilgas.in',
      phone: '+91 98250 10003',
      password: 'exec123',
      role: 'SALES_EXECUTIVE',
      city: 'Surat',
      state: 'Gujarat',
      reportsToId: 'user_02',
      active: true,
      lastLoginAt: iso(monthsAgo(0.2)),
      createdAt: iso(new Date('2023-06-01T09:00:00+05:30')),
    },
    {
      id: 'user_04',
      userCode: 'USER04',
      name: 'Kavita Iyer',
      email: 'accounts@oilgas.in',
      phone: '+91 98250 10004',
      password: 'accounts123',
      role: 'ACCOUNTS',
      city: 'Mumbai',
      state: 'Maharashtra',
      reportsToId: 'user_01',
      active: true,
      lastLoginAt: iso(monthsAgo(0.3)),
      createdAt: iso(new Date('2023-05-10T09:00:00+05:30')),
    },
  ];

  for (let i = 5; i <= 25; i += 1) {
    const loc = pick(CITIES);
    const role = faker.helpers.weightedArrayElement([
      { value: 'SALES_EXECUTIVE' as const, weight: 6 },
      { value: 'SALES_MANAGER' as const, weight: 2 },
      { value: 'ACCOUNTS' as const, weight: 1 },
    ]);
    const name = personName();
    users.push({
      id: `user_${pad(i, 2)}`,
      userCode: `USER${pad(i, 2)}`,
      name,
      email: faker.internet
        .email({
          firstName: name.split(' ')[0],
          lastName: name.split(' ')[1],
          provider: 'oilgas.in',
        })
        .toLowerCase(),
      phone: phone(),
      password: `pass${faker.string.numeric(4)}`,
      role,
      city: loc.city,
      state: loc.state,
      reportsToId: role === 'SALES_MANAGER' ? 'user_01' : 'user_02',
      active: chance(0.9),
      lastLoginAt: iso(monthsAgo(faker.number.float({ min: 0.05, max: 3 }))),
      createdAt: iso(monthsAgo(faker.number.int({ min: 6, max: 24 }))),
    });
  }

  const salesUsers = users.filter(
    (u) => u.role === 'SALES_EXECUTIVE' || u.role === 'SALES_MANAGER',
  );
  const userId = (): string => pick(salesUsers).id;

  // -------- Items --------------------------------------------------------
  const items: Item[] = [];
  let itemSeq = 1;
  const gradeVariants = ['', 'Premium', 'Industrial Grade', 'Bulk Pack'];
  for (const cat of ITEM_CATALOG) {
    const variantCount = faker.number.int({ min: 2, max: 3 });
    const usedVariants = faker.helpers.arrayElements(
      gradeVariants,
      variantCount,
    );
    for (const variant of usedVariants) {
      const rate = faker.number.int({ min: cat.minRate, max: cat.maxRate });
      const history = Array.from({ length: 12 }).map((_, m) => ({
        date: iso(
          new Date(now.getTime() - (11 - m) * 30 * 86_400_000),
        ),
        rate: Math.round(
          rate * faker.number.float({ min: 0.88, max: 1.12 }),
        ),
      }));
      items.push({
        id: `itm_${pad(itemSeq, 3)}`,
        code: `ITM-${pad(itemSeq, 5)}`,
        name: variant ? `${cat.name} ${variant}` : cat.name,
        description: cat.description,
        hsnCode: cat.hsnCode,
        category: cat.category as Item['category'],
        group: cat.group,
        unit: cat.unit as Item['unit'],
        rate,
        costRate: Math.round(rate * faker.number.float({ min: 0.86, max: 0.95 })),
        gstPercent: cat.gst,
        specifications: cat.spec,
        stockTotal: faker.number.int({ min: 0, max: 50000 }),
        warehouse: pick(WAREHOUSES),
        priceHistory: history,
        active: chance(0.95),
        createdAt: iso(monthsAgo(faker.number.int({ min: 6, max: 24 }))),
      });
      itemSeq += 1;
    }
  }

  // -------- Customers ----------------------------------------------------
  const customers: Customer[] = [];
  const segments: Customer['segment'][] = [
    'VIP',
    'STANDARD',
    'NEW',
    'DORMANT',
    'INDUSTRIAL',
    'RETAIL',
    'RESELLER',
  ];
  for (let i = 1; i <= 200; i += 1) {
    const loc = pick(CITIES);
    const pan = panNo();
    const created = monthsAgo(faker.number.int({ min: 1, max: 24 }));
    const revenue = faker.number.int({ min: 200000, max: 90000000 });
    let segment: Customer['segment'] = pick(segments);
    if (revenue > 5000000 && chance(0.6)) segment = 'VIP';
    const lastOrder = chance(0.85)
      ? monthsAgo(faker.number.int({ min: 0, max: 6 }))
      : monthsAgo(faker.number.int({ min: 4, max: 14 }));
    const cName = personName();
    customers.push({
      id: `cust_${pad(i, 3)}`,
      code: `CUST-${pad(i, 5)}`,
      companyName: companyName(),
      contactPerson: cName,
      email: faker.internet.email().toLowerCase(),
      phone: phone(),
      altPhone: chance(0.4) ? phone() : undefined,
      gstin: gstinNo(loc.state, pan),
      pan,
      cin: chance(0.3)
        ? `U${faker.string.numeric(5)}${STATE_GST_CODE[loc.state] ?? 'GJ'}${faker.string.numeric(4)}PTC${faker.string.numeric(6)}`
        : undefined,
      industry: pick(INDUSTRIES),
      segment,
      creditLimit: faker.helpers.arrayElement([
        500000, 1000000, 2500000, 5000000, 10000000, 20000000,
      ]),
      paymentTermsDays: faker.helpers.arrayElement([0, 7, 15, 30, 45, 60]),
      outstanding: chance(0.55)
        ? faker.number.int({ min: 0, max: 4500000 })
        : 0,
      totalRevenue: revenue,
      billingAddress: {
        line1: `${faker.number.int({ min: 1, max: 999 })}, ${faker.helpers.arrayElement(['GIDC Estate', 'Industrial Area', 'Market Yard', 'Trade Centre', 'Ring Road'])}`,
        line2: faker.helpers.arrayElement(['Phase II', 'Sector 5', 'Block C', '']),
        city: loc.city,
        state: loc.state,
        pincode: loc.pincode,
      },
      shippingAddress: {
        line1: `Plot ${faker.number.int({ min: 1, max: 400 })}, ${faker.helpers.arrayElement(['GIDC', 'MIDC', 'SIDCO', 'Industrial Estate'])}`,
        city: loc.city,
        state: loc.state,
        pincode: loc.pincode,
      },
      contacts: [
        {
          id: `con_${i}_1`,
          name: cName,
          designation: 'Proprietor',
          phone: phone(),
          email: faker.internet.email().toLowerCase(),
          type: 'DECISION_MAKER',
        },
        {
          id: `con_${i}_2`,
          name: personName(),
          designation: 'Accounts Manager',
          phone: phone(),
          type: 'ACCOUNTS',
        },
      ],
      state: loc.state,
      city: loc.city,
      pincode: loc.pincode,
      ownerId: userId(),
      active: chance(0.93),
      lastOrderAt: iso(lastOrder),
      createdAt: iso(created),
    });
  }

  // -------- Leads --------------------------------------------------------
  const leads: Lead[] = [];
  const statuses: Lead['status'][] = [
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'PROPOSAL_SENT',
    'NEGOTIATION',
    'WON',
    'LOST',
  ];
  const temps: Lead['temperature'][] = [
    'HOT',
    'WARM',
    'COLD',
    'FOLLOWUP',
    'IRRELEVANT',
    'OTHER',
  ];
  const sources: Lead['source'][] = [
    'WEBSITE',
    'REFERRAL',
    'COLD_CALL',
    'TRADE_SHOW',
    'INDIAMART',
    'JUSTDIAL',
    'WHATSAPP',
    'WALK_IN',
    'OTHER',
  ];
  for (let i = 1; i <= 520; i += 1) {
    const loc = pick(CITIES);
    const created = monthsAgo(faker.number.int({ min: 0, max: 16 }));
    const status = faker.helpers.weightedArrayElement([
      { value: 'NEW' as const, weight: 5 },
      { value: 'CONTACTED' as const, weight: 5 },
      { value: 'QUALIFIED' as const, weight: 4 },
      { value: 'PROPOSAL_SENT' as const, weight: 3 },
      { value: 'NEGOTIATION' as const, weight: 2 },
      { value: 'WON' as const, weight: 2 },
      { value: 'LOST' as const, weight: 3 },
    ]);
    const won = status === 'WON';
    leads.push({
      id: `lead_${pad(i, 3)}`,
      code: `LD-2026-${pad(i, 5)}`,
      name: personName(),
      companyName: companyName(),
      phone: phone(),
      altPhone: chance(0.3) ? phone() : undefined,
      email: chance(0.8) ? faker.internet.email().toLowerCase() : undefined,
      city: loc.city,
      state: loc.state,
      source: pick(sources),
      status,
      temperature: pick(temps),
      productInterest: pickMany(
        items.map((it) => it.name),
        1,
        3,
      ),
      estimatedValue: faker.number.int({ min: 200000, max: 18000000 }),
      assignedToId: userId(),
      createdById: userId(),
      notes: chance(0.5)
        ? faker.helpers.arrayElement([
            'Customer not responding to calls.',
            'Wants bulk diesel for transport fleet.',
            'Comparing rates with two other suppliers.',
            'Requested credit period of 45 days.',
            'Interested in monthly supply contract.',
          ])
        : undefined,
      lostReason: status === 'LOST' ? pick(LOST_REASONS) : undefined,
      lastActivityAt: iso(
        faker.date.between({ from: created, to: now }),
      ),
      nextFollowUpAt:
        status !== 'WON' && status !== 'LOST' && chance(0.7)
          ? iso(faker.date.soon({ days: 21, refDate: now }))
          : undefined,
      convertedCustomerId: won ? pick(customers).id : undefined,
      createdAt: iso(created),
      updatedAt: iso(faker.date.between({ from: created, to: now })),
    });
  }
  void statuses;

  // -------- Transport routes --------------------------------------------
  const routes: TransportRoute[] = [];
  for (let i = 1; i <= 64; i += 1) {
    const from = pick(CITIES);
    let to = pick(CITIES);
    let guard = 0;
    while (to.city === from.city && guard < 5) {
      to = pick(CITIES);
      guard += 1;
    }
    const km = faker.number.int({ min: 60, max: 2100 });
    routes.push({
      id: `route_${pad(i, 3)}`,
      fromLocation: from.city,
      toLocation: to.city,
      distanceKm: km,
      baseRent: chance(0.78)
        ? faker.number.int({ min: 12000, max: 120000 })
        : undefined,
      perKmRate: faker.number.int({ min: 38, max: 62 }),
      carrier: pick(CARRIERS),
      active: chance(0.92),
    });
  }

  // -------- Vehicles & drivers ------------------------------------------
  const drivers: Driver[] = [];
  for (let i = 1; i <= 32; i += 1) {
    drivers.push({
      id: `drv_${pad(i, 3)}`,
      name: personName(),
      phone: phone(),
      licenseNo: `${faker.helpers.arrayElement(['GJ', 'MH', 'TN', 'DL'])}${faker.string.numeric(2)} ${faker.string.numeric(11)}`,
      licenseExpiry: iso(faker.date.future({ years: 4, refDate: now })),
      experienceYears: faker.number.int({ min: 1, max: 22 }),
      active: chance(0.9),
    });
  }
  const vehicles: Vehicle[] = [];
  for (let i = 1; i <= 30; i += 1) {
    const cap = faker.helpers.arrayElement([12, 18, 24]);
    vehicles.push({
      id: `veh_${pad(i, 3)}`,
      registrationNo: `${faker.helpers.arrayElement(['GJ05', 'GJ06', 'MH04', 'MH12', 'TN09'])} ${faker.string.alpha({ length: 2, casing: 'upper' })} ${faker.string.numeric(4)}`,
      type: `${cap} KL Tanker`,
      capacityKL: cap,
      ownerType: chance(0.6) ? 'OWNED' : 'CONTRACT',
      rcExpiry: iso(faker.date.future({ years: 3, refDate: now })),
      fitnessExpiry: iso(
        faker.date.between({
          from: new Date(now.getTime() - 30 * 86_400_000),
          to: new Date(now.getTime() + 400 * 86_400_000),
        }),
      ),
      insuranceExpiry: iso(
        faker.date.between({
          from: new Date(now.getTime() - 20 * 86_400_000),
          to: new Date(now.getTime() + 365 * 86_400_000),
        }),
      ),
      currentDriverId: drivers[i - 1]?.id,
      active: chance(0.92),
    });
  }

  // -------- Proposals ----------------------------------------------------
  function buildLineItems(): ProposalItem[] {
    const chosen = faker.helpers.arrayElements(
      items,
      faker.number.int({ min: 1, max: 5 }),
    );
    return chosen.map((it, idx) => {
      const qty = faker.number.int({
        min: it.unit === 'KL' ? 5 : 100,
        max: it.unit === 'KL' ? 90 : 5000,
      });
      const rate = it.rate;
      const discount = faker.helpers.arrayElement([0, 0, 0, 2, 5]);
      const amount = Math.round(qty * rate * (1 - discount / 100));
      return {
        id: `pi_${idx}`,
        itemId: it.id,
        description: it.name,
        quantity: qty,
        unit: it.unit,
        rate,
        discount,
        gstPercent: it.gstPercent,
        amount,
      };
    });
  }

  const proposals: Proposal[] = [];
  for (let i = 1; i <= 160; i += 1) {
    const customer = pick(customers);
    const lineItems = buildLineItems();
    const subtotal = lineItems.reduce((s, li) => s + li.amount, 0);
    const transport = chance(0.6)
      ? faker.number.int({ min: 8000, max: 90000 })
      : 0;
    const intra = customer.state === COMPANY_STATE;
    const taxable = subtotal + transport;
    const gstAmt = Math.round(taxable * 0.18);
    const created = monthsAgo(faker.number.int({ min: 0, max: 14 }));
    const status = faker.helpers.weightedArrayElement([
      { value: 'DRAFT' as const, weight: 2 },
      { value: 'SENT' as const, weight: 4 },
      { value: 'UNDER_REVIEW' as const, weight: 2 },
      { value: 'NEGOTIATION' as const, weight: 2 },
      { value: 'WON' as const, weight: 3 },
      { value: 'LOST' as const, weight: 2 },
      { value: 'EXPIRED' as const, weight: 1 },
    ]);
    const total = taxable + gstAmt;
    proposals.push({
      id: `prop_${pad(i, 3)}`,
      number: `PROP/2026/${pad(i, 5)}`,
      customerId: customer.id,
      subject: `Supply of ${lineItems[0]?.description ?? 'petroleum products'}`,
      proposalDate: iso(created),
      validUntil: iso(
        new Date(created.getTime() + 30 * 86_400_000),
      ),
      status,
      state: customer.state,
      city: customer.city,
      items: lineItems,
      subtotal,
      cgst: intra ? Math.round(gstAmt / 2) : 0,
      sgst: intra ? Math.round(gstAmt / 2) : 0,
      igst: intra ? 0 : gstAmt,
      transportCharge: transport,
      total,
      terms: 'Payment within agreed credit period. Rates valid for 30 days.',
      createdById: userId(),
      approvedById: total > 1000000 && chance(0.6) ? 'user_02' : undefined,
      needsApproval: total > 1000000,
      wonAt: status === 'WON' ? iso(faker.date.between({ from: created, to: now })) : undefined,
      lostAt: status === 'LOST' ? iso(faker.date.between({ from: created, to: now })) : undefined,
      lostReason: status === 'LOST' ? pick(LOST_REASONS) : undefined,
      createdAt: iso(created),
    });
  }

  // -------- Orders / Invoices / Payments --------------------------------
  const orders: SalesOrder[] = [];
  const wonProposals = proposals.filter((p) => p.status === 'WON');
  wonProposals.forEach((p, idx) => {
    const taxTotal = p.cgst + p.sgst + p.igst;
    orders.push({
      id: `ord_${pad(idx + 1, 3)}`,
      number: `SO/2026/${pad(idx + 1, 5)}`,
      customerId: p.customerId ?? pick(customers).id,
      proposalId: p.id,
      orderDate: p.wonAt ?? p.proposalDate,
      status: faker.helpers.arrayElement([
        'CONFIRMED',
        'PROCESSING',
        'PARTIALLY_DISPATCHED',
        'DISPATCHED',
        'DELIVERED',
      ]),
      items: p.items,
      subtotal: p.subtotal,
      taxTotal,
      total: p.total,
      createdById: p.createdById,
      createdAt: p.wonAt ?? p.proposalDate,
    });
  });

  const invoices: Invoice[] = [];
  for (let i = 1; i <= 110; i += 1) {
    const order = orders[i % orders.length];
    const customer = customers.find((c) => c.id === order?.customerId) ?? pick(customers);
    const lineItems = order?.items ?? buildLineItems();
    const subtotal = lineItems.reduce((s, li) => s + li.amount, 0);
    const intra = customer.state === COMPANY_STATE;
    const transport = faker.helpers.arrayElement([0, 12000, 25000, 48000]);
    const gstAmt = Math.round((subtotal + transport) * 0.18);
    const total = subtotal + transport + gstAmt;
    const invDate = monthsAgo(faker.number.int({ min: 0, max: 12 }));
    const dueDate = new Date(
      invDate.getTime() + customer.paymentTermsDays * 86_400_000,
    );
    const overdue = dueDate.getTime() < now.getTime();
    const paid = faker.helpers.weightedArrayElement([
      { value: 'full' as const, weight: 5 },
      { value: 'partial' as const, weight: 2 },
      { value: 'none' as const, weight: 3 },
    ]);
    let status: Invoice['status'];
    let amountPaid: number;
    if (paid === 'full') {
      status = 'PAID';
      amountPaid = total;
    } else if (paid === 'partial') {
      status = 'PARTIAL';
      amountPaid = Math.round(total * faker.number.float({ min: 0.2, max: 0.7 }));
    } else {
      status = overdue ? 'OVERDUE' : 'UNPAID';
      amountPaid = 0;
    }
    invoices.push({
      id: `inv_${pad(i, 3)}`,
      number: `INV/2026/${pad(i, 5)}`,
      customerId: customer.id,
      orderId: order?.id,
      invoiceDate: iso(invDate),
      dueDate: iso(dueDate),
      status,
      items: lineItems,
      subtotal,
      cgst: intra ? Math.round(gstAmt / 2) : 0,
      sgst: intra ? Math.round(gstAmt / 2) : 0,
      igst: intra ? 0 : gstAmt,
      transportCharge: transport,
      total,
      amountPaid,
      paidAt: status === 'PAID' ? iso(faker.date.between({ from: invDate, to: now })) : undefined,
      createdById: userId(),
      createdAt: iso(invDate),
    });
  }

  const payments: Payment[] = [];
  let paySeq = 1;
  for (const inv of invoices) {
    if (inv.amountPaid > 0) {
      payments.push({
        id: `pay_${pad(paySeq, 3)}`,
        number: `RCPT/2026/${pad(paySeq, 5)}`,
        invoiceId: inv.id,
        customerId: inv.customerId,
        amount: inv.amountPaid,
        mode: faker.helpers.arrayElement(['NEFT', 'RTGS', 'CHEQUE', 'UPI', 'CASH']),
        reference: faker.string.alphanumeric({ length: 12, casing: 'upper' }),
        paidAt: inv.paidAt ?? iso(faker.date.between({ from: inv.invoiceDate, to: now })),
        createdAt: inv.paidAt ?? inv.invoiceDate,
      });
      paySeq += 1;
    }
  }

  // -------- Dispatches ---------------------------------------------------
  const dispatches: Dispatch[] = [];
  const transitLandmarks = [
    'Crossed Surat toll plaza',
    'At Vapi check-post',
    'Near Bharuch bypass',
    'Reached Ankleshwar GIDC',
    'On NH-48 near Vadodara',
    'Approaching Mundra port',
    'At Kim weighbridge',
  ];
  for (let i = 1; i <= 210; i += 1) {
    const customer = pick(customers);
    const item = pick(items);
    const route = pick(routes);
    const status = faker.helpers.weightedArrayElement([
      { value: 'SCHEDULED' as const, weight: 3 },
      { value: 'LOADING' as const, weight: 2 },
      { value: 'IN_TRANSIT' as const, weight: 3 },
      { value: 'DELIVERED' as const, weight: 6 },
      { value: 'RETURNED' as const, weight: 1 },
      { value: 'CANCELLED' as const, weight: 1 },
    ]);
    const scheduled = monthsAgo(faker.number.int({ min: 0, max: 8 }));
    dispatches.push({
      id: `disp_${pad(i, 3)}`,
      number: `DSP/2026/${pad(i, 5)}`,
      customerId: customer.id,
      itemId: item.id,
      quantity: faker.number.int({ min: 5, max: 48 }),
      unit: item.unit,
      vehicleNo: pick(vehicles).registrationNo,
      driverName: pick(drivers).name,
      driverPhone: phone(),
      routeId: route.id,
      status,
      currentLocation:
        status === 'IN_TRANSIT' ? pick(transitLandmarks) : undefined,
      scheduledAt: iso(scheduled),
      loadedAt:
        status !== 'SCHEDULED' && status !== 'CANCELLED'
          ? iso(new Date(scheduled.getTime() + 3 * 3600_000))
          : undefined,
      dispatchedAt:
        status === 'IN_TRANSIT' || status === 'DELIVERED'
          ? iso(new Date(scheduled.getTime() + 6 * 3600_000))
          : undefined,
      deliveredAt:
        status === 'DELIVERED'
          ? iso(new Date(scheduled.getTime() + 30 * 3600_000))
          : undefined,
    });
  }

  // -------- Inventory ----------------------------------------------------
  const inventory: InventoryRecord[] = [];
  let invSeq = 1;
  for (const item of items) {
    const whCount = faker.number.int({ min: 1, max: 2 });
    for (const wh of faker.helpers.arrayElements(WAREHOUSES, whCount)) {
      inventory.push({
        id: `invrec_${pad(invSeq, 3)}`,
        itemId: item.id,
        warehouse: wh,
        quantity: faker.number.int({ min: 0, max: 40000 }),
        reorderLevel: faker.number.int({ min: 2000, max: 8000 }),
        updatedAt: iso(monthsAgo(faker.number.float({ min: 0, max: 2 }))),
      });
      invSeq += 1;
    }
  }

  // -------- Tasks --------------------------------------------------------
  const tasks: Task[] = [];
  for (let i = 1; i <= 310; i += 1) {
    const status = faker.helpers.weightedArrayElement([
      { value: 'NOT_STARTED' as const, weight: 4 },
      { value: 'IN_PROGRESS' as const, weight: 3 },
      { value: 'COMPLETED' as const, weight: 4 },
      { value: 'CANCELLED' as const, weight: 1 },
    ]);
    const created = monthsAgo(faker.number.int({ min: 0, max: 5 }));
    const relType = faker.helpers.arrayElement([
      'lead',
      'customer',
      'proposal',
    ] as const);
    const relId =
      relType === 'lead'
        ? pick(leads).id
        : relType === 'customer'
          ? pick(customers).id
          : pick(proposals).id;
    tasks.push({
      id: `task_${pad(i, 3)}`,
      title: pick(TASK_TITLES),
      description: chance(0.4)
        ? 'Coordinate with customer and update CRM with outcome.'
        : undefined,
      status,
      priority: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
      type: faker.helpers.arrayElement([
        'CALL',
        'MEETING',
        'FOLLOW_UP',
        'EMAIL',
        'OTHER',
      ]),
      assignedToId: userId(),
      relatedType: relType,
      relatedId: relId,
      startDate: iso(created),
      dueDate: iso(faker.date.soon({ days: 30, refDate: created })),
      completedAt:
        status === 'COMPLETED'
          ? iso(faker.date.between({ from: created, to: now }))
          : undefined,
      createdById: userId(),
      createdAt: iso(created),
    });
  }

  // -------- Activities ---------------------------------------------------
  const activities: Activity[] = [];
  const activityTemplates: { type: Activity['type']; title: string }[] = [
    { type: 'CALL', title: 'Outbound call — discussed requirement' },
    { type: 'CALL', title: 'Missed call — auto-logged' },
    { type: 'EMAIL', title: 'Sent product catalogue via email' },
    { type: 'WHATSAPP', title: 'Shared quote via WhatsApp Business' },
    { type: 'MEETING', title: 'Site visit completed' },
    { type: 'NOTE', title: 'Internal note added' },
    { type: 'STATUS_CHANGE', title: 'Status updated' },
    { type: 'PROPOSAL', title: 'Proposal generated and sent' },
  ];
  for (let i = 1; i <= 520; i += 1) {
    const tpl = pick(activityTemplates);
    const useLead = chance(0.6);
    const entity = useLead ? pick(leads) : pick(customers);
    activities.push({
      id: `act_${pad(i, 3)}`,
      type: tpl.type,
      title: tpl.title,
      description: chance(0.5)
        ? faker.helpers.arrayElement([
            'Customer requested revised pricing for bulk order.',
            'Followed up regarding pending payment.',
            'Discussed tanker availability for next week.',
            'Customer satisfied with last delivery.',
            'Awaiting confirmation on GST details.',
          ])
        : undefined,
      entityType: useLead ? 'lead' : 'customer',
      entityId: entity.id,
      userId: userId(),
      createdAt: iso(monthsAgo(faker.number.float({ min: 0, max: 12 }))),
    });
  }

  // -------- Chat ---------------------------------------------------------
  const channels: ChatChannel[] = [
    { id: 'ch_general', name: 'General', type: 'GROUP', memberIds: users.map((u) => u.id) },
    { id: 'ch_sales', name: 'Sales Team', type: 'GROUP', memberIds: salesUsers.map((u) => u.id) },
    { id: 'ch_dispatch', name: 'Dispatch Desk', type: 'GROUP', memberIds: users.slice(0, 8).map((u) => u.id) },
    { id: 'ch_accounts', name: 'Accounts', type: 'GROUP', memberIds: ['user_01', 'user_04'] },
    { id: 'ch_dm_02', name: 'Anil Deshmukh', type: 'DM', memberIds: ['user_01', 'user_02'] },
    { id: 'ch_dm_03', name: 'Priya Sharma', type: 'DM', memberIds: ['user_01', 'user_03'] },
    { id: 'ch_dm_04', name: 'Kavita Iyer', type: 'DM', memberIds: ['user_01', 'user_04'] },
  ];
  const messages: Message[] = [];
  const chatLines = [
    'Has the tanker for Patel Industries been dispatched?',
    'Yes, it crossed Surat toll an hour ago.',
    'Please share the updated rate list for HDPE.',
    'Customer wants 45 days credit — can we approve?',
    'Proposal PROP/2026/00045 sent. Awaiting confirmation.',
    'Payment received from Shree Krishna Petroleum.',
    'Need 2 more tankers for tomorrow morning loading.',
    'Updated the GST details for the new customer.',
    'Great work closing the Annapurna deal!',
    'Can you check the outstanding for Maruti Transport?',
  ];
  let msgSeq = 1;
  for (const ch of channels) {
    const count = faker.number.int({ min: 8, max: 22 });
    for (let m = 0; m < count; m += 1) {
      messages.push({
        id: `msg_${pad(msgSeq, 4)}`,
        channelId: ch.id,
        senderId: pick(ch.memberIds),
        body: pick(chatLines),
        createdAt: iso(monthsAgo(faker.number.float({ min: 0, max: 1.5 }))),
        delivered: true,
      });
      msgSeq += 1;
    }
  }
  messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // -------- Emails -------------------------------------------------------
  const emails: EmailRecord[] = [];
  for (let i = 1; i <= 24; i += 1) {
    const created = monthsAgo(faker.number.float({ min: 0, max: 6 }));
    emails.push({
      id: `email_${pad(i, 3)}`,
      to: faker.internet.email().toLowerCase(),
      subject: faker.helpers.arrayElement([
        'Quotation for petroleum products',
        'Revised rates — bulk diesel supply',
        'Invoice copy attached',
        'Payment reminder',
        'Thank you for your order',
      ]),
      body: 'Dear Customer,\n\nPlease find the requested details. Feel free to reach out for any clarification.\n\nRegards,\nOilGas CRM Sales Team',
      sentAt: iso(created),
      folder: 'SENT',
    });
  }

  // -------- Call logs ----------------------------------------------------
  const callLogs: CallLog[] = [];
  for (let i = 1; i <= 80; i += 1) {
    callLogs.push({
      id: `call_${pad(i, 3)}`,
      contactName: personName(),
      phone: phone(),
      direction: faker.helpers.arrayElement(['INBOUND', 'OUTBOUND', 'MISSED']),
      durationSec: faker.number.int({ min: 0, max: 1200 }),
      outcome: faker.helpers.arrayElement([
        'Discussed requirement',
        'Will call back',
        'Not reachable',
        'Order confirmed',
        'Requested quotation',
      ]),
      userId: userId(),
      relatedType: 'lead',
      relatedId: pick(leads).id,
      loggedAt: iso(monthsAgo(faker.number.float({ min: 0, max: 4 }))),
    });
  }

  // -------- Notifications ------------------------------------------------
  const notifications: AppNotification[] = [];
  const overdueInvoices = invoices.filter((inv) => inv.status === 'OVERDUE');
  const notifSeed: { kind: AppNotification['kind']; title: string; body: string; link: string }[] = [
    { kind: 'INVOICE', title: 'Invoice overdue', body: `${overdueInvoices[0]?.number ?? 'INV/2026/00089'} is overdue. Please follow up for collection.`, link: '/invoices' },
    { kind: 'LEAD', title: 'New lead assigned', body: 'A new website enquiry has been assigned to you.', link: '/leads' },
    { kind: 'PROPOSAL', title: 'Proposal needs approval', body: 'A proposal above ₹10,00,000 is pending manager approval.', link: '/proposals' },
    { kind: 'DISPATCH', title: 'Tanker in transit', body: 'DSP/2026/00112 crossed Surat toll plaza.', link: '/dispatch' },
    { kind: 'TASK', title: 'Task due today', body: 'You have 3 follow-up tasks scheduled for today.', link: '/tasks' },
    { kind: 'PROPOSAL', title: 'Proposal won', body: 'Congratulations! A proposal was marked as Won.', link: '/proposals' },
    { kind: 'INVOICE', title: 'Payment received', body: 'Payment received against INV/2026/00041.', link: '/payments' },
    { kind: 'SYSTEM', title: 'Welcome to OilGas CRM', body: 'Explore the demo — your changes are saved in this browser.', link: '/' },
    { kind: 'LEAD', title: 'Lead going cold', body: 'A hot lead has had no activity for 7 days.', link: '/leads' },
    { kind: 'DISPATCH', title: 'Delivery completed', body: 'DSP/2026/00098 was delivered successfully.', link: '/dispatch' },
  ];
  notifSeed.forEach((n, i) => {
    notifications.push({
      id: `notif_${pad(i + 1, 3)}`,
      kind: n.kind,
      title: n.title,
      body: n.body,
      read: i > 5,
      link: n.link,
      createdAt: iso(monthsAgo(faker.number.float({ min: 0, max: 1 }))),
    });
  });

  // -------- Documents ----------------------------------------------------
  const documents: CrmDocument[] = [];
  for (let i = 1; i <= 64; i += 1) {
    const customer = pick(customers);
    documents.push({
      id: `doc_${pad(i, 3)}`,
      name: faker.helpers.arrayElement([
        'Purchase Order.pdf',
        'GST Certificate.pdf',
        'Supply Agreement.pdf',
        'KYC Documents.pdf',
        'Bank Details.pdf',
        'Rate Contract.pdf',
      ]),
      category: faker.helpers.arrayElement(['PO', 'AGREEMENT', 'KYC', 'INVOICE', 'OTHER']),
      entityType: 'customer',
      entityId: customer.id,
      sizeKb: faker.number.int({ min: 60, max: 4200 }),
      uploadedById: userId(),
      uploadedAt: iso(monthsAgo(faker.number.float({ min: 0, max: 10 }))),
    });
  }

  // -------- Audit log ----------------------------------------------------
  const auditLog: AuditLogEntry[] = [];
  for (let i = 1; i <= 90; i += 1) {
    auditLog.push({
      id: `audit_${pad(i, 3)}`,
      userId: pick(users).id,
      action: faker.helpers.arrayElement(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT']),
      entity: faker.helpers.arrayElement(['Lead', 'Customer', 'Proposal', 'Invoice', 'Item', 'Task']),
      entityId: faker.string.alphanumeric(8),
      detail: faker.helpers.arrayElement([
        'Record created',
        'Status changed',
        'Field updated',
        'Logged in to CRM',
        'Exported list to Excel',
      ]),
      createdAt: iso(monthsAgo(faker.number.float({ min: 0, max: 6 }))),
    });
  }
  auditLog.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // -------- Definitions & company ---------------------------------------
  const definitions: Definitions = {
    leadStatuses: [
      { id: 'def_t1', label: 'Hot', colorKey: 'hot', active: true },
      { id: 'def_t2', label: 'Warm', colorKey: 'warm', active: true },
      { id: 'def_t3', label: 'Cold', colorKey: 'cold', active: true },
      { id: 'def_t4', label: 'Follow-up', colorKey: 'followup', active: true },
      { id: 'def_t5', label: 'Irrelevant', colorKey: 'neutral', active: true },
      { id: 'def_t6', label: 'Other', colorKey: 'neutral', active: true },
    ],
    lostReasons: LOST_REASONS.map((r, i) => ({
      id: `def_lr${i + 1}`,
      label: r,
      active: true,
    })),
    industries: INDUSTRIES.map((r, i) => ({
      id: `def_in${i + 1}`,
      label: r,
      active: true,
    })),
    leadSources: [
      'Website', 'Referral', 'Cold Call', 'Trade Show', 'IndiaMART',
      'JustDial', 'WhatsApp', 'Walk-in', 'Other',
    ].map((r, i) => ({ id: `def_ls${i + 1}`, label: r, active: true })),
  };

  const company: CompanySettings = {
    name: 'OilGas CRM',
    legalName: 'Bharat Petrochem Trading Pvt Ltd',
    gstin: '24AABCB1234L1Z9',
    pan: 'AABCB1234L',
    email: 'sales@oilgas.in',
    phone: '+91 98250 10000',
    website: 'www.oilgascrm.in',
    address: {
      line1: 'Plot 42, Hazira Industrial Estate',
      line2: 'GIDC Phase II',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '394270',
    },
    bankName: 'HDFC Bank',
    bankAccount: '50200012345678',
    bankIfsc: 'HDFC0001234',
    invoicePrefix: 'INV/2026/',
    proposalPrefix: 'PROP/2026/',
    terms:
      '1. Payment within agreed credit period.\n2. Rates inclusive of applicable GST.\n3. Delivery subject to tanker availability.\n4. Disputes subject to Surat jurisdiction.',
  };

  return {
    users,
    leads,
    customers,
    items,
    proposals,
    orders,
    invoices,
    payments,
    routes,
    dispatches,
    vehicles,
    drivers,
    inventory,
    tasks,
    activities,
    messages,
    channels,
    emails,
    callLogs,
    notifications,
    documents,
    auditLog,
    definitions,
    company,
  };
}
