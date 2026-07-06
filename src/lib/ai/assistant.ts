// ---------------------------------------------------------------------------
// CRM AI Assistant — a grounded, role-aware engine that answers from real CRM
// data (no hallucinated records). Exposed via the async `AiEngine` interface so
// a hosted LLM (through a backend) can be dropped in later without UI changes.
// ---------------------------------------------------------------------------
import type {
  Role, Customer, Invoice, Dispatch, SalesOrder, Payment, AppNotification, Item,
} from '@/types';
import type { LiveTicker } from '@/hooks/useLiveMarket';
import { computeErp } from '@/lib/erp';
import { formatINR, formatDate, formatQty } from '@/lib/format';
import { formatMarket } from '@/lib/market';

export type AiBlock =
  | { kind: 'text'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'table'; columns: string[]; rows: string[][] };

export interface AiAction {
  label: string;
  to: string;
}

export interface AiReply {
  blocks: AiBlock[];
  action?: AiAction;
}

export interface AiContext {
  role: Role;
  userName: string;
  me?: Customer;
  customers: Customer[];
  invoices: Invoice[];
  dispatches: Dispatch[];
  orders: SalesOrder[];
  payments: Payment[];
  notifications: AppNotification[];
  items: Item[];
  oil: LiveTicker[];
  fuel: LiveTicker[];
  canErp: boolean;
}

export interface AiEngine {
  ask(query: string, ctx: AiContext): Promise<AiReply>;
}

const text = (t: string): AiBlock => ({ kind: 'text', text: t });

function route(role: Role, key: string): string | undefined {
  const c = role === 'CUSTOMER';
  const map: Record<string, string | undefined> = {
    invoices: c ? '/portal/invoices' : '/invoices',
    payments: c ? '/portal/payments' : '/payments',
    tracking: c ? '/portal/products' : '/dispatch',
    orders: c ? '/portal/orders?status=active' : '/orders',
    dashboard: c ? '/portal' : '/',
    notifications: c ? '/portal/notifications' : '/notifications',
    documents: c ? '/portal/documents' : undefined,
    market: c ? '/portal/market' : undefined,
    calculator: '/erp-calculator',
    support: c ? '/portal/support' : '/help',
    history: c ? '/portal/history' : '/reports/sales',
    customers: c ? undefined : '/customers',
  };
  return map[key];
}

// -------- intent handlers --------------------------------------------------
function prices(s: string, ctx: AiContext): AiReply {
  const all = [...ctx.oil, ...ctx.fuel];
  const wants = (names: string[]) => names.some((n) => s.includes(n));
  let picked = all;
  if (wants(['brent'])) picked = all.filter((t) => /brent/i.test(t.name));
  else if (wants(['wti'])) picked = all.filter((t) => /wti/i.test(t.name));
  else if (wants(['diesel'])) picked = all.filter((t) => /diesel/i.test(t.name));
  else if (wants(['petrol'])) picked = all.filter((t) => /petrol/i.test(t.name));
  else if (wants(['lpg'])) picked = all.filter((t) => /lpg/i.test(t.name));
  else if (wants(['atf', 'jet', 'aviation'])) picked = all.filter((t) => /atf|jet/i.test(t.name));
  else if (wants(['natural gas', 'gas'])) picked = all.filter((t) => /natural gas/i.test(t.name));
  else if (wants(['cng'])) picked = all.filter((t) => /cng/i.test(t.name));
  else if (wants(['fuel'])) picked = ctx.fuel;
  else if (wants(['oil', 'crude', 'benchmark'])) picked = ctx.oil;

  if (picked.length === 0) picked = all;
  const rows = picked.map((t) => [
    t.name,
    formatMarket(t),
    `${t.change >= 0 ? '▲' : '▼'} ${Math.abs(t.change).toFixed(2)}%`,
    new Date(t.lastUpdated).toLocaleTimeString(),
  ]);
  const reply: AiReply = {
    blocks: [
      text(`Here are the latest ${picked.length === 1 ? 'price' : 'prices'} (auto-refreshing indicative feed):`),
      { kind: 'table', columns: ['Product', 'Price', 'Change', 'Updated'], rows },
    ],
  };
  const to = route(ctx.role, 'market');
  if (to) reply.action = { label: 'Open Live Market', to };
  return reply;
}

