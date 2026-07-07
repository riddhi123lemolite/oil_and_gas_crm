// ---------------------------------------------------------------------------
// FAQ knowledge base retrieval. Answers "how does X work / what is Y / can I Z"
// questions about the CRM's features from a grounded, hand-authored dataset
// (faqData.ts, generated from ai-training/training-data.json).
//
// Retrieval is keyword + question-token scoring — no external index needed. Two
// confidence gates: faqStrong() runs before data routing (only fires on a clear
// feature question); faqFallback() runs as a last resort before the generic
// reply. answers are parsed into text/list blocks so they render naturally.
// ---------------------------------------------------------------------------
import type { AiReply, AiBlock } from './assistant';
import { FAQ_DATA, type FaqRecord } from './faqData';

const STOP = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'how', 'what', 'who', 'when',
  'where', 'which', 'why', 'can', 'could', 'would', 'should', 'you', 'your', 'me', 'my', 'i', 'to',
  'of', 'in', 'on', 'for', 'and', 'or', 'it', 'this', 'that', 'there', 'with', 'about', 'from', 'have',
  'has', 'get', 'see', 'show', 'tell', 'want', 'need', 'any', 'all', 'some', 'they', 'we', 'us', 'our',
]);

const tokens = (s: string): string[] =>
  (s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => w.length >= 3 && !STOP.has(w));

/** Split a keyword into its significant words (a keyword matches only when ALL
 *  of its words appear in the query, so "download invoice" hits "download my
 *  invoices"). */
const kwWords = (k: string): string[] => k.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);

interface Prepared {
  rec: FaqRecord;
  kw: string[][];
  tok: Set<string>;
}

const PREPARED: Prepared[] = FAQ_DATA.map((rec) => ({
  rec,
  kw: rec.keywords.map(kwWords).filter((a) => a.length > 0),
  tok: new Set(tokens(rec.question)),
}));

interface Match { rec: FaqRecord; kwHits: number; score: number }

function bestMatch(query: string): Match | null {
  const q = query.toLowerCase();
  const qTok = new Set(tokens(q));
  let best: Match | null = null;
  for (const p of PREPARED) {
    const kwHits = p.kw.reduce((n, words) => n + (words.every((w) => q.includes(w)) ? 1 : 0), 0);
    let overlap = 0;
    for (const t of qTok) if (p.tok.has(t)) overlap += 1;
    const score = kwHits * 3 + overlap;
    if (!best || score > best.score) best = { rec: p.rec, kwHits, score };
  }
  return best;
}

/** Parse an answer (paragraphs separated by blank lines, "- " bullets, "1." steps). */
function toBlocks(answer: string): AiBlock[] {
  const out: AiBlock[] = [];
  for (const chunk of answer.split(/\n\n+/)) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.every((l) => /^- /.test(l))) {
      out.push({ kind: 'list', items: lines.map((l) => l.replace(/^- /, '')) });
    } else if (lines.every((l) => /^\d+\.\s/.test(l))) {
      out.push({ kind: 'list', items: lines });
    } else {
      out.push({ kind: 'text', text: lines.join(' ') });
    }
  }
  return out.length ? out : [{ kind: 'text', text: answer }];
}

const reply = (rec: FaqRecord): AiReply => ({ blocks: toBlocks(rec.answer) });

/** High-confidence match — safe to run before data routing. */
export function faqStrong(query: string): AiReply | null {
  const m = bestMatch(query);
  if (m && (m.kwHits >= 2 || m.score >= 7)) return reply(m.rec);
  return null;
}

/** Looser match — last resort before the generic fallback. */
export function faqFallback(query: string): AiReply | null {
  const m = bestMatch(query);
  if (m && m.kwHits >= 1 && m.score >= 4) return reply(m.rec);
  return null;
}

/** For validation/testing: the top-matched record id (question) for a query. */
export function faqDebug(query: string): { question: string; kwHits: number; score: number } | null {
  const m = bestMatch(query);
  return m ? { question: m.rec.question, kwHits: m.kwHits, score: m.score } : null;
}

