// ---------------------------------------------------------------------------
// Sarvadesk AI proxy — a thin, key-holding relay between the CRM frontend and
// the Anthropic Messages API. The browser never sees the API key; this service
// injects it server-side. All CRM data and tool execution stay in the browser,
// so this proxy only ever relays the model call + the tool_result JSON the
// signed-in user can already see.
//
// Run on the VPS behind nginx at /api/ai/. See README.md.
// ---------------------------------------------------------------------------
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const {
  ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL = 'claude-sonnet-5',
  ALLOWED_ORIGIN = 'https://crm.sarvadesk.com',
  PORT = '8787',
  MAX_TOKENS = '1024',
} = process.env;

if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY — set it in server/.env');
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: ALLOWED_ORIGIN.split(',').map((s) => s.trim()) }));

// Naive per-IP rate limit so a compromised frontend can't run up cost.
const hits = new Map();
app.use((req, res, next) => {
  const now = Date.now();
  const rec = hits.get(req.ip) ?? { n: 0, t: now };
  if (now - rec.t > 60_000) { rec.n = 0; rec.t = now; }
  rec.n += 1;
  hits.set(req.ip, rec);
  if (rec.n > 30) return res.status(429).json({ error: 'rate limited' });
  next();
});

app.get('/api/ai/health', (_req, res) => res.json({ ok: true, model: ANTHROPIC_MODEL }));

app.post('/api/ai/messages', async (req, res) => {
  try {
    const { system, messages, tools } = req.body ?? {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages[] required' });

    // Model id and max_tokens are clamped here (not trusted from the client).
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: Number(MAX_TOKENS) || 1024,
        ...(system ? { system } : {}),
        messages,
        ...(Array.isArray(tools) && tools.length ? { tools } : {}),
      }),
    });

    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error('proxy error:', err?.message);
    res.status(502).json({ error: 'upstream error' });
  }
});

app.listen(Number(PORT) || 8787, '127.0.0.1', () =>
  console.log(`AI proxy listening on 127.0.0.1:${PORT} → ${ANTHROPIC_MODEL}`),
);