function invoices(s: string, ctx: AiContext): AiReply {
  let list = ctx.invoices;
  let scope = 'all';
  if (/overdue/.test(s)) { list = list.filter((i) => i.status === 'OVERDUE'); scope = 'overdue'; }
  else if (/pending|unpaid|due|outstanding/.test(s)) { list = list.filter((i) => i.status !== 'PAID'); scope = 'pending'; }
  else if (/paid/.test(s)) { list = list.filter((i) => i.status === 'PAID'); scope = 'paid'; }
  list = [...list].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));

  if (list.length === 0) return { blocks: [text(`You have no ${scope === 'all' ? '' : scope + ' '}invoices.`)] };

  const total = list.reduce((n, i) => n + i.total, 0);
  const rows = list.slice(0, 10).map((i) => [i.number, formatDate(i.invoiceDate), formatINR(i.total), i.status]);
  const reply: AiReply = {
    blocks: [
      text(`Found **${list.length}** ${scope === 'all' ? '' : scope + ' '}invoice${list.length === 1 ? '' : 's'} totalling **${formatINR(total)}**.`),
      { kind: 'table', columns: ['Invoice', 'Date', 'Amount', 'Status'], rows },
    ],
  };
  const to = route(ctx.role, 'invoices');
  if (to) reply.action = { label: 'Open Invoices', to };
  return reply;
}

function payments(s: string, ctx: AiContext): AiReply {
  if (/received|this month|collected/.test(s)) {
    const month = new Date().toISOString().slice(0, 7);
    const rec = ctx.payments.filter((p) => p.paidAt.slice(0, 7) === month);
    const sum = rec.reduce((n, p) => n + p.amount, 0);
    return { blocks: [text(`**${rec.length}** payment${rec.length === 1 ? '' : 's'} received this month, totalling **${formatINR(sum)}**.`)] };
  }
  const outstanding = ctx.invoices.filter((i) => i.status !== 'PAID').reduce((n, i) => n + (i.total - i.amountPaid), 0);
  const overdue = ctx.invoices.filter((i) => i.status === 'OVERDUE').length;
  const reply: AiReply = {
    blocks: [
      text(`Your total outstanding balance is **${formatINR(outstanding)}** across **${ctx.invoices.filter((i) => i.status !== 'PAID').length}** unpaid invoice(s)${overdue ? `, of which **${overdue}** are overdue` : ''}.`),
    ],
  };
  const to = route(ctx.role, 'payments');
  if (to) reply.action = { label: 'Open Payments', to };
  return reply;
}

function orders(s: string, ctx: AiContext): AiReply {
  let list = ctx.dispatches;
  let label = 'shipment';
  if (/transit|on the way/.test(s)) { list = list.filter((d) => d.status === 'IN_TRANSIT' || d.status === 'LOADING'); label = 'in-transit shipment'; }
  else if (/delivered|completed/.test(s)) { list = list.filter((d) => d.status === 'DELIVERED'); label = 'delivered shipment'; }
  else if (/today|this week|arriv|upcoming|scheduled/.test(s)) { list = list.filter((d) => d.status === 'SCHEDULED' || d.status === 'LOADING' || d.status === 'IN_TRANSIT'); label = 'upcoming shipment'; }
  list = [...list].sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

  const itemName = new Map(ctx.items.map((i) => [i.id, i.name]));
  if (list.length === 0) return { blocks: [text(`No ${label}s found.`)] };
  const rows = list.slice(0, 10).map((d) => [d.number, itemName.get(d.itemId) ?? '—', d.status, formatDate(d.scheduledAt)]);
  const reply: AiReply = {
    blocks: [
      text(`Found **${list.length}** ${label}${list.length === 1 ? '' : 's'}.`),
      { kind: 'table', columns: ['Dispatch', 'Product', 'Status', 'Scheduled'], rows },
    ],
  };
  const to = route(ctx.role, 'tracking');
  if (to) reply.action = { label: 'Open Product Tracking', to };
  return reply;
}

