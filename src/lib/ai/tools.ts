// ---------------------------------------------------------------------------
// LLM tool layer. Each tool maps a structured call from the model to the
// existing grounded rule engine (via a synthesised natural-language query), so
// answers always come from real CRM data. Role enforcement lives here, not just
// in the prompt.
// ---------------------------------------------------------------------------
import { runAssistant, type AiContext, type AiReply } from './assistant';

export const toolSchemas = [
  {
    name: 'getSalesVolume',
    description: 'Volume and/or revenue of a product sold or transported over a period. Use for "how much X did we sell / transport / deliver".',
    input_schema: {
      type: 'object',
      properties: {
        product: { type: 'string', description: 'e.g. diesel, petrol, brent/crude, lubricants — omit for all products' },
        period: { type: 'string', description: 'e.g. last year, this year, last month, last quarter, 2025, yesterday' },
        transported: { type: 'boolean', description: 'true = transport/dispatch volume; false/omit = sold/invoiced' },
        region: { type: 'string', description: 'e.g. India' },
        analytics: { type: 'boolean', description: 'true for a full table/breakdown instead of a one-line total' },
      },
      required: [],
    },
  },
  { name: 'getPrices', description: 'Live market/benchmark price for oil & fuel products.', input_schema: { type: 'object', properties: { product: { type: 'string' }, analytics: { type: 'boolean' } }, required: [] } },
  { name: 'getInvoices', description: 'Invoice counts and totals by status.', input_schema: { type: 'object', properties: { status: { type: 'string', enum: ['overdue', 'pending', 'paid', 'all'] }, analytics: { type: 'boolean' } }, required: [] } },
  { name: 'getPayments', description: 'Outstanding balance, who owes, or payments received this month.', input_schema: { type: 'object', properties: { scope: { type: 'string', enum: ['outstanding', 'received_this_month', 'who_owes'] }, analytics: { type: 'boolean' } }, required: [] } },
  { name: 'listShipments', description: 'Shipments / dispatches by status.', input_schema: { type: 'object', properties: { status: { type: 'string', enum: ['in_transit', 'delivered', 'upcoming', 'all'] }, analytics: { type: 'boolean' } }, required: [] } },
  { name: 'getCustomers', description: 'Customer count, list, or top by revenue. Staff only — not available to customer accounts.', input_schema: { type: 'object', properties: { mode: { type: 'string', enum: ['count', 'list', 'top_by_revenue'] } }, required: [] } },
  { name: 'compareProducts', description: 'Compare two or more products by volume/revenue over a period.', input_schema: { type: 'object', properties: { products: { type: 'array', items: { type: 'string' } }, period: { type: 'string' }, transported: { type: 'boolean' } }, required: ['products'] } },
  { name: 'getNotifications', description: 'The user\'s unread notifications.', input_schema: { type: 'object', properties: {}, required: [] } },
];

/** Tools offered to the model for this role (customer accounts lose aggregates). */
export function toolsForRole(ctx: AiContext) {
  return toolSchemas.filter((t) => !(ctx.role === 'CUSTOMER' && t.name === 'getCustomers'));
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** Execute a tool by synthesising a query the grounded rule engine understands. */
export function runTool(name: string, input: Record<string, unknown>, ctx: AiContext): AiReply {
  const analytics = input.analytics ? ' analytics' : '';
  const period = str(input.period) ? ' ' + str(input.period) : '';
  const region = str(input.region) ? ' ' + str(input.region) : '';
  const product = str(input.product) ? ' ' + str(input.product) : '';

  switch (name) {
    case 'getSalesVolume':
      return runAssistant(`how much${product} was ${input.transported ? 'transported' : 'sold'}${region}${period}${analytics}`, ctx);
    case 'getPrices':
      return runAssistant(`price of${product || ' oil'} today${analytics}`, ctx);
    case 'getInvoices': {
      const st = str(input.status) || 'all';
      return runAssistant(`show ${st === 'all' ? '' : st + ' '}invoices${analytics}`, ctx);
    }
    case 'getPayments': {
      if (input.scope === 'who_owes') return runAssistant(`who has pending payments${analytics}`, ctx);
      if (input.scope === 'received_this_month') return runAssistant('payments received this month', ctx);
      return runAssistant('how much is outstanding', ctx);
    }
    case 'listShipments': {
      const map: Record<string, string> = { in_transit: 'in transit', delivered: 'delivered', upcoming: 'upcoming', all: '' };
      return runAssistant(`shipments ${map[str(input.status)] ?? ''}${analytics}`, ctx);
    }
    case 'getCustomers': {
      if (ctx.role === 'CUSTOMER') return { blocks: [{ kind: 'text', text: 'That information is not available on a customer account.' }] };
      if (input.mode === 'count') return runAssistant('how many customers', ctx);
      if (input.mode === 'top_by_revenue') return runAssistant('analytics for top customers by revenue', ctx);
      return runAssistant('show customers list', ctx);
    }
    case 'compareProducts': {
      const products = Array.isArray(input.products) ? (input.products as unknown[]).filter((p): p is string => typeof p === 'string').join(' and ') : '';
      return runAssistant(`compare ${products} ${input.transported ? 'transportation' : ''}${period}`, ctx);
    }
    case 'getNotifications':
      return runAssistant('what notifications do i have', ctx);
    default:
      return { blocks: [{ kind: 'text', text: `Unknown tool: ${name}` }] };
  }
}
