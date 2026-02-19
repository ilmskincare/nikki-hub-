import { NextRequest, NextResponse } from 'next/server';
import { streamChat } from '@/lib/ai-router';

export const maxDuration = 60;

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

// Robust per-object regex extraction — handles Llama's broken JSON:
//   - Empty key: "": "cost"  instead of  "tag": "cost"
//   - Missing opening quote: "text":fix the website"
//   - Unquoted values: "priority":high
function extractItems(raw: string): { text: string; tag: string; priority: string }[] {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];

  const items: { text: string; tag: string; priority: string }[] = [];
  const objRe = /\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;

  while ((m = objRe.exec(match[0])) !== null) {
    const obj = m[1];

    // Extract text — handle "text":"value" and "text":value" (missing opening quote)
    const textM = obj.match(/"text"\s*:\s*"?([^",}\n]+)/);
    const text = textM?.[1]?.replace(/^"/, '').trim();
    if (!text) continue;

    // Extract tag — handle "tag":"value", "tag":value, and "":"value" (Llama empty key bug)
    let tag = 'neutral';
    const tagM = obj.match(/(?:"tag"|"")\s*:\s*"?([a-z]+)"?/);
    if (tagM && VALID_TAGS.has(tagM[1])) tag = tagM[1];

    // Extract priority — handle quoted and unquoted values
    let priority = 'medium';
    const priM = obj.match(/"priority"\s*:\s*"?([a-z]+)"?/);
    if (priM && VALID_PRIORITIES.has(priM[1])) priority = priM[1];

    items.push({ text, tag, priority });
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
    if (!items.length) {
      return NextResponse.json({ error: "Couldn't parse that — try again?" }, { status: 500 });
    }
    return NextResponse.json({ items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