function customers(s: string, ctx: AiContext): AiReply {
  if (ctx.role === 'CUSTOMER') {
    const me = ctx.me;
    return {
      blocks: [
        text(`You're signed in for **${me?.companyName ?? 'your account'}**. For privacy, the assistant only shows your own orders, invoices, payments and documents.`),
      ],
    };
  }
  if (/how many|count|total/.test(s)) {
    const active = ctx.customers.filter((c) => c.active).length;
    return { blocks: [text(`There are **${ctx.customers.length}** customers (**${active}** active).`)] };
  }
  const list = ctx.customers.filter((c) => c.active).slice(0, 10);
  const rows = list.map((c) => [c.companyName, c.segment, formatINR(c.outstanding)]);
  const reply: AiReply = {
    blocks: [
      text(`Showing **${list.length}** of **${ctx.customers.length}** customers:`),
      { kind: 'table', columns: ['Company', 'Segment', 'Outstanding'], rows },
    ],
  };
  const to = route(ctx.role, 'customers');
  if (to) reply.action = { label: 'Open Customers', to };
  return reply;
}

function notifications(ctx: AiContext): AiReply {
  const unread = ctx.notifications.filter((n) => !n.read);
  if (unread.length === 0) return { blocks: [text('You have no unread notifications. 🎉')] };
  const reply: AiReply = {
    blocks: [
      text(`You have **${unread.length}** unread notification${unread.length === 1 ? '' : 's'}:`),
      { kind: 'list', items: unread.slice(0, 6).map((n) => n.title) },
    ],
  };
  const to = route(ctx.role, 'notifications');
  if (to) reply.action = { label: 'Open Notifications', to };
  return reply;
}

