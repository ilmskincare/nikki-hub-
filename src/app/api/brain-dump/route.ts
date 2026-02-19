import { NextRequest, NextResponse } from 'next/server';
import { streamChat } from '@/lib/ai-router';

const DUMP_SYSTEM = `You help Nikki, who has ADHD, organise her thoughts. She gives you a brain dump of everything in her head. Break it into individual items and tag each one.

Return ONLY a valid JSON array, no other text, no explanation.

Tags:
- "income" = will make money or generate revenue
- "cost" = will cost money or is an expense
- "idea" = a future idea or plan, not urgent
- "urgent" = time-sensitive, needs doing very soon
- "neutral" = everything else

Priority:
- "high" = do this today or this week
- "medium" = do this soon
- "low" = nice to have, can wait

Return format (JSON array ONLY):
[{"text": "item description", "tag": "income", "priority": "high"}]`;

const VALID_TAGS = new Set(['income', 'cost', 'idea', 'urgent', 'neutral']);
const VALID_PRIORITIES = new Set(['high', 'medium', 'low']);

function sanitise(str: string): string {
  return str
    // Fix unquoted tag/priority values: "tag":neutral → "tag":"neutral"
    .replace(/"tag"\s*:\s*([a-z]+)/g,      '"tag":"$1"')
    .replace(/"priority"\s*:\s*([a-z]+)/g, '"priority":"$1"')
    // Fix missing comma between adjacent properties: "value" "key": → "value","key":
    .replace(/"\s+"(?=[a-z]+"?\s*:)/g, '","');
}

function extractItems(raw: string): { text: string; tag: string; priority: string }[] {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];

  // Try full array parse first
  try {
    return JSON.parse(sanitise(match[0]));
  } catch { /* fall through */ }

  // Fallback: extract individual flat objects one by one
  const items: { text: string; tag: string; priority: string }[] = [];
  const objRe = /\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = objRe.exec(match[0])) !== null) {
    try {
      const obj = JSON.parse(sanitise(`{${m[1]}}`));
      if (typeof obj.text === 'string') {
        items.push({
          text:     obj.text,
          tag:      VALID_TAGS.has(obj.tag)             ? obj.tag      : 'neutral',
          priority: VALID_PRIORITIES.has(obj.priority)  ? obj.priority : 'medium',
        });
      }
    } catch { /* skip malformed object */ }
  }
  return items;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ items: [] });

    let raw = '';
    for await (const chunk of streamChat([{ role: 'user', content: text }], DUMP_SYSTEM)) {
      raw += chunk;
    }

    const items = extractItems(raw);
    return NextResponse.json({ items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
