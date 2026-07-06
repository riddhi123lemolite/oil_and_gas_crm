// ---------------------------------------------------------------------------
// CRM AI Assistant — a grounded, role-aware engine that answers from real CRM
// data (no hallucinated records). Exposed via the async `AiEngine` interface so
// a hosted LLM (through a backend) can be dropped in later without UI changes.
//
// Design goals (in priority order):
//   1. Understand intent before formatting.
//   2. Retrieve the right CRM data (never guess / fabricate).
//   3. Answer concisely by default — one to three sentences.
//   4. Use tables ONLY for analytics / reports / comparisons / trends, or when
//      explicitly asked. Otherwise stay conversational.
//   5. Keep conversational context ("what about diesel?").
// ---------------------------------------------------------------------------
import type {
  Role, Customer, Invoice, Dispatch, SalesOrder, Payment, AppNotification, Item,
} from '@/types';
import type { LiveTicker } from '@/hooks/useLiveMarket';
import { computeErp } from '@/lib/erp';
import { formatINR, formatDate, formatQty, formatNumber } from '@/lib/format';
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
  /** Previous user message — used to resolve follow-ups like "what about diesel?" */
  previousQuery?: string;
}

export interface AiEngine {
  ask(query: string, ctx: AiContext): Promise<AiReply>;
}

const text = (t: string): AiBlock => ({ kind: 'text', text: t });
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

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

// ===========================================================================
// Shared vocabulary
// ===========================================================================

/** Words that switch the assistant into detailed / analytical (tabular) mode. */
const DETAIL_RE = /\b(analytic|analysis|report|dashboard|compare|comparison|versus|vs|trend|statistic|breakdown|monthly report|yearly report|detailed|full detail|table|list all|show all|every item)\b/;

const PRODUCT_RE = /\b(brent|wti|crude|petroleum|diesel|hsd|petrol|gasoline|motor spirit|furnace|transformer|ldo|lubricant|lube|grease|glycol|meg|deg|teg|solvent|toluene|benzene|xylene|acetone|ipa|plastic|granule|hdpe|ldpe|lldpe|polypropylene|resin|wax|white oil|oil|fuel|kerosene)\b/;

// Keyword → item-family predicates. Specific fuels are listed before the
// generic crude/oil bucket so "diesel" doesn't fall into "oil & fuel".
const GROUPS: [RegExp, (it: Item) => boolean, string][] = [
  [/\bhsd\b|diesel/, (it) => /diesel|hsd/i.test(it.name) || it.group === 'Diesel', 'diesel (HSD)'],
  [/petrol|gasoline|motor spirit|\bms\b/, (it) => /petrol|motor spirit/i.test(it.name), 'petrol (MS)'],
  [/furnace/, (it) => /furnace/i.test(it.name), 'furnace oil'],
  [/transformer/, (it) => /transformer/i.test(it.name), 'transformer oil'],
  [/\bldo\b|light diesel/, (it) => /ldo/i.test(it.name), 'LDO'],
  [/lubricant|lube|engine oil|gear oil|hydraulic|grease/, (it) => it.category === 'LUBRICANT', 'lubricants'],
  [/glycol|\bmeg\b|\bdeg\b|\bteg\b|propylene/, (it) => it.category === 'GLYCOL', 'glycols'],
  [/solvent|toluene|benzene|xylene|acetone|\bipa\b|\bmdc\b/, (it) => it.category === 'SOLVENT', 'solvents'],
  [/plastic|granule|hdpe|ldpe|\bpp\b|lldpe|polymer|polypropylene/, (it) => it.category === 'PLASTIC_GRANULE', 'plastic granules'],
  [/specialt|resin|\bwax\b|white oil|\bupr\b/, (it) => it.category === 'SPECIALTY', 'specialty chemicals'],
  [/crude|brent|wti|petroleum|\boil\b|fuel/, (it) => it.category === 'OIL_FUEL', 'oil & fuel products'],
];

const wantsDetail = (s: string) => DETAIL_RE.test(s);

