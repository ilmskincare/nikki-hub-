'use client';

import { useState, useEffect } from 'react';

export default function MemoryEditor() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/memory')
      .then((r) => r.json())
      .then((data) => {
        setContent(data.content || '');
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch('/api/memory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="h-full flex flex-col">
      <p className="text-purple-400/50 text-xs mb-3 flex-shrink-0">
        This is injected into every Claude conversation. Edit it to keep Claude up to date.
      </p>
      {loading ? (
        <div className="text-purple-400/40 text-sm flex-1 flex items-center justify-center">
          Loading...
        </div>
      ) : (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-white/3 border border-purple-800/30 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none resize-none focus:border-purple-600/50 transition-colors font-mono leading-relaxed"
            placeholder="Paste your CLAUDE.md content here..."
          />
          <div className="flex justify-end mt-3 flex-shrink-0">
            <button
              onClick={save}
              disabled={saving}
              className="text-sm px-5 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white rounded-xl transition-colors font-medium"
            >
              {saved ? 'Saved ✓' : saving ? 'Saving...' : 'Save memory'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
