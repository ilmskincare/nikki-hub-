'use client';

import { useState } from 'react';

interface DumpItem {
  text: string;
  tag: 'income' | 'cost' | 'idea' | 'urgent' | 'neutral';
  priority: 'high' | 'medium' | 'low';
}

const TAG_CONFIG = {
  income: { label: '💚 makes money', bg: 'bg-green-900/30', border: 'border-green-700/40', text: 'text-green-300' },
  cost:   { label: '🔴 costs money', bg: 'bg-red-900/30',   border: 'border-red-700/40',   text: 'text-red-300' },
  idea:   { label: '💡 idea',        bg: 'bg-yellow-900/30', border: 'border-yellow-700/40', text: 'text-yellow-300' },
  urgent: { label: '🔥 urgent',      bg: 'bg-orange-900/30', border: 'border-orange-700/40', text: 'text-orange-300' },
  neutral:{ label: '⚪ neutral',     bg: 'bg-white/5',        border: 'border-white/10',      text: 'text-gray-400' },
};

export default function BrainDump() {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<DumpItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const process = async () => {
    if (!input.trim() || processing) return;
    setProcessing(true);
    setError(null);
    setItems([]);
    try {
      const res = await fetch('/api/brain-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setProcessing(false);
    }
  };

  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const changeTag = (i: number, tag: DumpItem['tag']) =>
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, tag } : item)));

  const saveAll = async () => {
    if (!items.length || saving) return;
    setSaving(true);
    await Promise.all(
      items.map((item) =>
        fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: item.text, tag: item.tag, priority: item.priority }),
        })
      )
    );
    setSaving(false);
    setSaved(true);
    setInput('');
    setItems([]);
    setTimeout(() => setSaved(false), 3000);
  };

  const isEmpty = !input.trim() && items.length === 0 && !saved && !processing;

  return (
    <div className="h-full overflow-y-auto px-5 py-6 max-w-2xl mx-auto">

      {/* Inviting empty state header */}
      {isEmpty && (
        <div className="mb-6 text-center">
          <p className="text-2xl mb-2">🧠</p>
          <h2 className="text-purple-200/80 text-lg font-semibold mb-1">What&apos;s going on in there?</h2>
          <p className="text-purple-500/50 text-sm leading-relaxed max-w-xs mx-auto">
            Just throw it all out. Every thought, every worry, every idea. Don&apos;t tidy — I&apos;ll sort it.
          </p>
        </div>
      )}

      {!isEmpty && (
        <p className="text-purple-500/50 text-xs uppercase tracking-widest mb-3 font-medium">
          What&apos;s in your head right now?
        </p>
      )}

      <div className="mb-5">
        <div
          className="rounded-2xl overflow-hidden transition-all"
          style={{ border: '1px solid rgba(109,40,217,0.25)', background: 'rgba(255,255,255,0.04)' }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) process(); }}
            placeholder="Start typing anything... court stuff, business ideas, things stressing you out, random thoughts. All of it."
            rows={6}
            className="w-full bg-transparent px-5 py-4 text-sm text-gray-100 placeholder-purple-600/40 outline-none resize-none leading-relaxed"
            style={{ caretColor: 'rgba(167,139,250,0.8)' }}
          />
        </div>
        <button
          onClick={process}
          disabled={!input.trim() || processing}
          className="mt-3 w-full py-3 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: !input.trim() || processing
              ? 'rgba(109,40,217,0.3)'
              : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            boxShadow: !input.trim() || processing ? 'none' : '0 4px 16px rgba(109,40,217,0.3)',
          }}
        >
          {processing ? 'Sorting your thoughts...' : 'Process my brain dump →'}
        </button>
        <p className="text-center text-purple-700/40 text-[10px] mt-1.5 tracking-wide">Ctrl+Enter to process</p>
      </div>

      {error && (
        <div
          className="text-xs px-3 py-2 rounded-lg mb-4"
          style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </div>
      )}

      {items.length > 0 && (
        <div>
          <p className="text-purple-500/50 text-xs uppercase tracking-widest mb-3 font-medium">
            {items.length} items sorted — tweak tags if needed
          </p>
          <div className="space-y-2.5 mb-4">
            {items.map((item, i) => {
              const cfg = TAG_CONFIG[item.tag];
              return (
                <div
                  key={i}
                  className={`${cfg.bg} ${cfg.border} border rounded-xl px-4 py-3`}
                >
                  <div className="flex items-start gap-3">
                    <p className="flex-1 text-sm text-gray-100 leading-relaxed">{item.text}</p>
                    <button
                      onClick={() => removeItem(i)}
                      className="text-gray-600 hover:text-red-400 text-lg leading-none flex-shrink-0 transition-colors mt-0.5"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    {(Object.keys(TAG_CONFIG) as DumpItem['tag'][]).map((t) => (
                      <button
                        key={t}
                        onClick={() => changeTag(i, t)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          item.tag === t
                            ? `${TAG_CONFIG[t].bg} ${TAG_CONFIG[t].border} ${TAG_CONFIG[t].text} font-medium`
                            : 'border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20'
                        }`}
                      >
                        {TAG_CONFIG[t].label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={saveAll}
            disabled={saving}
            className="w-full py-3 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, rgba(21,128,61,0.8) 0%, rgba(22,101,52,0.9) 100%)',
              boxShadow: '0 4px 16px rgba(21,128,61,0.2)',
              border: '1px solid rgba(34,197,94,0.2)',
            }}
          >
            {saving ? 'Saving...' : `Save all ${items.length} items to Focus →`}
          </button>
        </div>
      )}

      {saved && (
        <div className="text-center py-12">
          <p className="text-3xl mb-3">✓</p>
          <p className="text-green-400 text-sm font-semibold mb-1">Head cleared.</p>
          <p className="text-purple-500/50 text-xs">Your tasks are waiting in Focus.</p>
        </div>
      )}
    </div>
  );
}
