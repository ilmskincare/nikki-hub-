// ─── Provider definitions ────────────────────────────────────────────────────
// All free tier. Add more providers here as you get keys.
// Order = priority. First available provider wins.
// NOTE: No SDK imports — all providers use plain fetch for serverless compatibility.

interface Message { role: 'user' | 'assistant' | 'system'; content: string; }

const PROVIDERS = [
  {
    name: 'groq',
    model: 'llama-3.3-70b-versatile',
    available: () => !!process.env.GROQ_API_KEY,
  },
  {
    name: 'openrouter',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    available: () => !!process.env.OPENROUTER_API_KEY,
  },
  {
    name: 'gemini',
    model: 'gemini-1.5-flash',
    available: () => !!process.env.GEMINI_API_KEY,
  },
  {
    name: 'mistral',
    model: 'mistral-small-latest',
    available: () => !!process.env.MISTRAL_API_KEY,
  },
];

function isRateLimit(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes('429') || msg.includes('rate limit') || msg.includes('quota') || msg.includes('limit exceeded');
  }
  return false;
}

// ─── Groq streaming (plain fetch — OpenAI-compatible endpoint) ───────────────
async function* streamGroq(messages: Message[], system: string): AsyncGenerator<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      stream: true,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq ${res.status}: ${err}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value, { stream: true }).split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const text = JSON.parse(data).choices?.[0]?.delta?.content ?? '';
        if (text) yield text;
      } catch { continue; }
    }
  }
}

// ─── OpenRouter streaming ────────────────────────────────────────────────────
async function* streamOpenRouter(messages: Message[], system: string): AsyncGenerator<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nikki-hub.vercel.app',
      'X-Title': 'NeuroVerse',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      max_tokens: 2048,
      stream: true,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value, { stream: true }).split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const text = JSON.parse(data).choices?.[0]?.delta?.content ?? '';
        if (text) yield text;
      } catch { continue; }
    }
  }
}

// ─── Mistral streaming ───────────────────────────────────────────────────────
async function* streamMistral(messages: Message[], system: string): AsyncGenerator<string> {
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      max_tokens: 2048,
      stream: true,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral ${res.status}: ${err}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value, { stream: true }).split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const text = JSON.parse(data).choices?.[0]?.delta?.content ?? '';
        if (text) yield text;
      } catch { continue; }
    }
  }
}

// ─── Gemini streaming (OpenAI-compatible endpoint) ──────────────────────────
async function* streamGemini(messages: Message[], system: string): AsyncGenerator<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-1.5-flash',
        max_tokens: 2048,
        stream: true,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value, { stream: true }).split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const text = JSON.parse(data).choices?.[0]?.delta?.content ?? '';
        if (text) yield text;
      } catch { continue; }
    }
  }
}

// ─── Main router — tries providers in order, falls back on rate limit ────────
export async function* streamChat(
  messages: Message[],
  system: string
): AsyncGenerator<string> {
  const available = PROVIDERS.filter((p) => p.available());

  if (!available.length) {
    throw new Error('No AI providers configured. Add at least one API key to .env.local.');
  }

  let lastError: unknown;

  for (const provider of available) {
    try {
      console.log(`[ai-router] Trying ${provider.name}...`);
      if (provider.name === 'groq') {
        yield* streamGroq(messages, system);
      } else if (provider.name === 'openrouter') {
        yield* streamOpenRouter(messages, system);
      } else if (provider.name === 'gemini') {
        yield* streamGemini(messages, system);
      } else if (provider.name === 'mistral') {
        yield* streamMistral(messages, system);
      }
      return; // success — done
    } catch (err) {
      lastError = err;
      if (isRateLimit(err)) {
        console.log(`[ai-router] ${provider.name} rate limited — trying next provider`);
        continue;
      }
      throw err; // non-rate-limit error — don't swallow it
    }
  }

  throw lastError ?? new Error('All AI providers failed');
}

export { PROVIDERS };
