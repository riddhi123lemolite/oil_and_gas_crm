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