/** Resolve a natural-language time window to an inclusive ISO date range. */
function parsePeriod(s: string): { start: string; end: string; label: string } {
  const now = new Date();
  const y = now.getFullYear();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const yearRange = (yr: number, label?: string) => ({ start: `${yr}-01-01`, end: `${yr}-12-31`, label: label ?? `${yr}` });

  const explicitYear = s.match(/\b(20\d{2})\b/);
  if (explicitYear?.[1]) return yearRange(Number(explicitYear[1]));

  if (/last year|previous year|prior year/.test(s)) return yearRange(y - 1, `last year (${y - 1})`);
  if (/this year|current year|year to date|\bytd\b/.test(s)) return { start: `${y}-01-01`, end: iso(now), label: `this year (${y})` };
  if (/yesterday/.test(s)) { const d = new Date(now); d.setDate(d.getDate() - 1); return { start: iso(d), end: iso(d), label: 'yesterday' }; }
  if (/last month|previous month/.test(s)) {
    const start = new Date(y, now.getMonth() - 1, 1);
    const end = new Date(y, now.getMonth(), 0);
    return { start: iso(start), end: iso(end), label: start.toLocaleString('en-US', { month: 'long', year: 'numeric' }) };
  }
  if (/this month|current month|\bmtd\b/.test(s)) return { start: iso(new Date(y, now.getMonth(), 1)), end: iso(now), label: 'this month' };
  if (/\btoday\b/.test(s)) return { start: iso(now), end: iso(now), label: 'today' };
  if (/last quarter|previous quarter/.test(s)) {
    const startMonth = (Math.floor(now.getMonth() / 3) - 1) * 3;
    const start = new Date(y, startMonth, 1);
    const end = new Date(y, startMonth + 3, 0);
    return { start: iso(start), end: iso(end), label: 'last quarter' };
  }
  if (/last 12 months|trailing|past year|past 12 months/.test(s)) {
    const start = new Date(now); start.setFullYear(y - 1);
    return { start: iso(start), end: iso(now), label: 'last 12 months' };
  }
  return { start: '0000-01-01', end: '9999-12-31', label: 'all time' };
}

const OTHER_COUNTRIES: [RegExp, string][] = [
  [/\buae\b|united arab emirates|dubai|abu dhabi|fujairah/, 'the UAE'],
  [/saudi|\bksa\b|riyadh|jeddah|dammam/, 'Saudi Arabia'],
  [/qatar|doha/, 'Qatar'],
  [/kuwait/, 'Kuwait'],
  [/\boman\b|muscat|sohar/, 'Oman'],
  [/bahrain|manama/, 'Bahrain'],
  [/\busa\b|united states|america/, 'the United States'],
  [/\buk\b|united kingdom|britain|england/, 'the United Kingdom'],
  [/canada/, 'Canada'],
];

function detectRegion(s: string): { name: string; india: boolean } | null {
  if (/\bindia\b|indian|across india|in india|pan.?india/.test(s)) return { name: 'India', india: true };
  for (const [re, name] of OTHER_COUNTRIES) if (re.test(s)) return { name, india: false };
  return null;
}

function resolveSubject(s: string, ctx: AiContext): { ids: string[]; label: string } | null {
  for (const it of ctx.items) {
    const base = it.name.toLowerCase().replace(/\(.*?\)/g, '').trim();
    if (base.length >= 4 && s.includes(base)) return { ids: [it.id], label: it.name };
  }
  for (const [re, pred, label] of GROUPS) {
    if (re.test(s)) {
      const ids = ctx.items.filter(pred).map((it) => it.id);
      if (ids.length) return { ids, label };
    }
  }
  return null;
}

function findSubjects(s: string, ctx: AiContext): { ids: string[]; label: string }[] {
  const out: { ids: string[]; label: string }[] = [];
  const seen = new Set<string>();
  for (const it of ctx.items) {
    const base = it.name.toLowerCase().replace(/\(.*?\)/g, '').trim();
    if (base.length >= 4 && s.includes(base) && !seen.has(it.name)) { seen.add(it.name); out.push({ ids: [it.id], label: it.name }); }
  }
  for (const [re, pred, label] of GROUPS) {
    if (re.test(s) && !seen.has(label)) {
      const ids = ctx.items.filter(pred).map((it) => it.id);
      if (ids.length) { seen.add(label); out.push({ ids, label }); }
    }
  }
  return out;
}

function litrePhrase(kl: number): string {
  const l = kl * 1000;
  if (l >= 1_000_000) return `${(l / 1_000_000).toFixed(2)} million litres`;
  return `${formatNumber(Math.round(l))} litres`;
}

// ===========================================================================
// Intent handlers
// ===========================================================================

