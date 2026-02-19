'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('Wrong password. Try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#07000f' }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(109,40,217,0.2) 0%, rgba(76,29,149,0.08) 40%, transparent 70%)' }}
      />
      {/* Bottom glow */}
      <div
        className="pointer-events-none absolute bottom-0 inset-x-0 h-64"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(88,28,135,0.12) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo / brand mark */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.8) 0%, rgba(76,29,149,0.9) 100%)',
              boxShadow: '0 0 30px rgba(124,58,237,0.35), 0 0 60px rgba(88,28,135,0.15)',
              border: '1px solid rgba(167,139,250,0.2)',
            }}
          >
            <span className="text-2xl font-bold text-purple-100">N</span>
          </div>
          <h1 className="text-2xl font-bold text-purple-50 mb-1.5 tracking-tight">Welcome back, Nikki</h1>
          <p className="text-purple-500/60 text-sm text-center leading-relaxed">
            Your space. Your thoughts. Your pace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div
            className="rounded-xl overflow-hidden transition-all"
            style={{ border: '1px solid rgba(109,40,217,0.25)', background: 'rgba(255,255,255,0.04)' }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoFocus
              className="w-full bg-transparent px-4 py-3.5 text-gray-100 placeholder-purple-500/40 outline-none text-sm"
              style={{ caretColor: 'rgba(167,139,250,0.8)' }}
            />
          </div>

          {error && (
            <p
              className="text-sm px-3 py-2 rounded-lg"
              style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full font-semibold py-3.5 rounded-xl text-sm transition-all disabled:opacity-40"
            style={{
              background: loading || !password
                ? 'rgba(109,40,217,0.4)'
                : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              boxShadow: loading || !password ? 'none' : '0 4px 20px rgba(109,40,217,0.35)',
              color: 'white',
            }}
          >
            {loading ? 'One moment...' : 'Enter my space'}
          </button>
        </form>

        <p className="text-center text-[11px] text-purple-700/40 mt-8 leading-relaxed">
          Made with love, just for you.
        </p>
      </div>
    </div>
  );
}
