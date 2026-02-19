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

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ items: [] });

    let raw = '';
    for await (const chunk of streamChat([{ role: 'user', content: text }], DUMP_SYSTEM)) {
      raw += chunk;
    }

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ items: [] });

    // LLMs sometimes emit unquoted values like "tag":neutral — fix before parsing
    const sanitised = match[0]
      .replace(/"tag"\s*:\s*([a-z]+)/g,      '"tag":"$1"')
      .replace(/"priority"\s*:\s*([a-z]+)/g, '"priority":"$1"');

    const items = JSON.parse(sanitised);
    return NextResponse.json({ items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
