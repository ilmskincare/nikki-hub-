'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  { label: 'Defence status', prompt: 'What is the current status of my court defence for case N7QZ237A and what do I need to do today?' },
  { label: 'Urgent tasks', prompt: 'What are my most urgent tasks right now based on the case deadline of 28 Feb 2026?' },
  { label: 'Counterclaim figures', prompt: 'Summarise all confirmed counterclaim figures and what is still TBC.' },
  { label: 'Evidence gaps', prompt: 'What evidence is still missing for my court defence?' },
  { label: 'Collection notice', prompt: 'Draft a formal 7-day collection notice to Sarah Morris.' },
];

const CONFIDANT_PROMPTS = [
  { label: 'I\'m overwhelmed', prompt: 'I\'m overwhelmed and I just need to talk.' },
  { label: 'Nobody gets it', prompt: 'Nobody understands what I\'m going through right now.' },
  { label: 'I messed up', prompt: 'I made a mistake and I\'m really hard on myself about it.' },
  { label: 'Brain won\'t stop', prompt: 'My brain won\'t stop and I can\'t focus on anything.' },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidant, setConfidant] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;
    setError(null);
    const userMessage: Message = { role: 'user', content };
    const updated = [...messages, userMessage];
    setMessages([...updated, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated, confidant }),
      });
      if (!response.ok || !response.body) throw new Error('API error ' + response.status);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assembled = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try { assembled += JSON.parse(data).text; } catch { continue; }
          setMessages((prev) => { const n=[...prev]; n[n.length-1]={role:'assistant',content:assembled}; return n; });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      setMessages((prev) => prev.slice(0, -1));
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4">
      {/* Mode toggle */}
      <div className="flex-shrink-0 flex items-center gap-2 pt-3 pb-2">
        <button
          onClick={() => { setConfidant(false); setMessages([]); }}
          className="text-xs px-3.5 py-1.5 rounded-full transition-all font-medium"
          style={!confidant ? {
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            border: '1px solid rgba(167,139,250,0.3)',
            color: 'white',
            boxShadow: '0 2px 10px rgba(109,40,217,0.3)',
          } : {
            background: 'transparent',
            border: '1px solid rgba(88,28,135,0.3)',
            color: 'rgba(196,181,253,0.4)',
          }}
        >
          💬 Assistant
        </button>
        <button
          onClick={() => { setConfidant(true); setMessages([]); }}
          className="text-xs px-3.5 py-1.5 rounded-full transition-all font-medium"
          style={confidant ? {
            background: 'linear-gradient(135deg, rgba(157,23,77,0.7) 0%, rgba(112,26,117,0.8) 100%)',
            border: '1px solid rgba(244,114,182,0.3)',
            color: '#fbcfe8',
            boxShadow: '0 2px 10px rgba(157,23,77,0.25)',
          } : {
            background: 'transparent',
            border: '1px solid rgba(88,28,135,0.3)',
            color: 'rgba(196,181,253,0.4)',
          }}
        >
          🫂 Confidant
        </button>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setError(null); }}
            className="text-xs px-3 py-1.5 rounded-full transition-all ml-auto"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick prompts */}
      <div className="flex-shrink-0 flex gap-1.5 flex-wrap pb-3">
        {(confidant ? CONFIDANT_PROMPTS : QUICK_PROMPTS).map((qp) => (
          <button
            key={qp.label}
            onClick={() => sendMessage(qp.prompt)}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full transition-all disabled:opacity-40 font-medium"
            style={confidant ? {
              background: 'rgba(157,23,77,0.12)',
              border: '1px solid rgba(244,114,182,0.2)',
              color: '#f9a8d4',
            } : {
              background: 'rgba(88,28,135,0.2)',
              border: '1px solid rgba(109,40,217,0.25)',
              color: 'rgba(216,180,254,0.8)',
            }}
          >
            {qp.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12 px-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: confidant
                  ? 'linear-gradient(135deg, rgba(157,23,77,0.6) 0%, rgba(112,26,117,0.7) 100%)'
                  : 'linear-gradient(135deg, rgba(124,58,237,0.6) 0%, rgba(76,29,149,0.7) 100%)',
                boxShadow: confidant
                  ? '0 0 24px rgba(157,23,77,0.3)'
                  : '0 0 24px rgba(124,58,237,0.3)',
                border: confidant
                  ? '1px solid rgba(244,114,182,0.2)'
                  : '1px solid rgba(167,139,250,0.2)',
              }}
            >
              <span className="text-xl">{confidant ? '🫂' : '💬'}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-purple-100 mb-1.5">
                {confidant ? 'I\'m here, Nikki' : 'Hey Nikki, what do you need?'}
              </h2>
              <p className="text-purple-500/60 text-sm leading-relaxed max-w-xs">
                {confidant
                  ? 'This is your safe space. No judgement, no rushing. Just talk.'
                  : 'Ask me anything about the case, your business, or what to do next.'}
              </p>
            </div>
            {!confidant && (
              <div
                className="text-xs px-3 py-2 rounded-full"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              >
                Defence deadline: 28 Feb 2026 — 9 days
              </div>
            )}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`text-sm leading-relaxed ${msg.role === 'user' ? 'max-w-[80%]' : 'max-w-[85%] whitespace-pre-wrap'}`}
              style={msg.role === 'user' ? {
                background: 'linear-gradient(135deg, rgba(124,58,237,0.7) 0%, rgba(88,28,135,0.8) 100%)',
                border: '1px solid rgba(167,139,250,0.25)',
                borderRadius: '18px 18px 4px 18px',
                padding: '10px 16px',
                color: '#f3e8ff',
              } : {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px 18px 18px 4px',
                padding: '10px 16px',
                color: '#e9d5ff',
              }}
            >
              {msg.content === '' && loading
                ? <span style={{ color: 'rgba(167,139,250,0.6)' }} className="animate-pulse">...</span>
                : msg.content}
            </div>
          </div>
        ))}
        {error && (
          <div
            className="text-xs px-3 py-2 rounded-lg"
            style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            Error: {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex-shrink-0 pb-4">
        <div
          className="flex gap-2 items-end px-4 py-3 transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(109,40,217,0.25)',
            borderRadius: '16px',
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="Ask anything... (Enter to send, Shift+Enter for newline)"
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-gray-100 placeholder-purple-700/50 outline-none resize-none max-h-40"
            style={{ caretColor: 'rgba(167,139,250,0.8)' }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-8 h-8 rounded-xl transition-all flex items-center justify-center disabled:opacity-30"
            style={{
              background: loading || !input.trim()
                ? 'rgba(109,40,217,0.3)'
                : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              boxShadow: loading || !input.trim() ? 'none' : '0 2px 8px rgba(109,40,217,0.4)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}