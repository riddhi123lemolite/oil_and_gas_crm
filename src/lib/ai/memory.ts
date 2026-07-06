// ---------------------------------------------------------------------------
// Cross-session AI memory. Persists, per signed-in user, a short list of recent
// queries and durable facts/preferences so the assistant can "take references
// from previous chats". Retrieved into the engine context each turn; the LLM
// engine injects it into the system prompt, the rule engine uses recent queries
// to resolve follow-ups that span conversations.
// ---------------------------------------------------------------------------
import { readStorage, writeStorage } from '@/lib/storage';

export type MemoryKind = 'preference' | 'fact';

export interface MemoryFact {
  id: string;
  text: string;
  kind: MemoryKind;
  updatedAt: string;
}

export interface AiMemory {
  facts: MemoryFact[];
  recentQueries: string[];
  updatedAt: string;
}

const BASE = 'oilgas-crm:ai-memory';
const keyFor = (userId?: string | null) => `${BASE}:${userId || 'demo'}`;
const EMPTY: AiMemory = { facts: [], recentQueries: [], updatedAt: '' };
const MAX_FACTS = 40;
const MAX_QUERIES = 8;

const norm = (t: string) => t.toLowerCase().replace(/\s+/g, ' ').trim();

export function readMemory(userId?: string | null): AiMemory {
  return readStorage<AiMemory>(keyFor(userId), EMPTY);
}

function write(userId: string | null | undefined, mem: AiMemory): void {
  writeStorage(keyFor(userId), { ...mem, updatedAt: new Date().toISOString() });
}

/** Remember the latest user query (deduped, capped) for cross-session follow-ups. */
export function rememberQuery(userId: string | null | undefined, query: string): void {
  const q = query.trim();
  if (!q) return;
  const mem = readMemory(userId);
  const recentQueries = [q, ...mem.recentQueries.filter((x) => norm(x) !== norm(q))].slice(0, MAX_QUERIES);
  write(userId, { ...mem, recentQueries });
}

/** Store a durable fact or preference (deduped, capped, newest first). */
export function rememberFact(userId: string | null | undefined, text: string, kind: MemoryKind = 'fact'): void {
  const t = text.trim();
  if (!t) return;
  const mem = readMemory(userId);
  const facts = [
    { id: `f_${norm(t).slice(0, 24)}`, text: t, kind, updatedAt: new Date().toISOString() },
    ...mem.facts.filter((f) => norm(f.text) !== norm(t)),
  ].slice(0, MAX_FACTS);
  write(userId, { ...mem, facts });
}

/** Recency + token-overlap ranked recall to inject into engine context. */
export function recallRelevant(userId: string | null | undefined, query: string, limit = 6): string[] {
  const mem = readMemory(userId);
  const qTokens = new Set(norm(query).split(/[^a-z0-9]+/).filter((w) => w.length > 2));
  const score = (t: string) =>
    norm(t).split(/[^a-z0-9]+/).filter(Boolean).reduce((n, w) => n + (qTokens.has(w) ? 1 : 0), 0);
  const facts = mem.facts.map((f) => ({ text: f.text, s: score(f.text) + (f.kind === 'preference' ? 1.5 : 0) }));
  const queries = mem.recentQueries.map((q, i) => ({ text: q, s: score(q) + (mem.recentQueries.length - i) * 0.1 }));
  return [...facts, ...queries]
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.text);
}

export function forgetMemory(userId?: string | null): void {
  write(userId, EMPTY);
}

/** Lightweight heuristic capture of stated preferences from a user turn. */
export function capturePreference(userId: string | null | undefined, userText: string): void {
  const s = userText.toLowerCase();
  const rules: [RegExp, string][] = [
    [/always show (me )?(a )?tables?|prefer tables|as a table always/, 'Prefers detailed tables in answers'],
    [/keep it (short|brief|concise)|be concise|one[- ]line answers?/, 'Prefers concise one-line answers'],
    [/in litres|show litres|prefer litres/, 'Prefers volumes shown in litres'],
    [/in (kl|kilolit)/, 'Prefers volumes shown in KL'],
  ];
  for (const [re, label] of rules) if (re.test(s)) rememberFact(userId, label, 'preference');
  const called = s.match(/call me ([a-z]{2,20})/);
  if (called?.[1]) rememberFact(userId, `Prefers to be called ${called[1]}`, 'preference');
}