function erp(s: string, ctx: AiContext): AiReply {
  if (!ctx.canErp) {
    return { blocks: [text('The ERP cost calculator is an internal tool and isn\'t available on your account.')] };
  }
  const nums = (s.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  if (nums.length >= 3 && nums.length % 3 === 0) {
    const tanks = [];
    for (let i = 0; i < nums.length; i += 3) {
      tanks.push({ price: nums[i] ?? 0, density: nums[i + 1] ?? 0, litre: nums[i + 2] ?? 0 });
    }
    const r = computeErp(tanks);
    const rows = tanks.map((t, i) => [
      `Tank ${i + 1}`,
      String(t.price),
      String(t.density),
      String(t.litre),
      (r.perTank[i]?.kg ?? 0).toFixed(2),
    ]);
    return {
      blocks: [
        text(`I read **${tanks.length}** tank(s) as (price, density, litre). Here's the costing:`),
        { kind: 'table', columns: ['Tank', 'Price', 'Density', 'Litre', 'Kg'], rows },
        {
          kind: 'list',
          items: [
            `Total Litre: **${r.totalLitre.toLocaleString('en-IN')} L**`,
            `Total Kg: **${r.totalKg.toFixed(2)} kg**`,
            `Average Density: **${r.avgDensity.toFixed(2)} g/L**`,
            `Average Price: **${r.avgPrice.toFixed(2)} /L**`,
            `Total Price: **${formatINR(r.totalPrice)}**`,
          ],
        },
      ],
      action: { label: 'Open ERP Calculator', to: '/erp-calculator' },
    };
  }
  return {
    blocks: [
      text('I can compute blended cost, weighted density and kg across tanks. Give me values as **price density litre** per tank, e.g. "calculate 50 800 1000, 60 850 500". Formulas: Kg = (Litre × Density) ÷ 1000, Avg Price = Total Price ÷ Total Litre, Avg Density = (Total Kg ÷ Total Litre) × 1000.'),
    ],
    action: { label: 'Open ERP Calculator', to: '/erp-calculator' },
  };
}

// -------- analytics -------------------------------------------------------

/** Resolve a natural-language time window to an inclusive ISO date range. */
function parsePeriod(s: string): { start: string; end: string; label: string } {
  const now = new Date();
  const y = now.getFullYear();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const yearRange = (yr: number, label?: string) => ({ start: `${yr}-01-01`, end: `${yr}-12-31`, label: label ?? `${yr}` });

  const explicitYear = s.match(/\b(20\d{2})\b/);
  if (explicitYear) return yearRange(Number(explicitYear[1]));

  if (/last year|previous year|prior year/.test(s)) return yearRange(y - 1, `last year (${y - 1})`);
  if (/this year|current year|year to date|\bytd\b/.test(s)) return { start: `${y}-01-01`, end: iso(now), label: `this year (${y})` };
  if (/last month|previous month/.test(s)) {
    const start = new Date(y, now.getMonth() - 1, 1);
    const end = new Date(y, now.getMonth(), 0);
    return { start: iso(start), end: iso(end), label: start.toLocaleString('en-US', { month: 'long', year: 'numeric' }) };
  }
  if (/this month|current month|\bmtd\b/.test(s)) {
    return { start: iso(new Date(y, now.getMonth(), 1)), end: iso(now), label: 'this month' };
  }
  if (/last quarter|previous quarter/.test(s)) {
    const startMonth = (Math.floor(now.getMonth() / 3) - 1) * 3;
    const start = new Date(y, startMonth, 1);
    const end = new Date(y, startMonth + 3, 0);
    return { start: iso(start), end: iso(end), label: 'last quarter' };
  }
  if (/last 12 months|trailing|past year|past 12 months/.test(s)) {
    const start = new Date(now);
    start.setFullYear(y - 1);
    return { start: iso(start), end: iso(now), label: 'last 12 months' };
  }
  return { start: '0000-01-01', end: '9999-12-31', label: 'all time' };
}

/** Map the phrasing to a specific product, product family, or nothing (all). */
function resolveSubject(s: string, ctx: AiContext): { ids: string[]; label: string } | null {
  const items = ctx.items;

  // Exact-ish product name match first (ignore any parenthetical).
  for (const it of items) {
    const base = it.name.toLowerCase().replace(/\(.*?\)/g, '').trim();
    if (base.length >= 4 && s.includes(base)) return { ids: [it.id], label: it.name };
  }

  // Then keyword families — specific fuels before the generic crude/oil bucket.
  const groups: [RegExp, (it: Item) => boolean, string][] = [
    [/\bhsd\b|diesel/, (it) => /diesel|hsd/i.test(it.name) || it.group === 'Diesel', 'Diesel (HSD)'],
    [/petrol|gasoline|motor spirit|\bms\b/, (it) => /petrol|motor spirit/i.test(it.name), 'Petrol (MS)'],
    [/furnace/, (it) => /furnace/i.test(it.name), 'Furnace Oil'],
    [/transformer/, (it) => /transformer/i.test(it.name), 'Transformer Oil'],
    [/\bldo\b|light diesel/, (it) => /ldo/i.test(it.name), 'LDO'],
    [/lubricant|lube|engine oil|gear oil|hydraulic|grease/, (it) => it.category === 'LUBRICANT', 'lubricants'],
    [/glycol|\bmeg\b|\bdeg\b|\bteg\b|propylene/, (it) => it.category === 'GLYCOL', 'glycols'],
    [/solvent|toluene|benzene|xylene|acetone|\bipa\b|\bmdc\b/, (it) => it.category === 'SOLVENT', 'solvents'],
    [/plastic|granule|hdpe|ldpe|\bpp\b|lldpe|polymer|polypropylene/, (it) => it.category === 'PLASTIC_GRANULE', 'plastic granules'],
    [/specialt|resin|\bwax\b|white oil|\bupr\b/, (it) => it.category === 'SPECIALTY', 'specialty chemicals'],
    [/crude|brent|wti|petroleum|\boil\b|fuel/, (it) => it.category === 'OIL_FUEL', 'oil & fuel products'],
  ];
  for (const [re, pred, label] of groups) {
    if (re.test(s)) {
      const ids = items.filter(pred).map((it) => it.id);
      if (ids.length) return { ids, label };
    }
  }
  return null;
}

function analyticalIntent(s: string): boolean {
  if (/(quantity|volume|litre|liter|kilolit|\bkl\b|\bsold\b|selling|revenue|turnover|\bsales\b|top (product|customer|selling)|best.?sell|most sold|highest selling|break ?down|analytic|trend)/.test(s)) return true;
  return /(last year|this year|last month|last quarter|year to date|\b20\d{2}\b)/.test(s)
    && /(sold|sell|quantity|volume|revenue|sales|product|crude|diesel|petrol|\boil\b|fuel|customer)/.test(s);
}

function analytics(s: string, ctx: AiContext): AiReply {
  const period = parsePeriod(s);
  const inPeriod = (d: string) => d >= period.start && d <= period.end;
  const invs = ctx.invoices.filter((i) => inPeriod(i.invoiceDate));
  const itemName = new Map(ctx.items.map((i) => [i.id, i.name]));
  const salesRoute = route(ctx.role, 'history') ?? '/reports/sales';

  // Top customers by revenue.
  if (ctx.role !== 'CUSTOMER' && /(top|best|biggest|largest|leading).{0,20}customer|customer.{0,20}(revenue|spend|buy|purchas)/.test(s)) {
    const byCust = new Map<string, number>();
    invs.forEach((i) => byCust.set(i.customerId, (byCust.get(i.customerId) ?? 0) + i.total));
    const cName = new Map(ctx.customers.map((c) => [c.id, c.companyName]));
    if (byCust.size === 0) return { blocks: [text(`No customer sales found for **${period.label}**.`)] };
    const rows = [...byCust.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, v]) => [cName.get(id) ?? '—', formatINR(v)]);
    return {
      blocks: [
        text(`Top customers by revenue — **${period.label}**:`),
        { kind: 'table', columns: ['Customer', 'Revenue'], rows },
      ],
      action: { label: 'Open Customers', to: route(ctx.role, 'customers') ?? salesRoute },
    };
  }

  const subject = resolveSubject(s, ctx);
  const ids = subject ? new Set(subject.ids) : null;
  const agg = new Map<string, { qtyKL: number; revenue: number; lines: number }>();
  const matchedInvoices = new Set<string>();
  let totalQtyKL = 0;
  let totalRevenue = 0;
  for (const inv of invs) {
    for (const li of inv.items) {
      if (ids && !ids.has(li.itemId)) continue;
      const qtyKL = li.unit === 'L' ? li.quantity / 1000 : li.quantity;
      const cur = agg.get(li.itemId) ?? { qtyKL: 0, revenue: 0, lines: 0 };
      cur.qtyKL += qtyKL;
      cur.revenue += li.amount;
      cur.lines += 1;
      agg.set(li.itemId, cur);
      totalQtyKL += qtyKL;
      totalRevenue += li.amount;
      matchedInvoices.add(inv.id);
    }
  }

  if (agg.size === 0) {
    return { blocks: [text(`I couldn't find any ${subject ? `**${subject.label}** ` : ''}sales for **${period.label}**.`)] };
  }

  const avgRate = totalQtyKL ? totalRevenue / totalQtyKL : 0;

  // A specific product / family → headline summary (+ breakdown if a family).
  if (subject) {
    const reply: AiReply = {
      blocks: [
        text(`**${subject.label}** — ${period.label}:`),
        {
          kind: 'list',
          items: [
            `Quantity sold: **${formatQty(totalQtyKL, 'KL')}**`,
            `Revenue (pre-tax): **${formatINR(totalRevenue)}**`,
            `Avg realised rate: **${formatINR(avgRate)} / KL**`,
            `Across **${matchedInvoices.size}** invoice(s)`,
          ],
        },
      ],
      action: { label: 'Open Sales Reports', to: salesRoute },
    };
    if (subject.ids.length > 1) {
      const rows = [...agg.entries()]
        .sort((a, b) => b[1].qtyKL - a[1].qtyKL)
        .slice(0, 10)
        .map(([id, v]) => [itemName.get(id) ?? '—', formatQty(v.qtyKL, 'KL'), formatINR(v.revenue)]);
      reply.blocks.push({ kind: 'table', columns: ['Product', 'Quantity', 'Revenue'], rows });
    }
    return reply;
  }

  // No subject → overall totals with a product ranking.
  const wantRevenue = /revenue|turnover|\bsales\b|value|worth|₹|rupee/.test(s) && !/quantity|volume|litre|\bkl\b/.test(s);
  const ranked = [...agg.entries()].map(([id, v]) => ({ name: itemName.get(id) ?? '—', ...v }));
  ranked.sort((a, b) => (wantRevenue ? b.revenue - a.revenue : b.qtyKL - a.qtyKL));
  const rows = ranked.slice(0, 10).map((r) => [r.name, formatQty(r.qtyKL, 'KL'), formatINR(r.revenue)]);
  return {
    blocks: [
      text(`Sales analytics for **${period.label}** — total volume **${formatQty(totalQtyKL, 'KL')}**, revenue **${formatINR(totalRevenue)}** across **${matchedInvoices.size}** invoice(s). ${wantRevenue ? 'Top products by revenue' : 'Top products by volume'}:`),
      { kind: 'table', columns: ['Product', 'Quantity', 'Revenue'], rows },
    ],
    action: { label: 'Open Sales Reports', to: salesRoute },
  };
}