function prices(s: string, ctx: AiContext, detail: boolean): AiReply {
  const all = [...ctx.oil, ...ctx.fuel];
  const wants = (names: string[]) => names.some((n) => s.includes(n));
  let picked = all;
  if (wants(['brent'])) picked = all.filter((t) => /brent/i.test(t.name));
  else if (wants(['wti'])) picked = all.filter((t) => /wti/i.test(t.name));
  else if (wants(['diesel'])) picked = all.filter((t) => /diesel/i.test(t.name));
  else if (wants(['petrol'])) picked = all.filter((t) => /petrol/i.test(t.name));
  else if (wants(['lpg'])) picked = all.filter((t) => /lpg/i.test(t.name));
  else if (wants(['atf', 'jet', 'aviation'])) picked = all.filter((t) => /atf|jet/i.test(t.name));
  else if (wants(['natural gas'])) picked = all.filter((t) => /natural gas/i.test(t.name));
  else if (wants(['cng'])) picked = all.filter((t) => /cng/i.test(t.name));
  else if (wants(['fuel'])) picked = ctx.fuel;
  else if (wants(['crude', 'benchmark'])) picked = ctx.oil;
  if (picked.length === 0) picked = all;

  const to = route(ctx.role, 'market');
  const arrow = (t: LiveTicker) => `${t.change >= 0 ? '▲' : '▼'} ${Math.abs(t.change).toFixed(2)}%`;

  // Concise: single quote → one line; a few → short bullet list.
  if (!detail) {
    const one = picked[0];
    if (picked.length === 1 && one) {
      const reply: AiReply = { blocks: [text(`**${one.name}** is trading at **${formatMarket(one)}** (${arrow(one)} today).`)] };
      if (to) reply.action = { label: 'Open Live Market', to };
      return reply;
    }
    const reply: AiReply = {
      blocks: [{ kind: 'list', items: picked.slice(0, 6).map((t) => `${t.name} — **${formatMarket(t)}** (${arrow(t)})`) }],
    };
    if (to) reply.action = { label: 'Open Live Market', to };
    return reply;
  }

  // Detail: full table.
  const rows = picked.map((t) => [t.name, formatMarket(t), arrow(t), new Date(t.lastUpdated).toLocaleTimeString()]);
  const reply: AiReply = {
    blocks: [
      text(`Market snapshot — ${picked.length} instrument${picked.length === 1 ? '' : 's'} (indicative feed):`),
      { kind: 'table', columns: ['Product', 'Price', 'Change', 'Updated'], rows },
    ],
  };
  if (to) reply.action = { label: 'Open Live Market', to };
  return reply;
}