// ---------------------------------------------------------------------------
// Spelling correction toward the CRM vocabulary. Fixes typos on the words that
// matter (product, module and finance terms) so misspelled questions still
// route correctly — e.g. "how much diesle did we sel last yr" -> "…diesel…sell…".
// Common English words are left untouched to avoid mangling normal language.
// ---------------------------------------------------------------------------
const CURATED = ['invoice', 'invoices', 'payment', 'payments', 'customer', 'customers', 'order', 'orders', 'dispatch', 'delivery', 'quotation', 'quotations', 'proposal', 'proposals', 'currency', 'currencies', 'language', 'languages', 'dashboard', 'report', 'reports', 'analytics', 'outstanding', 'overdue', 'pending', 'sales', 'purchase', 'credit', 'debit', 'receipt', 'receipts', 'vehicle', 'vehicles', 'driver', 'drivers', 'inventory', 'stock', 'notification', 'notifications', 'calendar', 'tasks', 'attendance', 'staff', 'admin', 'permission', 'permissions', 'portal', 'market', 'brent', 'crude', 'diesel', 'petrol', 'kerosene', 'lubricant', 'lubricants', 'solvent', 'solvents', 'glycol', 'glycols', 'price', 'prices', 'density', 'calculator', 'tank', 'litre', 'litres', 'kilolitre', 'dispatched', 'delivered', 'transport', 'routes', 'route', 'logistics', 'shipment', 'shipments', 'tracking', 'pipeline', 'leads', 'segment', 'segments', 'contact', 'contacts', 'company', 'integration', 'integrations', 'audit', 'settings', 'discount', 'margin', 'margins', 'profit', 'revenue', 'turnover', 'balance', 'limit', 'terms', 'gstin', 'challan', 'einvoice', 'summary', 'export', 'download', 'upload', 'filter', 'search', 'assistant', 'conversation', 'manager', 'executive', 'accounts', 'create', 'convert', 'approve', 'approval', 'schedule', 'assign', 'weighted', 'kilolitres', 'supported', 'switch', 'delete', 'update', 'record'];
const VOCAB = new Set([...CURATED, ...PREPARED.flatMap((p) => p.kw.flat())]);
const COMMON = new Set(['what', 'when', 'where', 'which', 'while', 'would', 'could', 'should', 'about', 'there', 'their', 'these', 'those', 'other', 'older', 'under', 'after', 'before', 'again', 'please', 'thanks', 'thank', 'hello', 'great', 'sorry', 'right', 'wrong', 'maybe', 'money', 'value', 'total', 'number', 'people', 'using', 'being', 'doing', 'going', 'still', 'never', 'always', 'every', 'something', 'anything', 'nothing', 'because', 'between', 'through', 'around', 'different', 'available', 'information', 'account', 'system', 'change', 'check', 'click', 'have', 'this', 'that', 'with', 'from', 'your', 'need', 'want', 'help', 'able', 'does', 'done', 'know', 'here', 'them', 'they', 'much', 'many', 'some', 'more', 'most', 'work', 'find', 'make', 'give', 'show', 'tell',
  // frequent words that must NOT be "corrected" into a lookalike CRM term
  'sell', 'sold', 'sale', 'buy', 'buying', 'bought', 'self', 'service', 'services', 'option', 'options', 'detail', 'details', 'month', 'year', 'week', 'today', 'open', 'list', 'view', 'page', 'item', 'items', 'data', 'name', 'part', 'type', 'kind', 'used', 'uses', 'back', 'into', 'over', 'only', 'also', 'just', 'like', 'very', 'well', 'good', 'best', 'next', 'last', 'each', 'both', 'same', 'such', 'said', 'look', 'come', 'take', 'real', 'live', 'time', 'date', 'send', 'read', 'seen', 'told', 'made', 'used', 'text', 'line', 'note', 'form', 'field', 'button', 'screen', 'error', 'reset', 'login', 'enter', 'save', 'edit', 'add', 'new', 'all', 'any', 'how', 'why', 'who']);

function editDist1(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i += 1; j += 1; continue; }
    edits += 1;
    if (edits > 1) return false;
    if (la > lb) i += 1;
    else if (lb > la) j += 1;
    else { i += 1; j += 1; }
  }
  if (i < la || j < lb) edits += 1;
  return edits <= 1;
}

/** True if b is a with one adjacent-character swap (transposition), e.g. diesle→diesel. */
function isTranspose(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const diff: number[] = [];
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) diff.push(i);
  if (diff.length !== 2) return false;
  const [x, y] = diff as [number, number];
  return y === x + 1 && a[x] === b[y] && a[y] === b[x];
}

/** Correct a query's words toward the CRM vocabulary (typos only, conservative). */
export function correctSpelling(query: string): string {
  return query.replace(/[A-Za-z]+/g, (word) => {
    const w = word.toLowerCase();
    if (w.length < 4 || VOCAB.has(w) || COMMON.has(w)) return word;
    for (const v of VOCAB) if (Math.abs(v.length - w.length) <= 1 && (editDist1(w, v) || isTranspose(w, v))) return v;
    return word;
  });
}
