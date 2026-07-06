// ---------------------------------------------------------------------------
// LLM engine. Talks to the Anthropic Messages API through a same-origin backend
// proxy (which holds the API key) and runs a client-side tool-calling loop:
// model -> tool_use -> execute grounded tool locally -> tool_result -> model.
//
// It is OFF unless VITE_LLM_ENABLED=true and a proxy is reachable. selectEngine()
// falls back to the grounded rule engine whenever the LLM is disabled or errors,
// so the UI never breaks and answers stay grounded in real CRM data.
// ---------------------------------------------------------------------------
import { AI_PROXY_URL, LLM_ENABLED } from '@/lib/config';
import { ruleEngine, runAssistant, type AiEngine, type AiReply, type AiBlock } from './assistant';
import { buildSystemPrompt } from './prompt';
import { toolsForRole, runTool } from './tools';

interface TextContent { type: 'text'; text: string }
interface ToolUseContent { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
type Content = TextContent | ToolUseContent | { type: string; [k: string]: unknown };
interface AnthropicResponse { stop_reason?: string; content?: Content[] }
interface Msg { role: 'user' | 'assistant'; content: unknown }

async function callProxy(body: unknown): Promise<AnthropicResponse> {
  const res = await fetch(`${AI_PROXY_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI proxy ${res.status}`);
  return (await res.json()) as AnthropicResponse;
}

/** Serialise a grounded tool reply into compact JSON the model can read. */
function toToolResult(reply: AiReply): string {
  return JSON.stringify(
    reply.blocks.map((b) => {
      if (b.kind === 'text') return { text: b.text.replace(/\*\*/g, '') };
      if (b.kind === 'list') return { list: b.items.map((i) => i.replace(/\*\*/g, '')) };
      return { table: { columns: b.columns, rows: b.rows } };
    }),
  );
}

/** Model's concise lead text + any analytics tables/lists the tools produced. */
function assembleReply(lead: string, lastTool: AiReply | null): AiReply {
  const blocks: AiBlock[] = [];
  if (lead) blocks.push({ kind: 'text', text: lead });
  if (lastTool) for (const b of lastTool.blocks) if (b.kind === 'table' || b.kind === 'list') blocks.push(b);
  if (blocks.length === 0) blocks.push({ kind: 'text', text: 'Done.' });
  return { blocks, action: lastTool?.action };
}

export const llmEngine: AiEngine = {
  ask: async (query, ctx) => {
    const history = (ctx.history ?? []).filter((m) => m.text).map((m) => ({ role: m.role, content: m.text }));
    const messages: Msg[] = [...history, { role: 'user', content: query }];
    const system = buildSystemPrompt(ctx);
    const tools = toolsForRole(ctx);

    let lastTool: AiReply | null = null;
    for (let step = 0; step < 4; step += 1) {
      const data = await callProxy({ system, messages, tools });
      const content = data.content ?? [];
      const toolUses = content.filter((c): c is ToolUseContent => c.type === 'tool_use');

      if (toolUses.length === 0) {
        const lead = content.filter((c): c is TextContent => c.type === 'text').map((c) => c.text).join('\n').trim();
        return assembleReply(lead, lastTool);
      }

      messages.push({ role: 'assistant', content });
      const results = toolUses.map((tu) => {
        const reply = runTool(tu.name, tu.input ?? {}, ctx);
        lastTool = reply;
        return { type: 'tool_result', tool_use_id: tu.id, content: toToolResult(reply) };
      });
      messages.push({ role: 'user', content: results });
    }

    return lastTool ?? { blocks: [{ kind: 'text', text: "I couldn't complete that just now — please try rephrasing." }] };
  },
};

/** Pick the LLM engine when enabled (with rule-engine fallback), else the rule engine. */
export function selectEngine(): AiEngine {
  if (!LLM_ENABLED) return ruleEngine;
  return {
    ask: async (query, ctx) => {
      try {
        return await llmEngine.ask(query, ctx);
      } catch (err) {
        console.warn('LLM engine unavailable, using grounded rule engine:', err);
        return runAssistant(query, ctx);
      }
    },
  };
}