function volume(s: string, ctx: AiContext, detail: boolean): AiReply {
  const period = parsePeriod(s);
  const region = detectRegion(s);
  if (region && !region.india) {
    return { blocks: [text(`I only have transport & sales data for **India** in this workspace — there are no records for **${region.name}** yet.`)] };
  }

  const subject = resolveSubject(s, ctx);
  const subjIds = subject ? new Set(subject.ids) : null;
  const label = subject?.label ?? 'all products';
  const itemName = new Map(ctx.items.map((i) => [i.id, i.name]));
  const inRange = (d: string) => d >= period.start && d <= period.end;
  const transported = /(transport|dispatch|deliver|moved|move|shipped|ship|hauled|carried|supplied|supply)/.test(s)
    && !/\b(sold|sell|bought|buy|purchas|revenue|sales|turnover)\b/.test(s);

  // ---- "which customers bought the most …" ----
  if (!transported && /customer/.test(s) && /(most|top|highest|biggest|largest|leading)/.test(s) && ctx.role !== 'CUSTOMER') {
    const byCust = new Map<string, { kl: number; rev: number }>();
    for (const inv of ctx.invoices) {
      if (!inRange(inv.invoiceDate)) continue;
      for (const li of inv.items) {
        if (subjIds && !subjIds.has(li.itemId)) continue;
        const kl = li.unit === 'L' ? li.quantity / 1000 : li.quantity;
        const c = byCust.get(inv.customerId) ?? { kl: 0, rev: 0 };
        c.kl += kl; c.rev += li.amount; byCust.set(inv.customerId, c);
      }
    }
    const cName = new Map(ctx.customers.map((c) => [c.id, c.companyName]));
    const ranked = [...byCust.entries()].sort((a, b) => b[1].kl - a[1].kl);
    if (!ranked.length) return { blocks: [text(`No ${label} purchases found for ${period.label}.`)] };
    if (detail) {
      const rows = ranked.slice(0, 10).map(([id, v]) => [cName.get(id) ?? '—', formatQty(v.kl, 'KL'), formatINR(v.rev)]);
      return { blocks: [text(`Top customers by ${label} volume — ${period.label}:`), { kind: 'table', columns: ['Customer', 'Volume', 'Revenue'], rows }], action: { label: 'Open Customers', to: route(ctx.role, 'customers') ?? '/customers' } };
    }
    const top = ranked[0]!;
    const next = ranked.slice(1, 3).map(([id, v]) => `${cName.get(id) ?? '—'} (${formatQty(v.kl, 'KL')})`);
    return { blocks: [text(`**${cName.get(top[0]) ?? '—'}** bought the most ${label} ${period.label} — **${formatQty(top[1].kl, 'KL')}**.${next.length ? ` Next: ${next.join(', ')}.` : ''}`)] };
  }

  // ---- aggregate volume ----
  const perItem = new Map<string, { kl: number; rev: number; n: number }>();
  const monthly = new Map<string, { kl: number; rev: number }>();
  let totalKL = 0; let totalRev = 0; let count = 0;
  if (transported) {
    for (const d of ctx.dispatches) {
      const date = d.deliveredAt ?? d.dispatchedAt ?? d.scheduledAt;
      if (!inRange(date)) continue;
      if (subjIds && !subjIds.has(d.itemId)) continue;
      const kl = d.unit === 'L' ? d.quantity / 1000 : d.quantity;
      const pi = perItem.get(d.itemId) ?? { kl: 0, rev: 0, n: 0 }; pi.kl += kl; pi.n += 1; perItem.set(d.itemId, pi);
      const mk = date.slice(0, 7); const mm = monthly.get(mk) ?? { kl: 0, rev: 0 }; mm.kl += kl; monthly.set(mk, mm);
      totalKL += kl; count += 1;
    }
  } else {
    for (const inv of ctx.invoices) {
      if (!inRange(inv.invoiceDate)) continue;
      for (const li of inv.items) {
        if (subjIds && !subjIds.has(li.itemId)) continue;
        const kl = li.unit === 'L' ? li.quantity / 1000 : li.quantity;
        const pi = perItem.get(li.itemId) ?? { kl: 0, rev: 0, n: 0 }; pi.kl += kl; pi.rev += li.amount; pi.n += 1; perItem.set(li.itemId, pi);
        const mk = inv.invoiceDate.slice(0, 7); const mm = monthly.get(mk) ?? { kl: 0, rev: 0 }; mm.kl += kl; mm.rev += li.amount; monthly.set(mk, mm);
        totalKL += kl; totalRev += li.amount; count += 1;
      }
    }
  }

  if (perItem.size === 0) {
    return { blocks: [text(`I couldn't find any ${label} ${transported ? 'transport' : 'sales'} records for **${period.label}**${region?.india ? ' in India' : ''}.`)] };
  }

  const periodPhrase = period.label === 'all time' ? '' : period.label;

  // Concise (default).
  if (!detail) {
    if (transported) {
      const tail = [region?.india ? 'across India' : '', periodPhrase].filter(Boolean).join(' ');
      return { blocks: [text(`About **${formatQty(totalKL, 'KL')}** (~${litrePhrase(totalKL)}) of **${label}** were transported${tail ? ' ' + tail : ''}.`)] };
    }
    return { blocks: [text(`We sold about **${formatQty(totalKL, 'KL')}** (~${litrePhrase(totalKL)}) of **${label}**${periodPhrase ? ' ' + periodPhrase : ''}${totalRev ? `, worth **${formatINR(totalRev)}**` : ''}.`)] };
  }

  // Detailed / analytical.
  const blocks: AiBlock[] = [text(`**${cap(label)}** ${transported ? 'transport' : 'sales'} — ${period.label}${region?.india ? ' · India' : ''}`)];
  const totals: string[] = [`Total volume: **${formatQty(totalKL, 'KL')}** (~${litrePhrase(totalKL)})`];
  if (!transported) totals.push(`Total revenue: **${formatINR(totalRev)}**`, `Avg realised rate: **${formatINR(totalKL ? totalRev / totalKL : 0)} / KL**`);
  totals.push(transported ? `Shipments: **${count}**` : `Invoice lines: **${count}**`);
  blocks.push({ kind: 'list', items: totals });
  if (perItem.size > 1) {
    const rows = [...perItem.entries()].sort((a, b) => b[1].kl - a[1].kl).slice(0, 12).map(([id, v]) =>
      transported ? [itemName.get(id) ?? '—', formatQty(v.kl, 'KL'), String(v.n)] : [itemName.get(id) ?? '—', formatQty(v.kl, 'KL'), formatINR(v.rev)]);
    blocks.push({ kind: 'table', columns: transported ? ['Product', 'Volume', 'Shipments'] : ['Product', 'Volume', 'Revenue'], rows });
  }
  if (monthly.size > 1) {
    const rows = [...monthly.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([m, v]) =>
      transported ? [m, formatQty(v.kl, 'KL')] : [m, formatQty(v.kl, 'KL'), formatINR(v.rev)]);
    blocks.push(text('Monthly trend:'), { kind: 'table', columns: transported ? ['Month', 'Volume'] : ['Month', 'Volume', 'Revenue'], rows });
  }
  return { blocks, action: { label: 'Open Sales Reports', to: route(ctx.role, 'history') ?? '/reports/sales' } };
}