function navigation(s: string, ctx: AiContext): AiReply | null {
  if (!/\b(open|go to|take me to|navigate|show me the|show the)\b/.test(s)) return null;
  const targets: [RegExp, string, string][] = [
    [/invoice|bill/, 'invoices', 'Invoices'],
    [/payment/, 'payments', 'Payments'],
    [/track|dispatch|shipment|deliver/, 'tracking', 'Product Tracking'],
    [/order/, 'orders', 'Orders'],
    [/notification|alert/, 'notifications', 'Notifications'],
    [/document|invoice pdf|paperwork/, 'documents', 'Documents'],
    [/market|price|oil|fuel/, 'market', 'Live Market'],
    [/calculat|erp/, 'calculator', 'ERP Calculator'],
    [/support|help|ticket/, 'support', 'Support'],
    [/dashboard|home/, 'dashboard', 'Dashboard'],
    [/history|report/, 'history', 'History'],
    [/customer|client/, 'customers', 'Customers'],
  ];
  for (const [re, key, label] of targets) {
    if (re.test(s)) {
      const to = route(ctx.role, key);
      if (!to) continue;
      return { blocks: [text(`Opening **${label}** for you.`)], action: { label: `Go to ${label}`, to } };
    }
  }
  return null;
}

function capabilities(ctx: AiContext): AiReply {
  return {
    blocks: [
      text(`Hi ${ctx.userName?.split(' ')[0] ?? 'there'} 👋 I'm your CRM assistant. I can help with:`),
      {
        kind: 'list',
        items: [
          'Sales analytics — "how much diesel did we sell last year?"',
          'Orders & shipments — "what\'s in transit?"',
          'Invoices — "show pending invoices"',
          'Payments — "how much is outstanding?"',
          'Live prices — "today\'s Brent crude price"',
          ...(ctx.canErp ? ['ERP costing — "calculate 50 800 1000, 60 850 500"'] : []),
          'Navigation — "open my invoices"',
        ],
      },
      text('Everything I show respects your role and permissions.'),
    ],
  };
}

