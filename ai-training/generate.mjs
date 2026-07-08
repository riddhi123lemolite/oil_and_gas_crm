// Expands the canonical intents (base 52 + new) into a large, deduped question
// corpus mapped to grounded answers, and rebuilds the app's compact retrieval
// index (src/lib/ai/faqData.ts). Deterministic — no randomness — so re-runs are
// stable. Run: node ai-training/generate.mjs
import fs from 'fs';
import { NEW_INTENTS } from './intents.mjs';

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'do', 'does', 'how', 'what', 'who', 'when', 'where', 'which', 'why', 'can', 'you', 'your', 'me', 'my', 'i', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'it', 'this', 'that', 'with', 'about', 'from', 'have', 'has', 'see', 'show', 'tell', 'want', 'need', 'get', 'am', 'be']);
const VERB = /^(change|switch|create|add|record|download|track|export|import|reset|convert|log|view|find|use|set|raise|open|edit|delete|update|generate|calculate|see|make|schedule|assign|contact|enable|disable|turn|collapse|hide|filter|sort|move|drag|check|build|run|manage|mark|clear|start|allocate|advance|recover|restore|undo|post|onboard|access)\b/;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const uniq = (a) => [...new Set(a)];

// --- assemble intents -------------------------------------------------------
const base = JSON.parse(fs.readFileSync('ai-training/intents.base.json', 'utf8'));
const baseIntents = base.map((r, i) => {
  const q = r.question.toLowerCase().replace(/[?.!]/g, '').trim();
  const topic = q.replace(/^(how do i|how can i|how to|what is the|what is|what are the|what are|which|where is the|where is|where are|can i|can customers|is this|is it possible to|does the|do the|when does|who can|why do|why can'?t i)\s+/, '').trim();
  const act = [], noun = [];
  if (topic && topic.length > 3 && topic.split(' ').length <= 6) (VERB.test(topic) ? act : noun).push(topic);
  for (const k of r.keywords) {
    const kw = k.toLowerCase();
    if (kw.split(' ').length >= 2 && kw.length <= 32) (VERB.test(kw) ? act : noun).push(kw);
  }
  return { id: 'base_' + i, cat: r.category, a: r.answer, keywords: r.keywords, feat: r.related_features, src: r.source, ask: [r.question], act: uniq(act).slice(0, 3), noun: uniq(noun).slice(0, 3) };
});
const newIntents = NEW_INTENTS.map((n) => ({
  id: n.id, cat: n.cat, a: n.a, keywords: uniq([...(n.kw || []), ...(n.act || []), ...(n.noun || [])]),
  feat: n.feat || [], src: n.src, ask: n.ask || [], act: n.act || [], noun: n.noun || [],
}));
const intents = [...baseIntents, ...newIntents];

// --- expansion --------------------------------------------------------------
const PRE_ACT = ['how do i', 'how can i', 'how to', 'can i', 'is it possible to', 'i want to', 'i need to', 'help me', 'show me how to', 'where do i', 'steps to', 'is there a way to', 'can you help me', 'how would i', 'what is the way to', 'i would like to', 'what is the process to', 'guide me to', 'walk me through how to', 'i am trying to', 'how would i go about', 'any way to', 'i wish to', 'tell me how to', 'how do you', 'what are the steps to'];
const PRE_NOUN = ['what is', 'what are', 'tell me about', 'explain', 'which', 'where is', 'i am confused about', 'what does', 'is there', 'list the', 'show me', 'give me an overview of', 'help me understand', 'brief me on', 'i want to understand', 'what exactly is', 'can you explain', 'meaning of', 'details of'];
const PRE_PROB = ["why can't i", "i can't", "i'm unable to", 'i cannot', "it won't let me"];
const PRE_YESNO = ['does the system let me', 'can multiple users', 'am i able to'];

function baseQuestions(it) {
  const out = new Set(it.ask);
  for (const t of it.act) {
    for (const p of PRE_ACT) out.add(cap(`${p} ${t}`));
    for (const p of PRE_PROB) out.add(cap(`${p} ${t}`));
    for (const p of PRE_YESNO) out.add(cap(`${p} ${t}`));
  }
  for (const t of it.noun) for (const p of PRE_NOUN) out.add(cap(`${p} ${t}`));
  return [...out];
}

function typo(q) {
  const words = q.replace(/[?.]/g, '').split(' ');
  let bi = -1, bl = 0;
  for (let i = 0; i < words.length; i += 1) if (words[i].length > bl && /^[a-z]+$/i.test(words[i])) { bl = words[i].length; bi = i; }
  if (bi < 0 || bl < 5) return null;
  const w = words[bi];
  words[bi] = w.slice(0, 2) + w.slice(3); // drop 3rd letter
  return words.join(' ').toLowerCase();
}

// A second typo maker: drop the last vowel of the longest word (e.g. invoice->invoce).
function typo2(q) {
  const words = q.replace(/[?.]/g, '').split(' ');
  let bi = -1, bl = 0;
  for (let i = 0; i < words.length; i += 1) if (words[i].length > bl && /^[a-z]+$/i.test(words[i])) { bl = words[i].length; bi = i; }
  if (bi < 0 || bl < 5) return null;
  const w = words[bi];
  const vi = w.slice(1).search(/[aeiou]/i);
  if (vi < 0) return null;
  words[bi] = w.slice(0, vi + 1) + w.slice(vi + 2);
  return words.join(' ').toLowerCase();
}

function variants(q, gi) {
  const clean = q.replace(/\s+/g, ' ').trim();
  const lc = clean.toLowerCase().replace(/[?.]/g, '');
  const set = new Set();
  set.add(/[?.]$/.test(clean) ? clean : clean + '?');       // canonical, punctuated
  set.add(lc);                                              // lowercase, no punctuation
  // Casual / polite framings — deterministic by index so re-runs stay stable.
  if (gi % 3 === 0) set.add('hey, ' + lc + '?');
  if (gi % 4 === 1) set.add(lc + ' please?');
  if (gi % 5 === 0) set.add(lc + ' pls');
  if (gi % 2 === 0) set.add(clean.charAt(0).toUpperCase() + lc.slice(1)); // Capitalised, no punct
  // Abbreviations / SMS-speak.
  const ab = lc.replace(/\byou\b/g, 'u').replace(/\bplease\b/g, 'pls').replace(/\bcannot\b/g, 'cant').replace(/\baccount\b/g, 'acct').replace(/\binvoice\b/g, 'inv').replace(/\bcustomer\b/g, 'cust').replace(/\bquotation\b/g, 'quote').replace(/\bnumber\b/g, 'no').replace(/\bpayment\b/g, 'pmt');
  if (ab !== lc) set.add(ab);
  // Typos.
  if (gi % 4 === 0) { const t = typo(clean); if (t) set.add(t); }
  if (gi % 4 === 3) { const t = typo2(clean); if (t) set.add(t); }
  return [...set];
}

const CAP_PER_INTENT = 150;
const CAP_TOTAL = 100000; // effectively uncapped — every intent expands fully
const seen = new Set();
const records = [];
let gi = 0;
outer: for (const it of intents) {
  const kws = uniq(it.keywords.map((x) => x.toLowerCase())).slice(0, 14);
  for (const bq of baseQuestions(it).slice(0, CAP_PER_INTENT)) {
    for (const v of variants(bq, gi++)) {
      const key = norm(v);
      if (key.length < 4 || seen.has(key)) continue;
      seen.add(key);
      records.push({ category: it.cat, question: v, answer: it.a, keywords: kws, related_features: it.feat, source: it.src });
      if (records.length >= CAP_TOTAL) break outer;
    }
  }
}

// --- compact app index (one record per intent, enriched keywords) -----------
function enriched(it) {
  const kws = new Set(it.keywords.map((x) => x.toLowerCase()));
  it.act.forEach((t) => kws.add(t.toLowerCase()));
  it.noun.forEach((t) => kws.add(t.toLowerCase()));
  it.ask.forEach((q) => norm(q).split(' ').filter((w) => w.length >= 4 && !STOP.has(w)).forEach((w) => kws.add(w)));
  return [...kws].slice(0, 32);
}
const faq = intents.map((it) => ({
  category: it.cat,
  question: it.ask[0] || cap(it.act[0] || it.noun[0] || 'this feature'),
  answer: it.a,
  keywords: enriched(it),
  related_features: it.feat,
  source: it.src,
}));

// --- write outputs ----------------------------------------------------------
fs.writeFileSync('ai-training/training-data.json', JSON.stringify(records, null, 2) + '\n');

const qjson = records.map((r) => ({ category: r.category, question: r.question }));
fs.writeFileSync('ai-training/questions.json', JSON.stringify(qjson, null, 2) + '\n');

const byCat = {};
for (const r of records) (byCat[r.category] ??= []).push(r.question);
let md = `# CRM AI Assistant — Question Bank\n\n**${records.length} questions** across ${Object.keys(byCat).length} categories, mapped to ${intents.length} grounded answers (see \`training-data.json\`). Generated from \`intents.base.json\` + \`intents.mjs\` via \`generate.mjs\`.\n\n`;
md += '| Category | Questions |\n|---|---|\n';
for (const [c, qs] of Object.entries(byCat).sort((a, b) => b[1].length - a[1].length)) md += `| ${c} | ${qs.length} |\n`;
md += '\n';
for (const [c, qs] of Object.entries(byCat)) {
  md += `## ${c} (${qs.length})\n\n`;
  for (const q of qs.slice(0, 25)) md += `- ${q}\n`;
  if (qs.length > 25) md += `- …and ${qs.length - 25} more (see questions.json)\n`;
  md += '\n';
}
fs.writeFileSync('ai-training/questions.md', md);

fs.writeFileSync('ai-training/intents.json', JSON.stringify(faq, null, 2) + '\n');

const header = '// AUTO-GENERATED by ai-training/generate.mjs — do not edit by hand.\n// One record per grounded intent (base 52 + new), keywords enriched with\n// paraphrases for retrieval. The full question corpus is ai-training/training-data.json.\n\n';
const iface = 'export interface FaqRecord {\n  category: string;\n  question: string;\n  answer: string;\n  keywords: string[];\n  related_features: string[];\n  source: string;\n}\n\n';
fs.writeFileSync('src/lib/ai/faqData.ts', header + iface + 'export const FAQ_DATA: FaqRecord[] = ' + JSON.stringify(faq, null, 2) + ';\n');

console.log(`intents: ${intents.length} (base ${baseIntents.length} + new ${newIntents.length})`);
console.log(`questions: ${records.length}`);
console.log(`categories: ${Object.keys(byCat).length}`);
console.log('wrote: training-data.json, questions.json, questions.md, intents.json, src/lib/ai/faqData.ts');