function compare(s: string, ctx: AiContext): AiReply {
  const period = parsePeriod(s);
  const subs = findSubjects(s, ctx);
  if (subs.length < 2) return volume(s, ctx, true);
  const inRange = (d: string) => d >= period.start && d <= period.end;
  const transported = /(transport|dispatch|deliver|moved|shipped|hauled|carried)/.test(s) && !/\b(sold|sell|bought|revenue|sales)\b/.test(s);
  const rows = subs.map((sub) => {
    const ids = new Set(sub.ids); let kl = 0; let rev = 0;
    if (transported) {
      for (const d of ctx.dispatches) { const date = d.deliveredAt ?? d.dispatchedAt ?? d.scheduledAt; if (!inRange(date) || !ids.has(d.itemId)) continue; kl += d.unit === 'L' ? d.quantity / 1000 : d.quantity; }
      return [cap(sub.label), formatQty(kl, 'KL')];
    }
    for (const inv of ctx.invoices) { if (!inRange(inv.invoiceDate)) continue; for (const li of inv.items) { if (!ids.has(li.itemId)) continue; kl += li.unit === 'L' ? li.quantity / 1000 : li.quantity; rev += li.amount; } }
    return [cap(sub.label), formatQty(kl, 'KL'), formatINR(rev)];
  });
  return {
    blocks: [
      text(`Comparison — ${period.label}:`),
      { kind: 'table', columns: transported ? ['Product', 'Volume'] : ['Product', 'Volume', 'Revenue'], rows },
    ],
    action: { label: 'Open Sales Reports', to: route(ctx.role, 'history') ?? '/reports/sales' },
  };
}

function invoices(s: string, ctx: AiContext, detail: boolean): AiReply {
  let list = ctx.invoices;
  let scope = '';
  if (/overdue/.test(s)) { list = list.filter((i) => i.status === 'OVERDUE'); scope = 'overdue '; }
  else if (/pending|unpaid|due|outstanding/.test(s)) { list = list.filter((i) => i.status !== 'PAID'); scope = 'pending '; }
  else if (/\bpaid\b/.test(s)) { list = list.filter((i) => i.status === 'PAID'); scope = 'paid '; }
  list = [...list].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
  if (list.length === 0) return { blocks: [text(`You have no ${scope}invoices.`)] };

  const total = list.reduce((n, i) => n + i.total, 0);
  const to = route(ctx.role, 'invoices');

  if (!detail) {
    const reply: AiReply = { blocks: [text(`You have **${list.length}** ${scope}invoice${list.length === 1 ? '' : 's'} totalling **${formatINR(total)}**.`)] };
    if (to) reply.action = { label: 'Open Invoices', to };
    return reply;
  }
  const rows = list.slice(0, 12).map((i) => [i.number, formatDate(i.invoiceDate), formatINR(i.total), i.status]);
  const reply: AiReply = {
    blocks: [
      text(`**${list.length}** ${scope}invoice${list.length === 1 ? '' : 's'} · total **${formatINR(total)}**:`),
      { kind: 'table', columns: ['Invoice', 'Date', 'Amount', 'Status'], rows },
    ],
  };
  if (to) reply.action = { label: 'Open Invoices', to };
  return reply;
}

