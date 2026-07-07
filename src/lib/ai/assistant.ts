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
  Role, Customer, Invoice, Dispatch, SalesOrder, Payment, AppNotification, Item, User, AuditLogEntry,
} from '@/types';
import type { LiveTicker } from '@/hooks/useLiveMarket';
import { computeErp } from '@/lib/erp';
import { formatINR, formatDate, formatQty, formatNumber } from '@/lib/format';
import { formatMarket } from '@/lib/market';
import { faqStrong, faqFallback } from './faq';

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
  /** Staff directory + audit trail (used by admin-only handlers). */
  users?: User[];
  auditLog?: AuditLogEntry[];
  /** Previous user message — used to resolve follow-ups like "what about diesel?" */
  previousQuery?: string;
  /** Prior turns of the current conversation (oldest→newest) for multi-turn memory. */
  history?: { role: 'user' | 'assistant'; text: string }[];
  /** Recalled cross-session context lines (recent queries, saved preferences/facts). */
  memory?: string[];
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

const PERIOD_RE = /(last year|this year|last month|this month|last quarter|year to date|yesterday|today|last 12 months|\b20\d{2}\b)/;

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
  const cust = matchCustomer(s, ctx);
  const who = cust ? `**${cust.companyName}**` : 'You';
  const hasVerb = cust ? 'has' : 'have';
  let list = cust ? ctx.invoices.filter((i) => i.customerId === cust.id) : ctx.invoices;
  let scope = '';
  if (/overdue/.test(s)) { list = list.filter((i) => i.status === 'OVERDUE'); scope = 'overdue '; }
  else if (/pending|unpaid|due|outstanding/.test(s)) { list = list.filter((i) => i.status !== 'PAID'); scope = 'pending '; }
  else if (/\bpaid\b/.test(s)) { list = list.filter((i) => i.status === 'PAID'); scope = 'paid '; }
  list = [...list].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
  const to = route(ctx.role, 'invoices');
  const download = /download|send|email|\bpdf\b/.test(s);
  const withNote = (blocks: AiBlock[]) => (download ? [text("I can't download files from chat, but here's the invoice — use the **PDF** button on the Invoices page."), ...blocks] : blocks);

  if (list.length === 0) return { blocks: [text(`${who} ${hasVerb} no ${scope}invoices.`)] };

  const total = list.reduce((n, i) => n + i.total, 0);

  if (!detail) {
    // Name the invoice when there's exactly one (e.g. "which one is unpaid?").
    const only = list.length === 1 ? list[0] : undefined;
    const line = only
      ? `${who} ${hasVerb} one ${scope}invoice — **${only.number}** for **${formatINR(only.total)}** (${only.status.toLowerCase()}).`
      : `${who} ${hasVerb} **${list.length}** ${scope}invoice${list.length === 1 ? '' : 's'} totalling **${formatINR(total)}**.`;
    const reply: AiReply = { blocks: withNote([text(line)]) };
    if (to) reply.action = { label: 'Open Invoices', to };
    return reply;
  }
  const rows = list.slice(0, 12).map((i) => [i.number, formatDate(i.invoiceDate), formatINR(i.total), i.status]);
  const reply: AiReply = {
    blocks: withNote([
      text(`${cust ? cust.companyName + ' — ' : ''}**${list.length}** ${scope}invoice${list.length === 1 ? '' : 's'} · total **${formatINR(total)}**:`),
      { kind: 'table', columns: ['Invoice', 'Date', 'Amount', 'Status'], rows },
    ]),
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

  const cust = matchCustomer(s, ctx);
  const scopeInv = cust ? ctx.invoices.filter((i) => i.customerId === cust.id) : ctx.invoices;
  const unpaid = scopeInv.filter((i) => i.status !== 'PAID');
  const outstanding = unpaid.reduce((n, i) => n + (i.total - i.amountPaid), 0);
  const overdue = scopeInv.filter((i) => i.status === 'OVERDUE').length;
  const lead = cust ? `**${cust.companyName}** owes` : 'Total outstanding is';
  return {
    blocks: [text(`${lead} **${formatINR(outstanding)}** across **${unpaid.length}** unpaid invoice${unpaid.length === 1 ? '' : 's'}${overdue ? `, **${overdue}** overdue` : ''}.`)],
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

// Direct yes/no answers ("are they dispatched?", "any pending payments?",
// "is everything paid?") resolved from the real data, instead of a bare count.
function yesNo(s: string, ctx: AiContext): AiReply | null {
  if (!/^(are|is|has|have|do|does|did|was|were|am|can|will|any\b)/.test(s.trim())) return null;

  // --- shipment / dispatch / delivery status ---
  if (/dispatch|shipped|\bship\b|in transit|on the way|out for delivery|deliver|arriv|reach|shipment/.test(s)) {
    const list = ctx.dispatches;
    const to = route(ctx.role, 'tracking');
    const act = (t: string): AiReply => (to ? { blocks: [text(t)], action: { label: 'Open Product Tracking', to } } : { blocks: [text(t)] });
    if (!list.length) return act('You don’t have any shipments on record right now.');
    const inTransit = list.filter((d) => d.status === 'IN_TRANSIT').length;
    const delivered = list.filter((d) => d.status === 'DELIVERED').length;
    const dispatched = inTransit + delivered;
    const n = list.length;

    if (/deliver|arriv|reach/.test(s)) {
      if (delivered === n) return act(`**Yes** — all **${n}** of your shipments have been **delivered**.`);
      if (delivered === 0) return act(`**No** — none of your **${n}** shipment${n === 1 ? '' : 's'} ${n === 1 ? 'has' : 'have'} been delivered yet${inTransit ? ` (${inTransit} in transit)` : ''}.`);
      return act(`**Partly** — **${delivered}** of **${n}** shipments delivered; the rest are still on the way.`);
    }
    if (/in transit|on the way/.test(s)) {
      return inTransit
        ? act(`**Yes** — **${inTransit}** of your **${n}** shipment${n === 1 ? '' : 's'} ${inTransit === 1 ? 'is' : 'are'} in transit.`)
        : act('**No** — none of your shipments are in transit right now.');
    }
    // "dispatched" / "shipped"
    if (dispatched === n) return act(`**Yes** — all **${n}** of your shipment${n === 1 ? '' : 's'} ${n === 1 ? 'has' : 'have'} been dispatched (${inTransit} in transit, ${delivered} delivered).`);
    if (dispatched === 0) return act(`**No** — your **${n}** shipment${n === 1 ? '' : 's'} ${n === 1 ? 'is' : 'are'} still being prepared (scheduled/loading) and ${n === 1 ? 'hasn’t' : 'haven’t'} been dispatched yet.`);
    return act(`**Partly** — **${dispatched}** of **${n}** shipments dispatched; **${n - dispatched}** still scheduled.`);
  }

  const toPay = route(ctx.role, 'payments');
  const payAct = (t: string): AiReply => (toPay ? { blocks: [text(t)], action: { label: 'Open Payments', to: toPay } } : { blocks: [text(t)] });

  // --- overdue invoices ---
  if (/overdue/.test(s)) {
    const overdue = ctx.invoices.filter((i) => i.status === 'OVERDUE');
    if (!overdue.length) return payAct('**No** — you have no overdue invoices. 👍');
    const bal = overdue.reduce((nn, i) => nn + (i.total - i.amountPaid), 0);
    return payAct(`**Yes** — **${overdue.length}** invoice${overdue.length === 1 ? '' : 's'} ${overdue.length === 1 ? 'is' : 'are'} overdue (**${formatINR(bal)}** outstanding).`);
  }

  // --- pending payments / outstanding ---
  if (/pending payment|outstanding|\bowe\b|unpaid|any (payment|due|bill)|everything paid|all paid|fully paid|\bdues\b/.test(s)) {
    const unpaid = ctx.invoices.filter((i) => i.status !== 'PAID');
    const overdue = ctx.invoices.filter((i) => i.status === 'OVERDUE').length;
    if (/everything paid|all paid|fully paid/.test(s)) {
      return unpaid.length === 0 ? payAct('**Yes** — everything is fully paid. 🎉') : payAct(`**No** — **${unpaid.length}** invoice${unpaid.length === 1 ? '' : 's'} still unpaid.`);
    }
    if (unpaid.length === 0) return payAct('**No** — you have no pending payments; everything is settled. 🎉');
    const bal = unpaid.reduce((nn, i) => nn + (i.total - i.amountPaid), 0);
    return payAct(`**Yes** — you have **${unpaid.length}** pending payment${unpaid.length === 1 ? '' : 's'} totalling **${formatINR(bal)}**${overdue ? `, **${overdue}** overdue` : ''}.`);
  }

  return null;
}

// "What's the current order status of ABC Petroleum?" — for staff, resolve a
// named customer and report their live order + shipment statuses from the data.
function customerOrders(s: string, ctx: AiContext): AiReply | null {
  if (ctx.role === 'CUSTOMER') return null; // customers use their own scoped views
  if (!/\border|orders|dispatch|shipment|tracking|\btrack\b|deliver|status|out for delivery|in transit|where\b/.test(s)) return null;
  const cust = matchCustomer(s, ctx);
  if (!cust) return null;

  const custOrders = ctx.orders.filter((o) => o.customerId === cust.id);
  const custDispatches = ctx.dispatches
    .filter((d) => d.customerId === cust.id)
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  if (!custOrders.length && !custDispatches.length) {
    return { blocks: [text(`I couldn't find any orders or shipments for **${cust.companyName}**.`)] };
  }

  const human = (st: string) => st.replace(/_/g, ' ').toLowerCase();
  const itemName = new Map(ctx.items.map((i) => [i.id, i.name]));
  const to = route(ctx.role, 'tracking');
  const act = (blocks: AiBlock[]): AiReply => (to ? { blocks, action: { label: 'Open Product Tracking', to } } : { blocks });

  const byOrderStatus = new Map<string, number>();
  custOrders.forEach((o) => byOrderStatus.set(o.status, (byOrderStatus.get(o.status) ?? 0) + 1));
  const orderSummary = [...byOrderStatus.entries()].map(([st, n]) => `${n} ${human(st)}`).join(', ');

  const inTransit = custDispatches.filter((d) => d.status === 'IN_TRANSIT').length;
  const delivered = custDispatches.filter((d) => d.status === 'DELIVERED').length;
  const preparing = custDispatches.filter((d) => d.status === 'SCHEDULED' || d.status === 'LOADING').length;

  // Detailed / analytics → a shipment table with statuses and current location.
  if (wantsDetail(s) || DETAIL_SEEK_RE.test(s)) {
    const blocks: AiBlock[] = [
      text(`**${cust.companyName}** — ${custOrders.length} order${custOrders.length === 1 ? '' : 's'}${orderSummary ? ` (${orderSummary})` : ''}, ${custDispatches.length} shipment${custDispatches.length === 1 ? '' : 's'}:`),
    ];
    if (custDispatches.length) {
      const rows = custDispatches.slice(0, 12).map((d) => [d.number, itemName.get(d.itemId) ?? '—', cap(human(d.status)), d.currentLocation ?? '—', formatDate(d.scheduledAt)]);
      blocks.push({ kind: 'table', columns: ['Dispatch', 'Product', 'Status', 'Location', 'Scheduled'], rows });
    }
    return act(blocks);
  }

  // Concise → order summary + the latest shipment's live status.
  const parts: string[] = [];
  if (custOrders.length) parts.push(`**${custOrders.length}** order${custOrders.length === 1 ? '' : 's'}${orderSummary ? ` (${orderSummary})` : ''}`);
  if (custDispatches.length) {
    const dsum = [inTransit ? `${inTransit} in transit` : '', preparing ? `${preparing} being prepared` : '', delivered ? `${delivered} delivered` : ''].filter(Boolean).join(', ');
    parts.push(`**${custDispatches.length}** shipment${custDispatches.length === 1 ? '' : 's'}${dsum ? ` — ${dsum}` : ''}`);
  }
  const latest = custDispatches[0];
  const latestLine = latest
    ? ` Latest shipment **${latest.number}** (${itemName.get(latest.itemId) ?? 'product'}) is **${human(latest.status)}**${latest.currentLocation ? ` near ${latest.currentLocation}` : ''}.`
    : '';
  return act([text(`**${cust.companyName}**: ${parts.join('; ')}.${latestLine}`)]);
}

/** Match a staff member by a distinctive word of their name. */
function matchUser(s: string, ctx: AiContext): User | undefined {
  let best: User | undefined;
  let bestScore = 0;
  for (const u of ctx.users ?? []) {
    const tokens = u.name.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
    const hits = tokens.filter((t) => s.includes(t)).length;
    if (hits > bestScore) { best = u; bestScore = hits; }
  }
  return best;
}

// "What's the audit log of Ashok Desai?" — admin-only audit trail, per person.
function auditLogQuery(s: string, ctx: AiContext): AiReply | null {
  if (!/audit log|audit trail|activity log|action log|what did \w+ do|actions? (by|of|for)/.test(s)) return null;
  if (ctx.role !== 'ADMIN') return { blocks: [text('The audit log is available to **Admins** only.')] };

  const entries = ctx.auditLog ?? [];
  if (!entries.length) return { blocks: [text('No audit-log events have been recorded yet.')] };

  const userName = (id: string) => ctx.users?.find((u) => u.id === id)?.name ?? '—';
  const detail = wantsDetail(s) || DETAIL_SEEK_RE.test(s) || /audit log of|activity of/.test(s);
  const action: AiAction = { label: 'Open Audit Log', to: '/settings/audit' };

  const user = matchUser(s, ctx);
  if (user) {
    const mine = entries.filter((e) => e.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (!mine.length) return { blocks: [text(`No audit-log activity is recorded for **${user.name}**.`)], action };
    const byAction = new Map<string, number>();
    mine.forEach((e) => byAction.set(e.action, (byAction.get(e.action) ?? 0) + 1));
    const summary = [...byAction.entries()].map(([a, n]) => `${n} ${a.toLowerCase()}`).join(', ');
    const latest = mine[0]!;
    const blocks: AiBlock[] = [
      text(`**${user.name}** has **${mine.length}** logged action${mine.length === 1 ? '' : 's'} (${summary}). Most recent: **${latest.action}** on ${latest.entity} — ${latest.detail} (${formatDate(latest.createdAt)}).`),
    ];
    if (detail) {
      const rows = mine.slice(0, 15).map((e) => [formatDate(e.createdAt), e.action, e.entity, e.detail]);
      blocks.push({ kind: 'table', columns: ['Date', 'Action', 'Entity', 'Detail'], rows });
    }
    return { blocks, action };
  }

  // No specific person → the most recent events across everyone.
  const recent = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rows = recent.slice(0, 15).map((e) => [formatDate(e.createdAt), userName(e.userId), e.action, e.entity]);
  return {
    blocks: [
      text(`**${entries.length}** audit events recorded. Most recent:`),
      { kind: 'table', columns: ['Date', 'User', 'Action', 'Entity'], rows },
    ],
    action,
  };
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
  if (!/\b(open|go to|take me to|navigate|show me the|show the|launch|jump to|bring up|take me|visit)\b/.test(s)) return null;
  // Ordered specific → generic. Every page the role can reach is addressable.
  const staff: [RegExp, string, string][] = [
    [/my dashboard/, '/my-dashboard', 'My Dashboard'],
    [/ai assistant|assistant/, '/assistant', 'AI Assistant'],
    [/pipeline/, '/leads/pipeline', 'Pipeline'],
    [/lead funnel|funnel/, '/reports/funnel', 'Lead Funnel'],
    [/lead/, '/leads', 'Leads'],
    [/report builder|builder/, '/reports/builder', 'Report Builder'],
    [/geographic|geo report|sales by region/, '/reports/geo', 'Geographic Report'],
    [/sales analytic|analytic/, '/analytics', 'Sales Analytics'],
    [/sales report|report/, '/reports/sales', 'Sales Reports'],
    [/erp|calculator|costing/, '/erp-calculator', 'ERP Calculator'],
    [/item|product/, '/items', 'Items & Products'],
    [/quotation/, '/quotations', 'Quotations'],
    [/proposal/, '/proposals', 'Proposals'],
    [/sales order|order/, '/orders', 'Sales Orders'],
    [/invoice|bill/, '/invoices', 'Invoices'],
    [/payment/, '/payments', 'Payments'],
    [/transport route|route/, '/routes', 'Transport Routes'],
    [/dispatch/, '/dispatch', 'Dispatch Schedule'],
    [/trip|tracking/, '/trips', 'Trip Tracking'],
    [/vehicle/, '/vehicles', 'Vehicles'],
    [/driver/, '/drivers', 'Drivers'],
    [/inventory|stock/, '/inventory', 'Inventory'],
    [/customer|client/, '/customers', 'Customers'],
    [/my day/, '/my-day', 'My Day'],
    [/calendar/, '/calendar', 'Calendar'],
    [/task/, '/tasks', 'Tasks'],
    [/chat\b/, '/chat', 'Chat'],
    [/email/, '/email', 'Email'],
    [/call log/, '/call-logs', 'Call Logs'],
    [/notification|alert/, '/notifications', 'Notifications'],
    [/staff|team member|employee/, '/staff', 'Staff'],
    [/attendance/, '/attendance', 'Attendance'],
    [/role|permission/, '/settings/roles', 'Roles & Permissions'],
    [/definition/, '/settings/definitions', 'Definitions'],
    [/company/, '/settings/company', 'Company'],
    [/integration/, '/settings/integrations', 'Integrations'],
    [/audit/, '/settings/audit', 'Audit Log'],
    [/system|setting/, '/settings/system', 'System Settings'],
    [/dashboard|home/, '/', 'Dashboard'],
  ];
  const customer: [RegExp, string, string][] = [
    [/ai assistant|assistant/, '/assistant', 'AI Assistant'],
    [/track|product tracking|shipment|where.*order/, '/portal/products', 'Product Tracking'],
    [/active order|order/, '/portal/orders?status=active', 'Orders'],
    [/history/, '/portal/history', 'Order History'],
    [/e-invoice|challan|document|receipt|paperwork/, '/portal/documents', 'Documents'],
    [/invoice|bill/, '/portal/invoices', 'Invoices'],
    [/outstanding|payment/, '/portal/payments', 'Payments'],
    [/market|price|brent/, '/portal/market', 'Market Prices'],
    [/notification|announcement/, '/portal/notifications', 'Notifications'],
    [/support|ticket|help|account manager/, '/portal/support', 'Support'],
    [/company/, '/portal/company', 'Company Information'],
    [/setting/, '/portal/settings', 'Settings'],
    [/profile/, '/portal/profile', 'My Profile'],
    [/dashboard|home/, '/portal', 'Dashboard'],
  ];
  for (const [re, to, label] of ctx.role === 'CUSTOMER' ? customer : staff) {
    if (re.test(s)) return { blocks: [text(`Opening **${label}** for you.`)], action: { label: `Go to ${label}`, to } };
  }
  return null;
}

function capabilities(ctx: AiContext): AiReply {
  return {
    blocks: [
      text(`Hi ${ctx.userName?.split(' ')[0] ?? 'there'} 👋 Ask me naturally — I answer from your live CRM data. Try:`),
      { kind: 'list', items: [
        '“How much diesel did we sell last year?” — a quick answer',
        '“Explain Brent crude” or “How is weighted density calculated?” — a full explanation',
        '“How do I create an invoice?” — a step-by-step guide',
        '“Show analytics for last year’s sales” — a report with tables',
        '“Who has pending payments?”, “What’s today’s Brent price?”',
      ] },
    ],
  };
}

// ===========================================================================
// Structured conversation memory (slot state) + query expansion.
//
// ChatPanel keeps one ConvContext per chat thread and passes the prior one in;
// expandQuery() merges the new message's slots over it and restates a COMPLETE
// query. That is what lets pure follow-ups — "and the year before that?",
// "what about diesel?", "break that down by month", "which one is unpaid?",
// "now compare it with the previous year" — carry topic, product, period,
// region, metric, status and customer forward without the user repeating them.
// ===========================================================================

export interface ConvContext {
  intent?: 'volume' | 'compare' | 'prices' | 'invoices' | 'payments' | 'orders' | 'customers' | 'notifications';
  product?: string;
  periodPhrase?: string;   // re-injectable, e.g. 'last year', '2024', 'last month'
  periodYear?: number;     // resolved year, for relative navigation
  region?: string;
  transported?: boolean;
  metric?: 'volume' | 'revenue';
  status?: string;         // invoice status: overdue | unpaid | paid
  customer?: string;       // company name
  detail?: boolean;
}

const REL_BEFORE = /\b(year before( that)?|before that|the year before|previous year|prior year|preceding year|one year earlier|year earlier)\b/;
const REL_AFTER = /\b(year after( that)?|after that|the year after|next year|following year|year later)\b/;
const REL_SAME = /\b(same (period|time|year|month)|that period|that year)\b/;
// Signals the message leans on earlier turns rather than standing alone.
const FOLLOW_RE = /^(and\b|also\b|what about|how about|&|now\b|then\b)|\b(that|those|this one|these|it|them|same|again|previous|earlier|above|the (first|second|third|latest|last|unpaid|paid|next) one|break (it|that|this) down|by month|monthly)\b/;

function statusWord(s: string): string | undefined {
  if (/overdue/.test(s)) return 'overdue';
  if (/unpaid|pending|due|outstanding/.test(s)) return 'unpaid';
  if (/\bpaid\b/.test(s)) return 'paid';
  return undefined;
}

function periodInfo(s: string): { phrase?: string; year?: number } {
  const p = parsePeriod(s);
  if (p.label === 'all time') return {};
  const year = Number(p.start.slice(0, 4)) || undefined;
  return { phrase: s.match(PERIOD_RE)?.[0] ?? (year ? String(year) : undefined), year };
}

/** Match a customer by a distinctive word of their company name. Staff only. */
function matchCustomer(s: string, ctx: AiContext): Customer | undefined {
  if (ctx.role === 'CUSTOMER') return undefined;
  let best: Customer | undefined;
  let bestScore = 0;
  for (const c of ctx.customers) {
    const core = c.companyName.toLowerCase()
      .replace(/\b(pvt|ltd|limited|private|llp|inc|co|company|corporation|corp|industries|enterprises|petroleum|energy|petro|oil|fuels?|traders?|trading|group|solutions|international)\b/g, ' ')
      .replace(/[^a-z0-9 ]/g, ' ');
    const hit = core.split(/\s+/).filter((w) => w.length >= 4 && s.includes(w)).length;
    if (hit > bestScore) { best = c; bestScore = hit; }
  }
  return best;
}

function classifyIntent(s: string): ConvContext['intent'] | undefined {
  if (/\b(compare|comparison|versus|\bvs\b)\b/.test(s)) return 'compare';
  if (isVolumeQuery(s)) return 'volume';
  if (isPriceQuery(s)) return 'prices';
  if (/invoice|bill/.test(s)) return 'invoices';
  if (/payment|outstanding|owe|receivable|\bpaid\b|pending pay/.test(s)) return 'payments';
  if (/order|dispatch|transit|shipment|arriv|\btrack\b/.test(s)) return 'orders';
  if (/customer|client/.test(s)) return 'customers';
  if (/notification|alert/.test(s)) return 'notifications';
  return undefined;
}

function deriveContext(s: string, ctx: AiContext, intent: ConvContext['intent']): ConvContext {
  const info = periodInfo(s);
  return {
    intent,
    product: resolveSubject(s, ctx)?.label,
    periodPhrase: info.phrase,
    periodYear: info.year,
    region: detectRegion(s)?.name,
    transported: /(transport|dispatch|deliver|moved|shipped|hauled|carried)/.test(s) && !/\b(sold|sell|bought|revenue|sales)\b/.test(s),
    metric: /revenue|turnover|\bsales\b|worth|value/.test(s) ? 'revenue' : 'volume',
    status: statusWord(s),
    customer: matchCustomer(s, ctx)?.companyName,
    detail: wantsDetail(s) || DETAIL_SEEK_RE.test(s),
  };
}

/** Restate a complete query the dispatcher understands, from merged slots. */
function restate(c: ConvContext, raw: string): string {
  const period = c.periodPhrase ?? '';
  const region = c.region === 'India' ? 'across India' : c.region ?? '';
  const detail = c.detail ? 'analytics ' : '';
  const cust = c.customer ? `for ${c.customer}` : '';
  switch (c.intent) {
    case 'prices':
      return `price of ${c.product ?? 'oil'} today${c.detail ? ' analytics' : ''}`;
    case 'invoices':
      return `${/download|send|email|pdf/.test(raw) ? 'download ' : ''}${detail}show ${c.status ?? ''} invoices ${cust}`.replace(/\s+/g, ' ').trim();
    case 'payments':
      return `${detail}${/who|which/.test(raw) ? 'who has ' : ''}${c.status ?? 'outstanding'} payments ${cust}`.replace(/\s+/g, ' ').trim();
    case 'orders':
      return `${detail}shipments ${/transit/.test(raw) ? 'in transit' : /deliver/.test(raw) ? 'delivered' : ''}`.replace(/\s+/g, ' ').trim();
    case 'customers':
      return `${detail}customers`;
    case 'notifications':
      return 'notifications';
    case 'volume':
    default: {
      const salesWord = !c.product && c.metric === 'revenue' ? 'sales' : '';
      return `${detail}how much ${c.product ?? salesWord} ${c.transported ? 'transported' : 'sold'} ${region} ${period}`.replace(/\s+/g, ' ').trim();
    }
  }
}

/** Merge a new message with the thread's prior context and return an expanded,
 *  self-contained query + the updated context to store for the next turn. */
export function expandQuery(raw: string, prev: ConvContext | undefined, ctx: AiContext): { query: string; context: ConvContext } {
  const s = raw.toLowerCase().trim();
  // Greetings / thanks / acknowledgements pass straight through and leave the
  // thread's CRM context untouched, so the next real question still resolves.
  if (smallTalkCategory(s)) return { query: s, context: prev ?? {} };
  // Concept explanations, how-to guides and trained FAQ questions are
  // self-contained — pass through without merging CRM slots (but keep the
  // thread context for later).
  if (guide(s) || explainConcept(s) || (!looksLikeData(s) && faqStrong(s))) return { query: s, context: prev ?? {} };
  const ownIntent = classifyIntent(s);
  const followMarker = FOLLOW_RE.test(s) || REL_BEFORE.test(s) || REL_AFTER.test(s) || REL_SAME.test(s);
  // Only merge with the previous turn when the message genuinely leans on it —
  // an explicit follow-up marker, or a bare 1–3 word product/period ellipsis
  // ("petrol?", "and 2024"). Every other message is a FRESH question and gets
  // its own answer, so the assistant never echoes the previous reply.
  const words = s.replace(/[?.!,]/g, '').split(/\s+/).filter(Boolean);
  const bareEllipsis = words.length <= 3 && !ownIntent && (!!resolveSubject(s, ctx) || PERIOD_RE.test(s));
  if (!prev || !(followMarker || bareEllipsis)) return { query: s, context: deriveContext(s, ctx, ownIntent) };

  // ---- follow-up: layer new slots over the prior context ----
  const c: ConvContext = { ...prev };
  if (ownIntent) c.intent = ownIntent;
  if (/analytic|report|breakdown|break (it|that|this) down|by month|monthly|trend|\bcompare\b/.test(s) || DETAIL_SEEK_RE.test(s)) c.detail = true;
  const sub = resolveSubject(s, ctx);
  if (sub) c.product = sub.label;
  const reg = detectRegion(s);
  if (reg) c.region = reg.name;
  if (/revenue|turnover|\bsales\b|worth|value/.test(s)) c.metric = 'revenue';
  else if (/quantity|volume|litre|\bkl\b/.test(s)) c.metric = 'volume';
  const st = statusWord(s);
  if (st) c.status = st;
  const cust = matchCustomer(s, ctx);
  if (cust) c.customer = cust.companyName;

  // Relative / absolute time navigation.
  const baseYear = prev.periodYear ?? new Date().getFullYear();
  if (PERIOD_RE.test(s)) { const info = periodInfo(s); c.periodPhrase = info.phrase; c.periodYear = info.year; }
  else if (REL_BEFORE.test(s)) { c.periodYear = baseYear - 1; c.periodPhrase = String(baseYear - 1); }
  else if (REL_AFTER.test(s)) { c.periodYear = baseYear + 1; c.periodPhrase = String(baseYear + 1); }

  if (c.intent === 'compare') {
    const prods = findSubjects(s, ctx).map((x) => x.label);
    if (prev.product && !prods.includes(prev.product)) prods.unshift(prev.product);
    if (prods.length >= 2) return { query: `compare ${[...new Set(prods)].slice(0, 3).join(' and ')} ${c.periodPhrase ?? ''}`.trim(), context: c };
    // Otherwise compare two periods: the prior year vs the navigated one.
    const yA = prev.periodYear ?? baseYear;
    const yB = c.periodYear ?? baseYear - 1;
    return { query: `compare ${c.product ? c.product + ' ' : ''}${yA} vs ${yB}`.trim(), context: { ...c, periodYear: yB } };
  }

  return { query: restate(c, s), context: c };
}

function comparePeriods(s: string, ctx: AiContext, years: number[]): AiReply {
  const subject = resolveSubject(s, ctx);
  const subjIds = subject ? new Set(subject.ids) : null;
  const label = subject?.label ?? 'total sales';
  const rows = [...new Set(years)].sort((a, b) => b - a).slice(0, 4).map((y) => {
    let kl = 0; let rev = 0;
    for (const inv of ctx.invoices) {
      if (inv.invoiceDate.slice(0, 4) !== String(y)) continue;
      for (const li of inv.items) {
        if (subjIds && !subjIds.has(li.itemId)) continue;
        kl += li.unit === 'L' ? li.quantity / 1000 : li.quantity;
        rev += li.amount;
      }
    }
    return [String(y), formatQty(kl, 'KL'), formatINR(rev)];
  });
  return {
    blocks: [text(`${cap(label)} — year on year:`), { kind: 'table', columns: ['Year', 'Volume', 'Revenue'], rows }],
    action: { label: 'Open Sales Reports', to: route(ctx.role, 'history') ?? '/reports/sales' },
  };
}

// ===========================================================================
// Intent classifiers + dispatcher
// ===========================================================================

function isVolumeQuery(s: string): boolean {
  if (/top\s+\w*\s*customer|customer.{0,15}(revenue|spend|bought|buy|purchas)/.test(s)) return true;
  if (/(revenue|turnover|\bsales\b(?!\s+(executive|manager|managers|rep|reps|representative|representatives|team|teams|staff|person|people|role|roles|order|orders|target|targets|force|cycle|process|pipeline|department|head))|top (product|selling)|best.?sell|most sold|highest selling)/.test(s)) return true;
  const metric = /(quantity|volume|litre|liter|kilolit|\bkl\b|how much|how many)/.test(s);
  const verbz = /(transport|dispatch|deliver|moved|move|shipped|ship|hauled|carried|sold|sell|bought|buy|purchas|supplied|supply)/.test(s);
  const period = /(last year|this year|last month|this month|last quarter|year to date|yesterday|\b20\d{2}\b)/.test(s);
  return (metric || verbz) && (PRODUCT_RE.test(s) || period);
}

const isPriceQuery = (s: string) =>
  /\b(price|prices|trading|quote|market rate|benchmark)\b/.test(s)
  || (PRODUCT_RE.test(s) && /(today|now|current|latest)/.test(s));

/** A live-data request (numbers from the CRM) rather than a feature/FAQ question.
 *  Used to stop the FAQ index from shadowing the data handlers. */
function looksLikeData(s: string): boolean {
  if (isVolumeQuery(s) || isPriceQuery(s)) return true;
  if (/\b(who has|who owes|top customers?|pending payments?|overdue invoices?|received this month|in transit|outstanding balance|most fuel|by revenue)\b/.test(s)) return true;
  if (/\b(show|list|display|how many|how much|number of|total|count of)\b/.test(s)
    && /(invoices?|bills?|payments?|orders?|shipments?|dispatch|customers?|leads?|outstanding|overdue|revenue|sales|stock|proposals?|quotations?)/.test(s)) return true;
  return false;
}

// ===========================================================================
// Small talk — greetings, thanks, acknowledgements, farewells, appreciation.
// These reply warmly and NEVER trigger CRM queries. Detected before routing,
// and skipped by expandQuery so a bare "thanks" doesn't inherit the last
// question's context.
// ===========================================================================

const pick = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)] ?? arr[0]!;

type ChatCat = 'greeting' | 'thanks' | 'appreciation' | 'farewell' | 'ack';

function smallTalkCategory(s: string): ChatCat | null {
  const t = s.replace(/[!.,?]+$/g, '').trim();
  const words = t.split(/\s+/).filter(Boolean);
  // A message carrying a real CRM intent (or a long one) isn't small talk.
  if (classifyIntent(t) || words.length > 8) return null;

  if (/^(bye|good ?bye|see (you|ya)( (later|around|soon))?|catch you later|take care|good ?night|have a (good|great|nice) (day|night|one|evening)|talk (to you )?later|cya|ttyl)\b/.test(t)) return 'farewell';
  if (/\b(thanks?|thank you|thank u|thankyou|thx|ty)\b/.test(t) || /\bappreciate (it|that|you|the help)\b/.test(t)) return 'thanks';
  if (/\b(amazing|awesome job|great job|well done|nice work|good work|excellent|brilliant|impressive|you'?re the best|you'?re amazing|that helped( a lot)?|helped a lot|very helpful|super helpful|really helpful|that was helpful|love it|good stuff)\b/.test(t)) return 'appreciation';
  if (/^(hi+|hey+|heya|hiya|hello+|yo|howdy|greetings|good (morning|afternoon|evening))\b/.test(t)) return 'greeting';
  if (words.length <= 4 && /^(ok(ay)?|k|alright|all right|got it|sounds good|perfect|nice|great|cool|understood|makes sense|noted|fine|sure|yep|yeah|good|all good|no problem|np|thumbs up|👍)\b/.test(t)) return 'ack';
  return null;
}

function smallTalkReply(cat: ChatCat, s: string): AiReply {
  switch (cat) {
    case 'greeting': {
      const tod = /morning/.test(s) ? 'Good morning' : /afternoon/.test(s) ? 'Good afternoon' : /evening/.test(s) ? 'Good evening' : '';
      const opts = [
        `Hello! 👋 Welcome back. How may I assist you today?`,
        `Hi there! How can I help you with your CRM today?`,
        `Hey! Good to see you — what would you like to do?`,
      ];
      if (tod) opts.unshift(`${tod}! I hope you're having a great day. How may I help you today?`);
      return { blocks: [text(pick(opts))] };
    }
    case 'thanks':
      return { blocks: [text(pick([
        `You're most welcome! If there's anything else you need, I'm here to help.`,
        `Happy to help! Let me know if there's anything else you'd like to do.`,
        `You're welcome! Feel free to ask if you need any further assistance.`,
        `Glad I could help. Is there anything else you'd like me to look into?`,
      ]))] };
    case 'appreciation':
      return { blocks: [text(pick([
        `Thank you! I'm glad I could help.`,
        `I appreciate the kind words. Let me know if there's anything else you need.`,
        `I'm happy that was helpful. Feel free to ask anytime.`,
      ]))] };
    case 'farewell':
      return { blocks: [text(pick([
        `Goodbye! Have a wonderful day, and come back anytime you need help.`,
        `Take care! I'll be right here whenever you need the CRM.`,
        `Have a great day! Looking forward to helping you again.`,
      ]))] };
    case 'ack':
    default:
      return { blocks: [text(pick([
        `Great! Let me know whenever you need anything else.`,
        `Sounds good — I'm here if you need any further assistance.`,
        `Perfect. Feel free to ask if you'd like help with anything else.`,
      ]))] };
  }
}

// ===========================================================================
// Adaptive depth — concept explanations (Level 2/3) and how-to guides (Level 5).
// These give rich, multi-paragraph answers when the user asks to understand a
// concept or how to do something, instead of a one-liner. Data questions still
// answer concisely, and escalate to a full breakdown when the phrasing asks for
// detail (explain / breakdown / in detail / walk me through).
// ===========================================================================

const para = (t: string): AiBlock => ({ kind: 'text', text: t });
const bullets = (items: string[]): AiBlock => ({ kind: 'list', items });

/** Cue that the user wants an explanation rather than a data lookup. */
const EXPLAIN_CUE = /\b(what('s| is| are)|explain|describe|tell me about|define|meaning of|what does .* mean|why (is|are|does|do)|how (is|are|does|do)\b.*\b(work|calculat|comput|derive|generat|mean))\b/;
/** Phrasing that should deepen a DATA answer into a full breakdown. */
const DETAIL_SEEK_RE = /\b(explain|elaborate|in detail|detailed|deep dive|full (report|breakdown|detail)|give (me )?(the )?details?|break (it|that|this) down|walk me through)\b/;

const KNOWLEDGE: { re: RegExp; blocks: () => AiBlock[] }[] = [
  { re: /weighted density|average density|blended density/, blocks: () => [
    para(`**Weighted (blended) density** is the average density of oil across several tanks, weighted by how much volume each tank holds — not a plain average. It matters because tanks of the same product differ slightly in density, and stock and billing are done by weight (kg).`),
    para(`The ERP Calculator computes it like this:`),
    bullets([
      `For each tank, **Kg = (Litre × Density) ÷ 1000**.`,
      `**Total Kg** = sum of every tank's kg; **Total Litre** = sum of every tank's litres.`,
      `**Weighted density (g/L) = (Total Kg ÷ Total Litre) × 1000**.`,
    ]),
    para(`**Example** — Tank A: 10,000 L @ 840 g/L → 8,400 kg. Tank B: 5,000 L @ 820 g/L → 4,100 kg. Totals: 15,000 L and 12,500 kg. Weighted density = (12,500 ÷ 15,000) × 1000 = **833.3 g/L** — nearer Tank A because it holds more volume. A plain average would wrongly give 830 g/L.`),
  ] },
  { re: /erp calculator|erp calc|costing tool/, blocks: () => [
    para(`The **ERP Calculator** (Admin) turns tank readings into costing figures for a blended lot of oil. Per tank you enter the **purchase price (₹/L)**, **density (g/L)** and **volume (litres)**.`),
    para(`It then returns:`),
    bullets([
      `**Kg per tank** = (Litre × Density) ÷ 1000`,
      `**Total Litre / Total KL / Total Kg**`,
      `**Weighted average density** = (Total Kg ÷ Total Litre) × 1000`,
      `**Blended average price** = Total Price ÷ Total Litre`,
      `**Total Price** across all tanks`,
    ]),
    para(`This gives an accurate per-kg and per-litre cost when stock from several tanks is mixed, so pricing and margins stay correct. It's an internal tool, visible to Admins only.`),
  ] },
  { re: /brent/, blocks: () => [
    para(`**Brent Crude** is a light, sweet crude oil from the North Sea and the world's leading **price benchmark** — roughly two-thirds of internationally traded crude is priced against it.`),
    para(`It's quoted in **US dollars per barrel (bbl)**. Because refined products (diesel, petrol) and many petrochemical feedstocks move with the crude price, Brent effectively sets the baseline for much of what this CRM trades.`),
    para(`You can see the live, indicative Brent quote on the **Live Market** panel.`),
  ] },
  { re: /\bwti\b|west texas/, blocks: () => [
    para(`**WTI (West Texas Intermediate)** is the main US crude benchmark, priced at Cushing, Oklahoma, in **USD per barrel**. It's slightly lighter and sweeter than Brent.`),
    para(`WTI usually trades a little below Brent; that gap — the **Brent–WTI spread** — reflects US vs global supply, demand and shipping. Both appear on the Live Market panel.`),
  ] },
  { re: /crude oil|crude/, blocks: () => [
    para(`**Crude oil** is unrefined petroleum, priced globally against benchmarks like **Brent** (North Sea) and **WTI** (US), in USD per barrel. Refineries turn it into diesel, petrol, LDO, furnace oil and petrochemical feedstocks — the products traded in this CRM — so crude sets the cost baseline for all of them.`),
  ] },
  { re: /natural gas|henry hub/, blocks: () => [
    para(`**Natural gas** is a gaseous hydrocarbon used as fuel and feedstock. The common benchmark is **Henry Hub**, quoted in **USD per MMBtu**. It appears on the Live Market panel alongside the crude benchmarks.`),
  ] },
  { re: /kilolit|\bkl\b|kilo litre/, blocks: () => [
    para(`**Kilolitre (KL)** is the standard bulk volume unit here — **1 KL = 1,000 litres**. Bulk fuels (diesel, petrol, LDO) trade in KL; smaller lots (lubricants) in litres. Weight is derived via density: **Kg = Litre × Density ÷ 1000**.`),
  ] },
  { re: /\b(hsd|high speed diesel|diesel)\b/, blocks: () => [
    para(`**HSD (High-Speed Diesel)** is the standard automotive and industrial diesel — BS-VI grade in India. It's traded in **KL**, and its price tracks crude benchmarks plus duties and margins. Related grades in the catalogue include LDO (Light Diesel Oil) and Furnace Oil for industrial burners.`),
  ] },
  { re: /\b(motor spirit|petrol|gasoline)\b/, blocks: () => [
    para(`**MS (Motor Spirit / petrol)** is the spark-ignition road fuel, BS-VI grade, traded in **KL**. Like diesel, its price moves with crude benchmarks plus taxes and margins.`),
  ] },
  { re: /\bgst\b|tax on|cgst|sgst|igst/, blocks: () => [
    para(`Petroleum products in this CRM carry **18% GST**. It's split as **CGST + SGST** for in-state sales, or **IGST** for inter-state sales. Every invoice shows the split and the tax-inclusive total.`),
  ] },
  { re: /overdue|invoice status|unpaid mean|partial(ly)? paid/, blocks: () => [
    para(`Invoice statuses in the CRM:`),
    bullets([
      `**UNPAID** — issued, nothing paid yet.`,
      `**PARTIAL** — part-paid, a balance remains.`,
      `**PAID** — fully settled.`,
      `**OVERDUE** — past its due date with a balance still owing.`,
    ]),
    para(`An invoice turns **overdue** when today is past **invoice date + payment terms (NET days)** and money is still owed — usually a delayed payment or a customer running past their credit terms.`),
  ] },
  { re: /credit limit|payment terms|net \d+/, blocks: () => [
    para(`**Credit limit** is the maximum outstanding balance a customer may carry. **Payment terms** are the NET days they have to pay (e.g. NET 30). When a customer's outstanding exceeds the limit, or an invoice runs past its terms, it drives the overdue/collections workflow.`),
  ] },
];

function explainConcept(s: string): AiReply | null {
  if (!EXPLAIN_CUE.test(s)) return null;
  // A price / balance / volume lookup is data, not a concept explanation.
  if (isPriceQuery(s) || isVolumeQuery(s) || /\b(price|rate|balance|outstanding|how much|how many|today|current|latest)\b/.test(s)) return null;
  for (const k of KNOWLEDGE) if (k.re.test(s)) return { blocks: k.blocks() };
  return null;
}

const GUIDES: { re: RegExp; title: string; steps: string[]; tips?: string[]; to?: string }[] = [
  { re: /invoice|bill/, title: 'Create an invoice', to: '/invoices', steps: [
    'Open **Sales → Invoices** and click **New Invoice** (or convert an accepted quotation/order).',
    'Pick the **customer** — their GST, billing address and terms fill in automatically.',
    'Add **line items**: product, quantity (KL/L) and rate; GST is applied per line.',
    'Check the **subtotal, GST (CGST/SGST/IGST) and total**, and add any transport charge.',
    '**Save** to issue it, then use the **PDF** button to download or share.',
  ], tips: ['Converting an order or quotation copies the lines for you.', 'The due date is set from the customer\'s payment terms.'] },
  { re: /payment|\bpay\b|collect|receipt/, title: 'Record a payment', to: '/payments', steps: [
    'Open **Payments** (or the customer\'s invoice).',
    'Click **Record Payment** and select the **invoice(s)** being settled.',
    'Enter the **amount**, **mode** (NEFT / RTGS / UPI / Cheque / Cash) and a **reference**.',
    'Save — the invoice moves to **Partial** or **Paid** and the customer\'s **outstanding** updates automatically.',
    'Download the **receipt** from the payment row if the customer needs it.',
  ], tips: ['Cheques are realised after clearing (2–3 working days).', 'Any overpayment can be adjusted against a future invoice.'] },
  { re: /customer|client|account/, title: 'Add a customer', to: '/customers', steps: [
    'Go to **Customers → New Customer**.',
    'Enter the company name, **GSTIN / PAN**, industry and segment.',
    'Add the **billing & shipping addresses** and at least one **contact**.',
    'Set the **credit limit** and **payment terms (NET days)**.',
    'Save — the account is ready for orders, invoices and the customer portal.',
  ] },
  { re: /quotation|proposal|quote/, title: 'Create a quotation', to: '/proposals', steps: [
    'Open **Sales → Proposals → New**.',
    'Choose the customer and add product lines with quantities and rates.',
    'Review the totals — high-value quotes may need **approval**.',
    'Send it; once accepted, **convert to an order or invoice** in one click.',
  ] },
  { re: /dispatch|deliver|track|shipment|logistics/, title: 'Schedule & track a dispatch', to: '/dispatch', steps: [
    'Open **Operations → Dispatch** and create a dispatch against the order.',
    'Assign the **vehicle, driver and route**, and set the scheduled date.',
    'Status flows **Scheduled → Loading → In Transit → Delivered** as it moves.',
    'Follow live status and current location under **Product Tracking** (or the customer portal).',
  ] },
  { re: /erp|calculator|costing|density/, title: 'Use the ERP Calculator', to: '/erp-calculator', steps: [
    'Open **ERP Calculator** (Workspace — Admin).',
    'Add a **tank** row and enter its **price (₹/L)**, **density (g/L)** and **litres**.',
    'Use **+ Add Tank** to include more tanks for a blended lot.',
    'Read the **Total KL / Kg, weighted density, blended price and total price** in the summary tiles.',
  ] },
];

function guide(s: string): AiReply | null {
  if (!/\b(how (do|can|to)\b|how do i|walk me through|guide me|show me how|steps to|step by step|process (for|of|to))\b/.test(s)) return null;
  for (const g of GUIDES) {
    if (g.re.test(s)) {
      const blocks: AiBlock[] = [para(`**${g.title}** — step by step:`), { kind: 'list', items: g.steps.map((st, i) => `${i + 1}. ${st}`) }];
      if (g.tips) blocks.push(para('**Tips:**'), bullets(g.tips));
      return g.to ? { blocks, action: { label: 'Open', to: g.to } } : { blocks };
    }
  }
  return null;
}

function comparePrices(s: string, ctx: AiContext): AiReply {
  const all = [...ctx.oil, ...ctx.fuel];
  const names = ['brent', 'wti', 'crude', 'natural gas', 'diesel', 'petrol', 'lpg', 'atf', 'cng'];
  const wanted = names.filter((n) => s.includes(n));
  let picked = all.filter((t) => wanted.some((n) => new RegExp(n, 'i').test(t.name)));
  if (picked.length < 2) picked = ctx.oil;
  const rows = picked.map((t) => [t.name, formatMarket(t), `${t.change >= 0 ? '▲' : '▼'} ${Math.abs(t.change).toFixed(2)}%`]);
  const to = route(ctx.role, 'market');
  const reply: AiReply = { blocks: [text('Here\'s how those benchmarks compare right now (indicative feed):'), { kind: 'table', columns: ['Instrument', 'Price', 'Change'], rows }] };
  if (to) reply.action = { label: 'Open Live Market', to };
  return reply;
}

export function runAssistant(query: string, ctx: AiContext): AiReply {
  // The query is already context-expanded by ChatPanel (see expandQuery); here
  // we only classify and answer.
  const s = query.toLowerCase().trim();
  if (!s) return capabilities(ctx);

  const chat = smallTalkCategory(s);
  if (chat) return smallTalkReply(chat, s);

  if (/^(help|what can you do|what do you do|how do you work)\b/.test(s)) return capabilities(ctx);

  // How-to guidance (Level 5) and concept explanations (Level 2/3) come before
  // data routing so "explain Brent" / "how do I create an invoice" get depth.
  const g = guide(s);
  if (g) return g;
  const k = explainConcept(s);
  if (k) return k;

  // Direct yes/no status questions ("are they dispatched?") answered from data.
  const yn = yesNo(s, ctx);
  if (yn) return yn;

  // "Order status of <customer>" — staff live-tracking of a named customer.
  const cs = customerOrders(s, ctx);
  if (cs) return cs;

  // "Audit log of <person>" — admin-only audit trail.
  const al = auditLogQuery(s, ctx);
  if (al) return al;

  // Trained FAQ knowledge base — high-confidence feature/how-to answers, but
  // never for a live-data request (those must reach the data handlers below).
  if (!looksLikeData(s)) {
    const faq = faqStrong(s);
    if (faq) return faq;
  }

  // Data answers stay concise, but deepen to a full breakdown when asked.
  const detail = wantsDetail(s) || DETAIL_SEEK_RE.test(s);

  const nav = navigation(s, ctx);
  if (nav) return nav;

  if (/\b(compare|comparison|versus|\bvs\b)\b/.test(s)) {
    // Two market benchmarks with no sales context → compare their live prices.
    const priceCompare = /\b(brent|wti|crude|natural gas|diesel|petrol|lpg|atf|cng)\b/.test(s)
      && !/\b(sold|sell|sales|transport|deliver|volume|litre|revenue|bought|purchas)\b/.test(s)
      && (/\b(price|prices|rate|benchmark|market)\b/.test(s) || findSubjects(s, ctx).length < 2);
    if (priceCompare) return comparePrices(s, ctx);
    const years = (s.match(/20\d{2}/g) ?? []).map(Number);
    if (years.length >= 2 && findSubjects(s, ctx).length < 2) return comparePeriods(s, ctx, years);
    return compare(s, ctx);
  }
  if (isVolumeQuery(s)) return volume(s, ctx, detail);
  if (isPriceQuery(s)) return prices(s, ctx, detail);
  if (/(calculat|weighted|avg density|average density|blend|\berp\b)/.test(s)) return erp(s, ctx);
  if (/invoice|bill/.test(s)) return invoices(s, ctx, detail);
  if (/payment|outstanding|balance|owe|receivable|\bpaid\b|pending pay/.test(s)) return payments(s, ctx, detail);
  if (/order|dispatch|transit|deliver|tracking|shipment|arriv/.test(s)) return orders(s, ctx, detail);
  if (/customer|client|active account/.test(s)) return customers(s, ctx, detail);
  if (/notification|alert|announce/.test(s)) return notifications(ctx);

  // Last resort before the generic reply: a looser FAQ match.
  if (!looksLikeData(s)) {
    const fb = faqFallback(s);
    if (fb) return fb;
  }

  return {
    blocks: [text("I can help with sales & transport volumes, invoices, payments, shipments, customers and live prices — grounded in your CRM. You can also ask me to **explain** a concept (e.g. “what is Brent crude?”) or **how to** do something (e.g. “how do I create an invoice?”).")],
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
      return ['How much diesel did we sell last year?', 'Order status of a customer', 'Which customers bought the most fuel this month?', 'Analytics for sales this year'];
    case 'SALES_EXECUTIVE':
      return ['How much petrol did we sell last month?', 'Shipments in transit', 'Show my customers', "Today's Brent price"];
    default:
      return ['How much oil did we sell last year?', 'Analytics for top customers', 'Who has pending payments?', 'Compare Brent and diesel', "Today's Brent price"];
  }
}
