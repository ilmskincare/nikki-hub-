'use client';
// Dashboard — client component, only rendered after server auth check

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import TaskList from '@/components/TaskList';
import BrainDump from '@/components/BrainDump';
import Journal from '@/components/Journal';
import MemoryEditor from '@/components/MemoryEditor';

type Tab = 'dump' | 'focus' | 'chat' | 'journal';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'dump',    label: 'Brain Dump', icon: '🧠' },
  { id: 'focus',   label: 'Focus',      icon: '🎯' },
  { id: 'chat',    label: 'Chat',       icon: '💬' },
  { id: 'journal', label: 'Journal',    icon: '📓' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dump');
  const [showMemory, setShowMemory] = useState(false);

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden" style={{ background: '#07000f' }}>

      {/* Ambient glow at top */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-64 z-0"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(109,40,217,0.18) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <header className="relative z-10 flex-shrink-0 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(109,40,217,0.15)', background: 'rgba(7,0,15,0.7)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)', boxShadow: '0 0 12px rgba(124,58,237,0.4)' }}>
              <span className="text-xs">N</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-purple-100 leading-none tracking-tight">Nikki Hub</h1>
                <span className="text-purple-500/40 text-xs leading-none">·</span>
                <span className="text-xs text-purple-400/50 leading-none">{getGreeting()}, Nikki</span>
              </div>
              <p className="text-[10px] text-purple-600/50 mt-1 leading-none tracking-wide uppercase">Your space</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <span className="status-dot w-1.5 h-1.5 rounded-full bg-green-400/80 flex-shrink-0" />
              <span className="text-[10px] text-green-400/60 tracking-wide">online</span>
            </div>
            <button
              onClick={() => setShowMemory(true)}
              className="text-xs px-3 py-1.5 rounded-full transition-all font-medium"
              style={{ background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(109,40,217,0.25)', color: 'rgba(196,181,253,0.6)' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(233,221,255,0.9)'; (e.target as HTMLElement).style.background = 'rgba(109,40,217,0.25)'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(196,181,253,0.6)'; (e.target as HTMLElement).style.background = 'rgba(109,40,217,0.12)'; }}
            >
              memory
            </button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="relative z-10 flex-shrink-0 flex gap-1 px-5 pt-3 max-w-5xl mx-auto w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'text-purple-100'
                : 'text-purple-600/60 hover:text-purple-400/80'
            }`}
            style={activeTab === tab.id ? {
              background: 'rgba(88,28,135,0.25)',
              border: '1px solid rgba(109,40,217,0.2)',
              borderBottom: 'none',
            } : {}}
          >
            <span className="text-sm leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content area divider */}
      <div className="relative z-10 flex-shrink-0" style={{ borderTop: '1px solid rgba(88,28,135,0.2)' }} />

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-hidden max-w-5xl mx-auto w-full">
        <div className={activeTab === 'dump' ? 'h-full' : 'hidden'}>
          <BrainDump />
        </div>
        <div className={activeTab === 'focus' ? 'h-full' : 'hidden'}>
          <TaskList />
        </div>
        <div className={activeTab === 'chat' ? 'h-full' : 'hidden'}>
          <ChatInterface />
        </div>
        <div className={activeTab === 'journal' ? 'h-full' : 'hidden'}>
          <Journal />
        </div>
      </div>

      {/* Memory modal */}
      {showMemory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowMemory(false); }}
        >
          <div
            className="w-full max-w-3xl flex flex-col max-h-[85vh]"
            style={{ background: '#0d0019', border: '1px solid rgba(109,40,217,0.3)', borderRadius: '20px', boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(88,28,135,0.1)' }}
          >
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(88,28,135,0.2)' }}>
              <div>
                <h2 className="text-purple-100 font-semibold text-sm">Memory Editor</h2>
                <p className="text-[10px] text-purple-600/50 mt-0.5">What I know about you and your life</p>
              </div>
              <button
                onClick={() => setShowMemory(false)}
                className="text-purple-500/40 hover:text-purple-200 text-2xl leading-none transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-900/30"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-5 min-h-0">
              <MemoryEditor />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
