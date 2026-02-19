'use client';

import { useState, useEffect } from 'react';

interface Note {
  id: string;
  title: string | null;
  content: string;
  updated_at: string;
}

export default function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const regularNotes = notes.filter((n) => !n.title?.startsWith('[journal]'));

  useEffect(() => {
    fetch('/api/notes')
      .then((r) => r.json())
      .then(setNotes)
      .finally(() => setLoading(false));
  }, []);

  const newNote = async () => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Untitled', content: '' }),
    });
    const note = await res.json();
    setNotes((prev) => [note, ...prev]);
    openNote(note);
  };

  const openNote = (note: Note) => {
    setSelected(note);
    setEditTitle(note.title || '');
    setEditContent(note.content);
  };

  const saveNote = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch('/api/notes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, title: editTitle, content: editContent }),
    });
    const updated = await res.json();
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setSelected(updated);
    setSaving(false);
  };

  const deleteNote = async (id: string) => {
    await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  if (selected) {
    return (
      <div className="h-full flex flex-col max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <button
            onClick={() => { saveNote(); setSelected(null); }}
            className="text-purple-400/60 hover:text-purple-200 text-sm transition-colors"
          >
            ← Notes
          </button>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title"
            className="flex-1 bg-transparent text-purple-100 font-semibold text-lg outline-none placeholder-purple-400/30 border-b border-transparent focus:border-purple-700/40 transition-colors"
          />
          <button
            onClick={saveNote}
            disabled={saving}
            className="text-xs px-3 py-1.5 bg-purple-700/50 hover:bg-purple-600/70 disabled:opacity-40 text-purple-100 rounded-lg transition-colors flex-shrink-0"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="Start writing..."
          className="flex-1 bg-transparent text-sm text-gray-200 outline-none resize-none placeholder-purple-400/25 leading-relaxed"
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-purple-200/70 text-sm font-medium">Notes</h2>
        <button
          onClick={newNote}
          className="text-xs px-3 py-2 bg-purple-700/60 hover:bg-purple-600/70 text-purple-100 rounded-lg transition-colors"
        >
          + New
        </button>
      </div>

      {loading ? (
        <div className="text-purple-400/40 text-sm text-center py-12">Loading...</div>
      ) : regularNotes.length === 0 ? (
        <div className="text-purple-400/40 text-sm text-center py-12">No notes yet.</div>
      ) : (
        <div className="space-y-2">
          {regularNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => openNote(note)}
              className="group flex items-start gap-3 bg-white/3 hover:bg-white/5 border border-purple-900/20 hover:border-purple-700/30 rounded-xl px-4 py-3 cursor-pointer transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-purple-200 truncate">
                  {note.title || 'Untitled'}
                </div>
                <div className="text-xs text-purple-400/40 truncate mt-0.5">
                  {note.content || 'Empty'}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-red-400 transition-all text-xl leading-none flex-shrink-0 mt-0.5"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