function payments(s: string, ctx: AiContext, detail: boolean): AiReply {
  const to = route(ctx.role, 'payments');

  // "who / which customers have pending payments" (also the analytics view)
  if (ctx.role !== 'CUSTOMER' && (/(who|which customer|list)/.test(s) || detail) && /(pending|outstanding|owe|overdue|due|payment)/.test(s)) {
    const map = new Map<string, number>();
    ctx.invoices.filter((i) => i.status !== 'PAID').forEach((i) => map.set(i.customerId, (map.get(i.customerId) ?? 0) + (i.total - i.amountPaid)));
    const cName = new Map(ctx.customers.map((c) => [c.id, c.companyName]));
    const ranked = [...map.entries()].sort((a, b) => b[1] - a[1]);
    if (!ranked.length) return { blocks: [text('No customers have pending payments. 🎉')] };
    const grand = ranked.reduce((n, [, v]) => n + v, 0);
    if (detail) {
      const rows = ranked.slice(0, 15).map(([id, v]) => [cName.get(id) ?? '—', formatINR(v)]);
      return { blocks: [text(`**${ranked.length}** customers owe **${formatINR(grand)}** in total:`), { kind: 'table', columns: ['Customer', 'Outstanding'], rows }], action: to ? { label: 'Open Payments', to } : undefined };
    }
    return {
      blocks: [
        text(`**${ranked.length}** customer${ranked.length === 1 ? '' : 's'} have pending payments (**${formatINR(grand)}** total):`),
        { kind: 'list', items: ranked.slice(0, 6).map(([id, v]) => `${cName.get(id) ?? '—'} — **${formatINR(v)}**`) },
      ],
      action: to ? { label: 'Open Payments', to } : undefined,
    };
  }

  if (/received|collected|this month/.test(s)) {
    const month = new Date().toISOString().slice(0, 7);
    const rec = ctx.payments.filter((p) => p.paidAt.slice(0, 7) === month);
    const sum = rec.reduce((n, p) => n + p.amount, 0);
    return { blocks: [text(`**${rec.length}** payment${rec.length === 1 ? '' : 's'} received this month, totalling **${formatINR(sum)}**.`)], action: to ? { label: 'Open Payments', to } : undefined };
  }

  const unpaid = ctx.invoices.filter((i) => i.status !== 'PAID');
  const outstanding = unpaid.reduce((n, i) => n + (i.total - i.amountPaid), 0);
  const overdue = ctx.invoices.filter((i) => i.status === 'OVERDUE').length;
  return {
    blocks: [text(`Total outstanding is **${formatINR(outstanding)}** across **${unpaid.length}** unpaid invoice${unpaid.length === 1 ? '' : 's'}${overdue ? `, **${overdue}** overdue` : ''}.`)],
    action: to ? { label: 'Open Payments', to } : undefined,
  };
}

function orders(s: string, ctx: AiContext, detail: boolean): AiReply {
  let list = ctx.dispatches;
  let label = 'shipment';
  if (/transit|on the way/.test(s)) { list = list.filter((d) => d.status === 'IN_TRANSIT' || d.status === 'LOADING'); label = 'in-transit shipment'; }
  else if (/delivered|completed/.test(s)) { list = list.filter((d) => d.status === 'DELIVERED'); label = 'delivered shipment'; }
  else if (/today|this week|arriv|upcoming|scheduled/.test(s)) { list = list.filter((d) => d.status === 'SCHEDULED' || d.status === 'LOADING' || d.status === 'IN_TRANSIT'); label = 'upcoming shipment'; }
  list = [...list].sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  if (list.length === 0) return { blocks: [text(`No ${label}s found.`)] };
  const to = route(ctx.role, 'tracking');

  if (!detail) {
    const reply: AiReply = { blocks: [text(`You have **${list.length}** ${label}${list.length === 1 ? '' : 's'}.`)] };
    if (to) reply.action = { label: 'Open Product Tracking', to };
    return reply;
  }
  const itemName = new Map(ctx.items.map((i) => [i.id, i.name]));
  const rows = list.slice(0, 12).map((d) => [d.number, itemName.get(d.itemId) ?? '—', d.status, formatDate(d.scheduledAt)]);
  const reply: AiReply = { blocks: [text(`**${list.length}** ${label}${list.length === 1 ? '' : 's'}:`), { kind: 'table', columns: ['Dispatch', 'Product', 'Status', 'Scheduled'], rows }] };
  if (to) reply.action = { label: 'Open Product Tracking', to };
  return reply;
}

