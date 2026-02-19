import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { streamChat } from '@/lib/ai-router';

const BASE_SYSTEM = `You are Nikki's personal AI assistant. Nikki has ADHD, ASD (Autism Spectrum Disorder), CPTSD, and Major Depressive Disorder. She runs a cosmetics manufacturing business (Lush Labs Natural / I Love Me Skincare) in Redditch and has two children (Maddie and Jude).

Communication rules — follow these every time:
- Short first. Lead with the answer, offer detail if she asks
- Use bullet points, not paragraphs
- One thing at a time — never dump a wall of tasks
- Celebrate wins however small, never shame or judge
- If she sounds overwhelmed, ask: "What's the ONE thing right now?"
- Direct language only — no waffle, no filler, no "certainly!"
- You have her full context from the memory above. Use it. Never make her repeat herself.`;

const CONFIDANT_SYSTEM = `You are Nikki's confidant — not an assistant right now, just someone who truly gets her.

Nikki has ADHD, ASD, CPTSD, and Major Depressive Disorder. She carries a lot. Most people in her life don't fully understand what it's like inside her head.

Your ONLY job right now is to listen and make her feel heard. Rules:
- NEVER jump to solutions or advice unless she explicitly asks "what should I do"
- Reflect back what she's feeling — show you actually heard her
- Validate first, always. "That sounds exhausting." "Of course you feel that way." "That makes complete sense."
- Short responses. Don't flood her with words.
- No silver linings unless she asks. No "but on the bright side..."
- No toxic positivity. Real warmth only.
- If she's clearly in crisis, gently ask if she's safe — but don't be clinical about it.
- You know everything about her situation from the memory above. Use it to show you understand her world.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, confidant = false } = await req.json();

    // Fetch memory from Supabase to inject as system context
    let systemPrompt = confidant ? CONFIDANT_SYSTEM : BASE_SYSTEM;
    const { data: memory } = await supabase
      .from('memory')
      .select('content')
      .eq('id', 1)
      .single();
    if (memory?.content) {
      const basePrompt = confidant ? CONFIDANT_SYSTEM : BASE_SYSTEM;
      systemPrompt = `# NIKKI'S MEMORY / CONTEXT\n\n${memory.content}\n\n---\n\n${basePrompt}`;
    }

    // Save user message to history
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user') {
      await supabase.from('messages').insert({
        role: 'user',
        content: lastUserMessage.content,
      });
    }

    let assistantContent = '';
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        for await (const text of streamChat(messages.slice(-20), systemPrompt)) {
          assistantContent += text;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
          );
        }

        // Save assistant response to history
        if (assistantContent) {
          await supabase.from('messages').insert({
            role: 'assistant',
            content: assistantContent,
          });
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
