'use client';

import { useState, useEffect } from 'react';

interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  updated_at: string;
}

const PROMPTS = [
  "What's taking up the most space in your head right now?",
  "What's one small thing you actually got done today?",
  "What are you avoiding right now? What's the tiniest possible step toward it?",
  "How does your body feel? Where are you holding tension?",
  "What do you need more of this week? What do you need less of?",
  "What would you tell your past self about today?",
  "What's your win for today — however small it feels?",
  "What's been draining you? What's been filling you up?",
  "What would make tomorrow feel even 10% better?",
  "What are you grateful for right now, even if today was hard?",
  "What decision have you been putting off? What's stopping you?",
  "If you could fix one thing tomorrow, what would it be?",
  "What did you do today that was good for you?",
  "What do you wish someone would say to you right now?",
  "What's your brain looping on? Get it out here.",
];

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [view, setView] = useState<'list' | 'write'>('list');
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/notes')
      .then((r) => r.json())
      .then((data: JournalEntry[]) => {
        setEntries(data.filter((n) => n.title?.startsWith('[journal]')));
        setLoading(false);
      });
  }, []);

  const randomPrompt = () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  const startNew = () => {
    setPrompt(randomPrompt());
    setContent('');
    setCurrentEntry(null);
    setView('write');
  };

  const openEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setContent(entry.content);
    setPrompt('');
    setView('write');
  };

  const saveEntry = async () => {
    if (!content.trim()) return;
    setSaving(true);

    const date = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const title = `[journal] ${date}`;

    let res: Response;
    if (currentEntry) {
      res = await fetch('/api/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentEntry.id, title, content }),
      });
    } else {
      res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
    }

    const entry = await res.json();
    setEntries((prev) => {
      const exists = prev.find((e) => e.id === entry.id);
      return exists
        ? prev.map((e) => (e.id === entry.id ? entry : e))
        : [entry, ...prev];
    });

    setSaving(false);
    setView('list');
  };

  if (view === 'write') {
    return (
      <div className="h-full flex flex-col max-w-2xl mx-auto px-4 py-5">
        <div className="flex items-center gap-3 mb-5 flex-shrink-0">
          <button
            onClick={() => setView('list')}
            className="text-purple-400/60 hover:text-purple-200 text-sm transition-colors"
          >
            ← Journal
          </button>
          <span className="text-purple-400/40 text-xs">
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </span>
        </div>

        {prompt && (
          <div className="bg-purple-900/20 border border-purple-700/20 rounded-xl px-4 py-3 mb-5 flex-shrink-0">
            <p className="text-purple-300/70 text-sm italic leading-relaxed">{prompt}</p>
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing... no rules, no judgment, no one's watching."
          autoFocus
          className="flex-1 bg-transparent text-sm text-gray-200 outline-none resize-none placeholder-purple-400/25 leading-relaxed"
        />

        <div className="flex gap-2 mt-5 flex-shrink-0">
          <button
            onClick={() => setPrompt(randomPrompt())}
            className="text-xs px-3 py-2 bg-purple-900/30 border border-purple-700/20 text-purple-400/70 hover:text-purple-200 rounded-lg transition-colors"
          >
            Different prompt
          </button>
          <div className="flex-1" />
          <button
            onClick={saveEntry}
            disabled={saving || !content.trim()}
            className="text-sm px-5 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white rounded-xl transition-colors font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-purple-200 font-medium">Journal</h2>
          <p className="text-purple-400/40 text-xs mt-0.5">No rules. Just you.</p>
        </div>
        <button
          onClick={startNew}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded-xl transition-colors font-medium"
        >
          Write today
        </button>
      </div>

      {loading ? (
        <div className="text-purple-400/40 text-sm text-center py-12">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-purple-400/40 text-sm mb-5">No entries yet.</p>
          <button
            onClick={startNew}
            className="text-purple-400/70 hover:text-purple-200 text-sm underline transition-colors"
          >
            Start your first entry →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const date = entry.title?.replace('[journal] ', '') || '';
            const preview =
              entry.content.slice(0, 120) + (entry.content.length > 120 ? '...' : '');
            return (
              <div
                key={entry.id}
                onClick={() => openEntry(entry)}
                className="bg-white/3 hover:bg-white/5 border border-purple-900/20 hover:border-purple-700/30 rounded-xl px-4 py-3 cursor-pointer transition-all"
              >
                <div className="text-xs text-purple-400/50 mb-1">{date}</div>
                <div className="text-sm text-gray-300/80 leading-relaxed">{preview}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
