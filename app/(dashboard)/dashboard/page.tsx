'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCallHistory } from '@/hooks/useCallHistory';
import { Trash2, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { calls, isLoading, deleteCall, getStats } = useCallHistory();
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = getStats();

  const sortedCalls = [...calls].sort((a, b) => {
    if (sortBy === 'date') {
      return b.date - a.date;
    } else {
      return b.score - a.score;
    }
  });

  const handleNewCall = () => {
    router.push('/');
  };

  const handleViewCall = (id: string) => {
    router.push(`/results/${id}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this call?')) {
      deleteCall(id);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4" />
          <p className="font-mono text-sm uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black" style={{ backgroundImage: 'url(/circuitbw.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .marquee-scroll {
          animation: scroll 15s linear infinite;
        }
      `}</style>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" style={{ pointerEvents: 'none' }}></div>

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* MARQUEE TICKER */}
        <div className="border-b-4 border-t-4 border-white bg-black py-3 overflow-hidden">
          <div className="flex marquee-scroll whitespace-nowrap">
            <div className="text-white font-mono font-bold tracking-widest text-lg px-8">
              • CRUSH YOUR GOALS • TRAIN HARDER • CLOSE MORE DEALS • TRACK EVERY CALL • CRUSH YOUR GOALS • TRAIN HARDER • CLOSE MORE DEALS • TRACK EVERY CALL •
            </div>
          </div>
        </div>

        {/* PAGE TITLE */}
        <div className="border-b-4 border-white py-8 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <h1 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tighter text-white" style={{ letterSpacing: '-0.02em' }}>
                DASHBOARD
              </h1>
              <button
                onClick={handleNewCall}
                className="border-4 border-white bg-black text-white font-serif font-black text-lg uppercase px-8 py-4 flex items-center gap-3 transition-all"
                style={{ boxShadow: '6px 6px 0px 0px rgba(255,255,255,0.3)' }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(6px, 6px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px rgba(255,255,255,0.3)';
                }}
              >
                NEW CALL
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Header */}
        <div className="border-b-4 border-white bg-black/40">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <p className="font-mono text-xs uppercase font-bold tracking-widest text-white/70 mb-6">Quick Stats</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="border-4 border-white bg-black/50 p-6 backdrop-blur-sm" style={{ boxShadow: '4px 4px 0px 0px rgba(255,255,255,0.2)' }}>
                <p className="font-mono text-xs uppercase font-bold tracking-widest text-white/70 mb-3">Total Calls</p>
                <p className="text-4xl font-black text-white">{stats.totalCalls}</p>
              </div>
              <div className="border-4 border-white bg-black/50 p-6 backdrop-blur-sm" style={{ boxShadow: '4px 4px 0px 0px rgba(255,255,255,0.2)' }}>
                <p className="font-mono text-xs uppercase font-bold tracking-widest text-white/70 mb-3">Avg Score</p>
                <p className="text-4xl font-black text-white">{stats.avgScore}</p>
              </div>
              <div className="border-4 border-white bg-black/50 p-6 backdrop-blur-sm" style={{ boxShadow: '4px 4px 0px 0px rgba(255,255,255,0.2)' }}>
                <p className="font-mono text-xs uppercase font-bold tracking-widest text-white/70 mb-3">Best Score</p>
                <p className="text-4xl font-black text-white">{stats.bestScore}</p>
              </div>
              <div className="border-4 border-white bg-black/50 p-6 backdrop-blur-sm" style={{ boxShadow: '4px 4px 0px 0px rgba(255,255,255,0.2)' }}>
                <p className="font-mono text-xs uppercase font-bold tracking-widest text-white/70 mb-3">Total Time</p>
                <p className="text-4xl font-black text-white">{Math.floor(stats.totalTime / 60)}m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between gap-6 mb-8">
            <h2 className="font-serif text-3xl md:text-4xl font-black uppercase tracking-tighter text-white" style={{ letterSpacing: '-0.02em' }}>
              ALL CALLS
            </h2>

            {/* Sort Controls */}
            {calls.length > 0 && (
              <div className="flex gap-3 border-4 border-white bg-black/50 backdrop-blur-sm">
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider border-r-4 border-white transition-all ${
                    sortBy === 'date'
                      ? 'bg-white text-black'
                      : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setSortBy('score')}
                  className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                    sortBy === 'score'
                      ? 'bg-white text-black'
                      : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                >
                  Best
                </button>
              </div>
            )}
          </div>

          {/* Calls List */}
          {calls.length === 0 ? (
            <div className="border-4 border-white bg-black/50 backdrop-blur-sm p-16 text-center" style={{ boxShadow: '4px 4px 0px 0px rgba(255,255,255,0.2)' }}>
              <p className="font-serif text-2xl font-black uppercase mb-3 text-white" style={{ letterSpacing: '-0.01em' }}>
                No Calls Yet
              </p>
              <p className="font-mono text-sm text-white/70 mb-6">Start a simulation to build your history</p>
              <button
                onClick={handleNewCall}
                className="border-4 border-white bg-black text-white font-serif font-black text-lg uppercase px-8 py-4 inline-flex items-center gap-3"
                style={{ boxShadow: '6px 6px 0px 0px rgba(255,255,255,0.3)' }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(6px, 6px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px rgba(255,255,255,0.3)';
                }}
              >
                START NEW CALL
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCalls.map((call) => (
                <div
                  key={call.id}
                  onClick={() => handleViewCall(call.id)}
                  className="border-4 border-white bg-black/50 backdrop-blur-sm p-6 cursor-pointer transition-all duration-150"
                  style={{
                    boxShadow: '4px 4px 0px 0px rgba(255,255,255,0.2)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translate(-4px, -4px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '8px 8px 0px 0px rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translate(0, 0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0px 0px rgba(255,255,255,0.2)';
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs uppercase font-bold tracking-wider text-white/70 mb-1">
                        {call.personaName}
                      </p>
                      <p className="text-sm text-white/90 font-medium mb-2">{call.personaTitle}</p>
                      <p className="text-xs text-white/60">{formatDate(call.date)}</p>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-4xl font-black text-white">{call.score}</p>
                        <p className="font-mono text-xs uppercase font-bold text-white/60">/100</p>
                      </div>

                      <button
                        onClick={(e) => handleDelete(call.id, e)}
                        className="p-2 hover:bg-red-500/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t-2 border-white/30 pt-4">
                    <p className="font-mono text-xs uppercase font-bold text-white/60 mb-1">Duration</p>
                    <p className="font-medium text-white">{formatDuration(call.duration)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="border-t-4 border-white py-8 px-8 mt-12 bg-black/40">
          <div className="max-w-7xl mx-auto text-center font-mono text-xs uppercase font-bold tracking-widest text-white/70">
            CLOSERR © 2024 | TRACK YOUR PROGRESS
          </div>
        </footer>
      </div>
    </div>
  );
}
