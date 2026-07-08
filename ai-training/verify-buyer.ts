// Offline coverage check for the buyer / customer question space.
//
// Combinatorially generates thousands of varied buyer-ranking phrasings
// (different nouns, superlatives, purchase verbs, products, periods, metrics
// and sentence shapes) and runs each through the REAL detector the assistant
// uses (src/lib/ai/buyerIntent.ts). Reports how many are recognised and prints
// a sample of any misses.
//
// Run: npx tsx ai-training/verify-buyer.ts
import { isBuyerRankingQuery } from '../src/lib/ai/buyerIntent';

const BUYER = ['customer', 'client', 'buyer', 'party', 'account', 'purchaser', 'firm', 'company', 'dealer', 'patron', 'consignee'];
const BUYERS = ['customers', 'clients', 'buyers', 'parties', 'accounts', 'purchasers', 'firms', 'companies', 'dealers'];
const TOP = ['highest', 'biggest', 'largest', 'top', 'leading', 'most', 'greatest', 'number one', 'best', 'maximum'];
const BOTTOM = ['lowest', 'smallest', 'least', 'minimum', 'bottom', 'worst', 'fewest'];
const BUY = ['purchased', 'bought', 'procured', 'lifted', 'spent on', 'ordered'];
const PRODUCT = ['', 'diesel', 'petrol', 'LDO', 'furnace oil', 'lubricants', 'solvents', 'HSD', 'MEG', 'fuel'];
const PERIOD = ['', 'this month', 'last month', 'this year', 'last year', 'last quarter', 'in 2025', 'in 2026'];
const METRIC = ['', 'by value', 'by revenue', 'by volume', 'by quantity', 'by spend', 'by purchase value'];

const squish = (s: string) => s.replace(/\s+/g, ' ').trim();

function* generate(): Generator<string> {
  for (const sup of TOP) {
    for (const b of BUYER) {
      for (const p of PERIOD) {
        yield squish(`who is the ${sup} ${b} ${p}?`);
        yield squish(`which ${b} had the ${sup} purchase ${p}?`);
        yield squish(`name the ${sup} ${b} ${p}`);
        yield squish(`who was the ${sup} ${b} ${p}?`);
      }
      for (const m of METRIC) yield squish(`${sup} ${b} ${m}`);
    }
    for (const bs of BUYERS) {
      for (const m of METRIC) {
        for (const p of PERIOD) {
          yield squish(`top ${bs} ${m} ${p}`);
          yield squish(`rank ${bs} ${m} ${p}`);
          yield squish(`show me the ${sup} ${bs} ${m} ${p}`);
          yield squish(`list the ${sup} ${bs} ${p}`);
        }
      }
      yield squish(`top 5 ${bs} by purchase`);
      yield squish(`top 10 ${bs} by value`);
    }
    for (const v of BUY) {
      for (const prod of PRODUCT) {
        for (const p of PERIOD) {
          yield squish(`who ${v} the most ${prod} ${p}?`);
          yield squish(`which customer ${v} the ${sup} ${prod} ${p}?`);
        }
      }
    }
  }
  for (const sup of BOTTOM) {
    for (const b of BUYER) {
      yield squish(`who is the ${sup} ${b}?`);
      yield squish(`which ${b} had the ${sup} purchase?`);
      for (const p of PERIOD) yield squish(`${sup} ${b} ${p}`);
    }
    for (const bs of BUYERS) yield squish(`rank ${bs} from ${sup} to highest`);
  }
}

const seen = new Set<string>();
const questions: string[] = [];
for (const q of generate()) {
  const k = q.toLowerCase();
  if (!seen.has(k)) { seen.add(k); questions.push(q); }
}

const misses: string[] = [];
let ok = 0;
for (const q of questions) {
  if (isBuyerRankingQuery(q)) ok += 1;
  else misses.push(q);
}

const pct = ((ok / questions.length) * 100).toFixed(2);
console.log(`Buyer-question coverage: ${ok}/${questions.length} recognised (${pct}%)`);
if (misses.length) {
  console.log(`\nMissed ${misses.length}. Sample:`);
  for (const m of misses.slice(0, 30)) console.log('  ✗', m);
} else {
  console.log('All generated buyer/customer ranking phrasings were recognised. ✅');
}