function customers(s: string, ctx: AiContext, detail: boolean): AiReply {
  if (ctx.role === 'CUSTOMER') {
    return { blocks: [text(`You're signed in for **${ctx.me?.companyName ?? 'your account'}**. For privacy, I only show your own orders, invoices, payments and documents.`)] };
  }
  const active = ctx.customers.filter((c) => c.active).length;

  // Top customers by revenue (analytics).
  if (detail && /(top|best|biggest|largest|revenue|spend)/.test(s)) {
    const rev = new Map<string, number>();
    ctx.invoices.forEach((i) => rev.set(i.customerId, (rev.get(i.customerId) ?? 0) + i.total));
    const cName = new Map(ctx.customers.map((c) => [c.id, c.companyName]));
    const rows = [...rev.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, v]) => [cName.get(id) ?? '—', formatINR(v)]);
    return { blocks: [text('Top customers by revenue (all time):'), { kind: 'table', columns: ['Customer', 'Revenue'], rows }], action: { label: 'Open Customers', to: '/customers' } };
  }

  if (/how many|count|number of/.test(s) || !detail) {
    return { blocks: [text(`There are **${ctx.customers.length}** customers (**${active}** active).`)], action: { label: 'Open Customers', to: '/customers' } };
  }
  const list = ctx.customers.filter((c) => c.active).slice(0, 12);
  const rows = list.map((c) => [c.companyName, c.segment, formatINR(c.outstanding)]);
  return { blocks: [text(`Showing **${list.length}** of **${ctx.customers.length}** customers:`), { kind: 'table', columns: ['Company', 'Segment', 'Outstanding'], rows }], action: { label: 'Open Customers', to: '/customers' } };
}

function notifications(ctx: AiContext): AiReply {
  const unread = ctx.notifications.filter((n) => !n.read);
  if (unread.length === 0) return { blocks: [text('You have no unread notifications. 🎉')] };
  const to = route(ctx.role, 'notifications');
  const reply: AiReply = {
    blocks: [
      text(`You have **${unread.length}** unread notification${unread.length === 1 ? '' : 's'}:`),
      { kind: 'list', items: unread.slice(0, 5).map((n) => n.title) },
    ],
  };
  if (to) reply.action = { label: 'Open Notifications', to };
  return reply;
}

function erp(s: string, ctx: AiContext): AiReply {
  if (!ctx.canErp) return { blocks: [text("The ERP cost calculator is an internal tool and isn't available on your account.")] };
  const nums = (s.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  if (nums.length >= 3 && nums.length % 3 === 0) {
    const tanks = [];
    for (let i = 0; i < nums.length; i += 3) tanks.push({ price: nums[i] ?? 0, density: nums[i + 1] ?? 0, litre: nums[i + 2] ?? 0 });
    const r = computeErp(tanks);
    const rows = tanks.map((t, i) => [`Tank ${i + 1}`, String(t.price), String(t.density), String(t.litre), (r.perTank[i]?.kg ?? 0).toFixed(2)]);
    return {
      blocks: [
        text(`Costing for **${tanks.length}** tank(s) (price, density, litre):`),
        { kind: 'table', columns: ['Tank', 'Price', 'Density', 'Litre', 'Kg'], rows },
        { kind: 'list', items: [
          `Total: **${formatQty(r.totalLitre / 1000, 'KL')}** · **${r.totalKg.toFixed(2)} kg**`,
          `Avg density **${r.avgDensity.toFixed(2)} g/L** · avg price **₹${r.avgPrice.toFixed(2)}/L**`,
          `Total price **${formatINR(r.totalPrice)}**`,
        ] },
      ],
      action: { label: 'Open ERP Calculator', to: '/erp-calculator' },
    };
  }
  return {
    blocks: [text('Give me values as **price density litre** per tank, e.g. "calculate 50 800 1000, 60 850 500" — I\'ll return blended cost, weighted density and kg.')],
    action: { label: 'Open ERP Calculator', to: '/erp-calculator' },
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
    [/document|paperwork/, 'documents', 'Documents'],
    [/market|live price/, 'market', 'Live Market'],
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
      text(`Hi ${ctx.userName?.split(' ')[0] ?? 'there'} 👋 Ask me naturally — I answer from your live CRM data. Try:`),
      { kind: 'list', items: [
        '“How much diesel did we sell last year?”',
        '“How much Brent oil was transported across India last month?”',
        '“Who has pending payments?”',
        '“What’s today’s Brent price?”',
        'Add **“analytics”**, **“report”** or **“compare”** for tables & breakdowns.',
      ] },
    ],
  };
}

