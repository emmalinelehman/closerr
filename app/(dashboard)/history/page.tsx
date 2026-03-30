'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCallHistory } from '@/hooks/useCallHistory';
import { ArrowRight, Trash2, TrendingUp, Zap, BadgeDollarSign } from 'lucide-react';

const personaIcons = {
  'skeptical-cfo': <TrendingUp className="w-8 h-8" />,
  'busy-founder': <Zap className="w-8 h-8" />,
  'price-sensitive': <BadgeDollarSign className="w-8 h-8" />,
};

const personaColors = {
  'skeptical-cfo': { bg: '#FF2A85', text: '#FAFAFA' },
  'busy-founder': { bg: '#00E5FF', text: '#000000' },
  'price-sensitive': { bg: '#FF5E00', text: '#FAFAFA' },
};

export default function HistoryPage() {
  const router = useRouter();
  const { calls, isLoading, deleteCall, getStats } = useCallHistory();
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = getStats();

  const sortedCalls = [...calls].sort((a, b) => {
    if (sortBy === 'date') {
      return b.date - a.date;
    }
    return b.score - a.score;
  });

  const personaStats = calls.reduce((acc, call) => {
    const persona = call.personaId;
    if (!acc[persona]) {
      acc[persona] = { count: 0, totalScore: 0, bestScore: 0, totalTime: 0 };
    }
    acc[persona].count += 1;
    acc[persona].totalScore += call.score;
    acc[persona].bestScore = Math.max(acc[persona].bestScore, call.score);
    acc[persona].totalTime += call.duration;
    return acc;
  }, {} as Record<string, { count: number; totalScore: number; bestScore: number; totalTime: number }>);

  const getPersonaAvg = (personaId: string) => {
    if (!personaStats[personaId]) return 0;
    return Math.round(personaStats[personaId].totalScore / personaStats[personaId].count);
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

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this call?')) {
      deleteCall(id);
    }
  };

  const handleViewCall = (id: string) => {
    router.push(`/results/${id}`);
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#000000] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#000000] border-t-[#FF2A85] mx-auto mb-4" />
          <p className="font-mono text-sm uppercase tracking-widest">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#000000] font-sans">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .marquee-scroll {
          animation: scroll 15s linear infinite;
        }
      `}</style>

      {/* MARQUEE TICKER */}
      <div className="border-b-4 border-t-4 border-[#000000] bg-[#00E5FF] py-3 overflow-hidden">
        <div className="flex marquee-scroll whitespace-nowrap">
          <div className="text-black font-mono font-bold tracking-widest text-lg px-8">
            • YOUR SALES STATS • TRACK PROGRESS • MASTER EVERY PERSONA • CONTINUOUS IMPROVEMENT • YOUR SALES STATS • TRACK PROGRESS • MASTER EVERY PERSONA • CONTINUOUS IMPROVEMENT •
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="border-b-4 border-[#000000] py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-2xl md:text-3xl font-bold tracking-tighter uppercase font-serif" style={{ letterSpacing: '-0.02em' }}>
            CALL HISTORY
          </div>
        </div>
      </nav>

      {/* STATS SECTION */}
      {stats.totalCalls > 0 && (
        <section className="border-b-4 border-[#000000] py-12 md:py-16 px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12" style={{ letterSpacing: '-0.02em' }}>
              YOUR STATS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {/* Total Calls */}
              <div className="border-4 border-[#000000] p-8" style={{ backgroundColor: '#FAFAFA', boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}>
                <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-3">Total Calls</p>
                <p className="text-5xl font-black" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}>{stats.totalCalls}</p>
              </div>

              {/* Average Score */}
              <div className="border-4 border-[#000000] p-8" style={{ backgroundColor: '#FF2A85', color: '#FAFAFA', boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}>
                <p className="font-mono text-xs uppercase font-bold tracking-widest mb-3 opacity-90">Average Score</p>
                <p className="text-5xl font-black" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}>{stats.avgScore}</p>
              </div>

              {/* Best Score */}
              <div className="border-4 border-[#000000] p-8" style={{ backgroundColor: '#00E5FF', color: '#000000', boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}>
                <p className="font-mono text-xs uppercase font-bold tracking-widest mb-3">Best Score</p>
                <p className="text-5xl font-black" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}>{stats.bestScore}</p>
              </div>

              {/* Total Time */}
              <div className="border-4 border-[#000000] p-8" style={{ backgroundColor: '#FF5E00', color: '#FAFAFA', boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}>
                <p className="font-mono text-xs uppercase font-bold tracking-widest mb-3 opacity-90">Total Time</p>
                <p className="text-2xl font-black">{Math.floor(stats.totalTime / 60)}m</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PERSONA BREAKDOWN */}
      {Object.keys(personaStats).length > 0 && (
        <section className="border-b-4 border-[#000000] py-12 md:py-16 px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12" style={{ letterSpacing: '-0.02em' }}>
              PERSONA BREAKDOWN
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(personaStats).map(([personaId, stats]) => {
                const colors = personaColors[personaId as keyof typeof personaColors];
                const personaName = personaId === 'skeptical-cfo' ? 'SKEPTICAL CFO' :
                                  personaId === 'busy-founder' ? 'BUSY FOUNDER' : 'SMB OWNER';

                return (
                  <div
                    key={personaId}
                    className="border-4 border-[#000000] p-8"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="text-2xl">{personaIcons[personaId as keyof typeof personaIcons]}</div>
                      <h3 className="font-serif text-xl font-black uppercase" style={{ letterSpacing: '-0.01em' }}>
                        {personaName}
                      </h3>
                    </div>

                    <div className="space-y-3 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="opacity-75">Calls</span>
                        <span className="font-bold">{stats.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Avg Score</span>
                        <span className="font-bold">{Math.round(stats.totalScore / stats.count)}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Best Score</span>
                        <span className="font-bold">{stats.bestScore}/100</span>
                      </div>
                      <div className="flex justify-between border-t border-current pt-3 mt-3 opacity-75">
                        <span>Time Spent</span>
                        <span>{Math.floor(stats.totalTime / 60)}m</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CALL LIST */}
      <section className="border-b-4 border-[#000000] py-12 md:py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <h2 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tighter" style={{ letterSpacing: '-0.02em' }}>
              ALL CALLS
            </h2>

            <div className="flex gap-3 border-4 border-[#000000] bg-white">
              <button
                onClick={() => setSortBy('date')}
                className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider border-r-4 border-[#000000] ${
                  sortBy === 'date'
                    ? 'bg-[#000000] text-white'
                    : 'bg-white text-[#000000] hover:bg-gray-100'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('score')}
                className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider ${
                  sortBy === 'score'
                    ? 'bg-[#000000] text-white'
                    : 'bg-white text-[#000000] hover:bg-gray-100'
                }`}
              >
                Best
              </button>
            </div>
          </div>

          {sortedCalls.length === 0 ? (
            <div
              className="border-4 border-[#000000] p-16 text-center"
              style={{
                backgroundColor: '#FAFAFA',
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)',
              }}
            >
              <p className="font-serif text-2xl font-black uppercase mb-3" style={{ letterSpacing: '-0.01em' }}>
                No Calls Yet
              </p>
              <p className="font-mono text-sm text-gray-600 mb-6">Start a simulation to build your history</p>
              <button
                onClick={() => router.push('/')}
                className="border-4 border-[#000000] bg-[#FF2A85] text-white font-serif font-black text-lg uppercase px-8 py-4 inline-flex items-center gap-3"
                style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(6px, 6px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,1)';
                }}
              >
                START NEW CALL
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCalls.map((call) => {
                const colors = personaColors[call.personaId as keyof typeof personaColors];
                return (
                  <div
                    key={call.id}
                    onClick={() => handleViewCall(call.id)}
                    className="border-4 border-[#000000] p-6 cursor-pointer transition-all duration-150"
                    style={{
                      backgroundColor: '#FAFAFA',
                      boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translate(-4px, -4px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translate(0, 0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,0.3)';
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-12 h-12 border-4 border-[#000000] flex items-center justify-center text-lg font-black"
                            style={{
                              backgroundColor: colors.bg,
                              color: colors.text,
                            }}
                          >
                            {personaIcons[call.personaId as keyof typeof personaIcons]}
                          </div>
                          <div>
                            <p className="font-mono text-xs uppercase font-bold tracking-wider text-gray-600">
                              {call.personaName}
                            </p>
                            <p className="text-sm text-gray-700 font-medium">{call.personaTitle}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-4xl font-black" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
                            {call.score}
                          </p>
                          <p className="font-mono text-xs uppercase font-bold text-gray-600">/100</p>
                        </div>

                        <button
                          onClick={(e) => handleDelete(call.id, e)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="border-t-2 border-gray-300 pt-4 flex flex-wrap gap-6 text-sm">
                      <div>
                        <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Duration</p>
                        <p className="font-medium">{formatDuration(call.duration)}</p>
                      </div>
                      <div>
                        <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Date</p>
                        <p className="font-medium">{formatDate(call.date)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-4 border-[#000000] py-8 px-8">
        <div className="max-w-7xl mx-auto text-center font-mono text-xs uppercase font-bold tracking-widest">
          CLOSERR © 2024 | TRACK YOUR PROGRESS
        </div>
      </footer>
    </div>
  );
}