export function runAssistant(query: string, ctx: AiContext): AiReply {
  const s = query.toLowerCase().trim();
  if (!s || /^(hi|hello|hey|help|what can you do)\b/.test(s)) return capabilities(ctx);

  const nav = navigation(s, ctx);
  if (nav) return nav;

  // Analytical questions ("how much diesel did we sell last year?") take
  // precedence over the live-price handler, which shares product keywords.
  if (analyticalIntent(s)) return analytics(s, ctx);

  if (/(price|prices|brent|wti|crude|diesel|petrol|lpg|atf|jet|aviation|natural gas|cng|fuel|market)/.test(s)) return prices(s, ctx);
  if (/(calculat|weighted|avg density|average density|total litre|total kg|kilogram|blend|mix|\berp\b)/.test(s)) return erp(s, ctx);
  if (/invoice|bill/.test(s)) return invoices(s, ctx);
  if (/payment|outstanding|balance|owe|receivable|\bpaid\b/.test(s)) return payments(s, ctx);
  if (/order|dispatch|transit|deliver|tracking|shipment|arriv/.test(s)) return orders(s, ctx);
  if (/customer|client|active account/.test(s)) return customers(s, ctx);
  if (/notification|alert|announce/.test(s)) return notifications(ctx);

  return {
    blocks: [
      text("I'm not sure about that one yet, but I can help with orders, invoices, payments, live prices, and navigation. Try one of the suggested prompts, or ask me something like \"show pending invoices\"."),
    ],
  };
}

/** Current engine: grounded rules over real CRM data. Swap for an LLM-backed
 *  engine later by implementing `AiEngine.ask` against a backend. */
export const ruleEngine: AiEngine = {
  ask: async (query, ctx) => runAssistant(query, ctx),
};

export function suggestedPrompts(role: Role): string[] {
  switch (role) {
    case 'CUSTOMER':
      return ['How much did I buy last year?', 'Track my latest order', 'Show my outstanding payments', 'Show my pending invoices', "Today's Brent crude price"];
    case 'ACCOUNTS':
      return ['Revenue this year', 'Show overdue invoices', 'How much is outstanding?', 'Payments received this month'];
    case 'SALES_MANAGER':
      return ['How much diesel did we sell last year?', 'Top products this year', 'Top customers by revenue', 'Shipments in transit'];
    case 'SALES_EXECUTIVE':
      return ['Top products this year', 'How much petrol did we sell last month?', 'Show my customers', 'Shipments in transit'];
    default:
      return ['How much oil did we sell last year?', 'Top products this year', 'Top customers by revenue', 'Show overdue invoices', 'Calculate 50 800 1000, 60 850 500'];
  }
}