// ===========================================================================
// Follow-up context ("what about diesel?")
// ===========================================================================

function isFollowUp(s: string): boolean {
  if (/^(what about|how about|and about|and for|what of|and |also |& )/.test(s)) return true;
  const words = s.replace(/[?.!,]/g, '').split(/\s+/).filter(Boolean);
  return words.length <= 3 && PRODUCT_RE.test(s)
    && !/(last|this|year|month|quarter|today|yesterday|price|invoice|payment|customer|analytic|report|transport|deliver|sold|sell)/.test(s);
}

function reconstruct(prev: string, s: string): string {
  const subj = s.replace(/^(what about|how about|and about|and for|what of|and |also |& )/, '').trim();
  return `${prev.replace(new RegExp(PRODUCT_RE, 'gi'), ' ')} ${subj}`.replace(/\s+/g, ' ').trim();
}

// ===========================================================================
// Intent classifiers + dispatcher
// ===========================================================================

function isVolumeQuery(s: string): boolean {
  if (/top\s+\w*\s*customer|customer.{0,15}(revenue|spend|bought|buy|purchas)/.test(s)) return true;
  if (/(revenue|turnover|\bsales\b|top (product|selling)|best.?sell|most sold|highest selling)/.test(s)) return true;
  const metric = /(quantity|volume|litre|liter|kilolit|\bkl\b|how much|how many)/.test(s);
  const verbz = /(transport|dispatch|deliver|moved|move|shipped|ship|hauled|carried|sold|sell|bought|buy|purchas|supplied|supply)/.test(s);
  const period = /(last year|this year|last month|this month|last quarter|year to date|yesterday|\b20\d{2}\b)/.test(s);
  return (metric || verbz) && (PRODUCT_RE.test(s) || period);
}

const isPriceQuery = (s: string) =>
  /\b(price|prices|trading|quote|market rate|benchmark)\b/.test(s)
  || (PRODUCT_RE.test(s) && /(today|now|current|latest)/.test(s));

export function runAssistant(query: string, ctx: AiContext): AiReply {
  let s = query.toLowerCase().trim();
  if (!s || /^(hi|hello|hey|help|what can you do|good (morning|afternoon|evening))\b/.test(s)) return capabilities(ctx);

  // Resolve a short follow-up against the previous message.
  const prev = ctx.previousQuery?.toLowerCase().trim();
  if (prev && isFollowUp(s)) s = reconstruct(prev, s);

  const detail = wantsDetail(s);

  const nav = navigation(s, ctx);
  if (nav) return nav;

  if (/\b(compare|comparison|versus|\bvs\b)\b/.test(s)) return compare(s, ctx);
  if (isVolumeQuery(s)) return volume(s, ctx, detail);
  if (isPriceQuery(s)) return prices(s, ctx, detail);
  if (/(calculat|weighted|avg density|average density|blend|\berp\b)/.test(s)) return erp(s, ctx);
  if (/invoice|bill/.test(s)) return invoices(s, ctx, detail);
  if (/payment|outstanding|balance|owe|receivable|\bpaid\b|pending pay/.test(s)) return payments(s, ctx, detail);
  if (/order|dispatch|transit|deliver|tracking|shipment|arriv/.test(s)) return orders(s, ctx, detail);
  if (/customer|client|active account/.test(s)) return customers(s, ctx, detail);
  if (/notification|alert|announce/.test(s)) return notifications(ctx);

  return {
    blocks: [text("I can help with sales & transport volumes, invoices, payments, shipments, customers and live prices — grounded in your CRM. Try “how much diesel did we sell last year?” or add “analytics” for a full breakdown.")],
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
      return ['How much did I buy last year?', 'Track my latest order', 'Any pending payments?', "Today's Brent price"];
    case 'ACCOUNTS':
      return ['Who has pending payments?', 'How much is outstanding?', 'Analytics for pending payments', 'Payments received this month'];
    case 'SALES_MANAGER':
      return ['How much diesel did we sell last year?', 'Compare Brent and diesel', 'Which customers bought the most fuel this month?', 'Analytics for sales this year'];
    case 'SALES_EXECUTIVE':
      return ['How much petrol did we sell last month?', 'Shipments in transit', 'Show my customers', "Today's Brent price"];
    default:
      return ['How much oil did we sell last year?', 'Analytics for top customers', 'Who has pending payments?', 'Compare Brent and diesel', "Today's Brent price"];
  }
}
