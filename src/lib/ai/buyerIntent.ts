// ---------------------------------------------------------------------------
// Buyer / customer intent recognition (pure, dependency-free).
//
// This module isolates the *vocabulary* that lets the assistant recognise the
// full range of buyer / customer / party questions a trader actually asks —
// "who was the highest buyer?", "which party had the highest purchase?",
// "rank customers by spend", "top 5 clients by volume", "who bought the most
// diesel last month?", "smallest buyer this year", etc.
//
// It is kept free of app imports on purpose so it can be exercised by the
// offline question-bank verifier (ai-training/verify-buyer.mjs) without pulling
// in the whole app. assistant.ts consumes it to route to a grounded handler.
// ---------------------------------------------------------------------------

/** Nouns that name a customer / buyer in day-to-day trading language. */
export const BUYER_NOUN =
  /\b(customers?|clients?|buyers?|parties|party|accounts?|purchasers?|firms?|companies|company|dealers?|patrons?|consignees?|off[ -]?takers?|spenders?|clientele|customer base)\b/;

/** Verbs / nouns that signal a purchase (buy-side of a transaction). */
export const PURCHASE_WORD =
  /\b(purchas\w*|bought|buy|buys|buying|procur\w*|lift\w*|off[ -]?take|off[ -]?takes|off[ -]?took|spend|spends|spent|spending|spender|consum\w*|uplift\w*|took|taken|ordered|orders|ordering)\b/;

/** Superlatives that point at the *top* of a ranking. */
export const TOP_SUPER =
  /\b(top|highest|biggest|largest|leading|most|maximum|max|greatest|best|number ?one|no\.? ?1|#1|number 1)\b/;

/** Superlatives that point at the *bottom* of a ranking. */
export const BOTTOM_SUPER =
  /\b(lowest|smallest|least|minimum|min|bottom|worst|fewest|poorest|weakest)\b/;

/** Explicit ranking / league-table cues (with or without a superlative). */
export const RANK_CUE =
  /\b(rank|ranking|ranked|league table|leaderboard|top \d+|bottom \d+|first \d+|sort(ed)? by|order(ed)? by|arrange(d)? by|breakdown by|split by|by (purchase|purchases|volume|revenue|spend|value)|list of (top|the top)|standings)\b/;

/** Interrogatives that expect a customer / party as the answer. */
export const WHO_WHICH =
  /\b(who|which|whose|whom|name the|identify|tell me who|find the|what customer|what party|what client|what company)\b/;

/** Revenue / money framing. */
export const MONEY_METRIC =
  /\b(revenue|turnover|value|worth|amount|money|spend|spent|spending|₹|rupees?|billing|billed|sales value|purchase value|financially|monetary|in ₹|in rupees|by value|highest value)\b/;

/** Volume / quantity framing. */
export const VOLUME_METRIC =
  /\b(volume|quantity|litre|liter|litres|liters|kilolit\w*|\bkl\b|\bkls\b|tonnage|\bmt\b|by volume|by quantity|most fuel|most diesel|most petrol|most oil|in kl|in litres)\b/;

const superl = (s: string) => TOP_SUPER.test(s) || BOTTOM_SUPER.test(s);

/**
 * True when the message is a buyer / customer *ranking* question — the assistant
 * should compute a leaderboard (or a single leader) of customers by purchase.
 */
export function isBuyerRankingQuery(s: string): boolean {
  const q = s.toLowerCase();

  // "top customers", "biggest clients", "rank parties", "customer leaderboard"
  if (BUYER_NOUN.test(q) && (superl(q) || RANK_CUE.test(q))) return true;

  // "who bought the most", "which party purchased the highest", "who spends most"
  if (WHO_WHICH.test(q) && PURCHASE_WORD.test(q) && (superl(q) || /\b(most|least)\b/.test(q))) return true;

  // "highest purchase", "biggest buyer", "top spender", "largest account"
  if (/\b(top|highest|biggest|largest|leading|lowest|smallest|least|maximum|minimum|greatest)\s+(purchas\w*|buyers?|spend\w*|off[ -]?take|customers?|clients?|part(y|ies)|accounts?|dealers?|purchasers?|consignees?)\b/.test(q)) return true;

  // "rank customers by purchase", "sort clients by spend", "top 5 buyers"
  if (RANK_CUE.test(q) && (BUYER_NOUN.test(q) || PURCHASE_WORD.test(q))) return true;

  return false;
}

/** A metric preference read off the wording; 'auto' shows both value & volume. */
export type BuyerMetric = 'revenue' | 'volume' | 'auto';

export interface BuyerQuery {
  direction: 'top' | 'bottom';
  metric: BuyerMetric;
  /** How many to list. */
  limit: number;
}

/** Extract ranking direction, metric and list size from the wording. */
export function parseBuyerQuery(s: string, detail: boolean): BuyerQuery {
  const q = s.toLowerCase();
  const direction: 'top' | 'bottom' =
    BOTTOM_SUPER.test(q) && !TOP_SUPER.test(q) ? 'bottom' : 'top';

  let metric: BuyerMetric = 'auto';
  if (MONEY_METRIC.test(q) && !VOLUME_METRIC.test(q)) metric = 'revenue';
  else if (VOLUME_METRIC.test(q) && !MONEY_METRIC.test(q)) metric = 'volume';

  // "top 5 buyers", "first 3 customers", "10 biggest clients"
  let limit = detail ? 10 : 3;
  const m =
    q.match(/\b(?:top|bottom|first|last|show|list)\s+(\d{1,2})\b/) ??
    q.match(/\b(\d{1,2})\s+(?:top|biggest|largest|highest|smallest|lowest)?\s*(?:customers?|clients?|buyers?|parties|accounts?|purchasers?)\b/);
  if (m?.[1]) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 50) limit = n;
  }
  return { direction, metric, limit };
}
