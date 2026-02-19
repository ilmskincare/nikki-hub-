'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Task {
  id: string;
  text: string;
  done: boolean;
  tag: 'income' | 'cost' | 'idea' | 'urgent' | 'neutral';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

const TAG_CONFIG = {
  income: { icon: '💚', label: 'makes money', text: 'text-green-400', border: 'border-green-800/40' },
  cost:   { icon: '🔴', label: 'costs money',  text: 'text-red-400',   border: 'border-red-800/40' },
  idea:   { icon: '💡', label: 'idea',          text: 'text-yellow-400', border: 'border-yellow-800/40' },
  urgent: { icon: '🔥', label: 'urgent',        text: 'text-orange-400', border: 'border-orange-800/40' },
  neutral:{ icon: '⚪', label: '',              text: 'text-gray-500',   border: 'border-white/10' },
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const TAG_ORDER = { urgent: 0, income: 1, neutral: 2, idea: 3, cost: 4 };

function getOneThing(tasks: Task[]): Task | null {
  const pending = tasks.filter((t) => !t.done);
  if (!pending.length) return null;
  return [...pending].sort((a, b) => {
    const tagDiff = (TAG_ORDER[a.tag] ?? 4) - (TAG_ORDER[b.tag] ?? 4);
    if (tagDiff !== 0) return tagDiff;
    return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
  })[0];
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [filter, setFilter] = useState<Task['tag'] | 'all'>('all');

  useEffect(() => {
    fetch('/api/tasks')
      .then((r) => r.json())
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || adding) return;
    setAdding(true);
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newTask.trim() }),
    });
    const task = await res.json();
    setTasks((prev) => [task, ...prev]);
    setNewTask('');
    setAdding(false);
  };

  const toggleTask = async (id: string, done: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !done } : t)));
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, done: !done }),
    });
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const oneThing = getOneThing(tasks);

  const sortedPending = [...pending].sort((a, b) => {
    const tagDiff = (TAG_ORDER[a.tag] ?? 4) - (TAG_ORDER[b.tag] ?? 4);
    if (tagDiff !== 0) return tagDiff;
    return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
  });

  const filtered = filter === 'all'
    ? sortedPending
    : sortedPending.filter((t) => t.tag === filter);

  return (
    <div className="h-full overflow-y-auto px-4 py-5 max-w-2xl mx-auto">

      {/* THE ONE THING */}
      {oneThing && (
        <div className="mb-5 bg-purple-900/30 border border-purple-600/40 rounded-2xl px-5 py-4">
          <p className="text-purple-400/60 text-xs uppercase tracking-wider mb-1">The ONE thing right now</p>
          <div className="flex items-start gap-3">
            <button
              onClick={() => toggleTask(oneThing.id, oneThing.done)}
              className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 border-purple-500/60 hover:border-purple-300 transition-colors"
            />
            <div className="flex-1">
              <p className="text-base text-white font-medium leading-snug">{oneThing.text}</p>
              <span className={`text-xs mt-1 inline-block ${TAG_CONFIG[oneThing.tag ?? 'neutral'].text}`}>
                {TAG_CONFIG[oneThing.tag ?? 'neutral'].icon} {TAG_CONFIG[oneThing.tag ?? 'neutral'].label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add task */}
      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 bg-white/5 border border-purple-700/30 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-purple-400/30 outline-none focus:border-purple-500/60 transition-colors"
        />
        <button
          type="submit"
          disabled={adding || !newTask.trim()}
          className="px-5 py-3 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Add
        </button>
      </form>

      {/* Filter bar */}
      {pending.length > 0 && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {(['all', 'urgent', 'income', 'cost', 'idea'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                filter === f
                  ? 'bg-purple-700 border-purple-500 text-white'
                  : 'border-purple-800/40 text-purple-400/50 hover:text-purple-200'
              }`}
            >
              {f === 'all' ? `All (${pending.length})` : `${TAG_CONFIG[f].icon} ${f}`}
            </button>
          ))}
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div className="text-purple-400/40 text-sm text-center py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-purple-400/40 text-sm">
            {pending.length === 0 ? 'Nothing here. Use Brain Dump to add tasks.' : 'No tasks with that tag.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const cfg = TAG_CONFIG[task.tag ?? 'neutral'];
            return (
              <div
                key={task.id}
                className={`flex items-start gap-3 group bg-white/3 hover:bg-white/5 border ${cfg.border} rounded-xl px-4 py-3 transition-all`}
              >
                <button
                  onClick={() => toggleTask(task.id, task.done)}
                  className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 border-purple-600/50 hover:border-purple-400 transition-colors"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-100 leading-relaxed">{task.text}</p>
                  {task.tag && task.tag !== 'neutral' && (
                    <span className={`text-xs ${cfg.text} mt-0.5 inline-block`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-50 hover:!opacity-100 text-red-400 transition-all text-xl leading-none mt-0.5 flex-shrink-0"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowDone(!showDone)}
            className="text-xs text-purple-500/50 hover:text-purple-400 transition-colors mb-3"
          >
            {showDone ? '▼' : '▶'} Done ({done.length})
          </button>
          {showDone && (
            <div className="space-y-2">
              {done.map((task) => (
                <div key={task.id} className="flex items-start gap-3 group opacity-40 hover:opacity-60 transition-opacity">
                  <button
                    onClick={() => toggleTask(task.id, task.done)}
                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md bg-purple-700/60 border-2 border-purple-600/60 flex items-center justify-center text-white text-xs"
                  >
                    ✓
                  </button>
                  <span className="flex-1 text-sm text-gray-400 line-through">{task.text}</span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-80 text-red-400 transition-all text-xl leading-none mt-0.5 flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
