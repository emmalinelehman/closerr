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
    <div className="min-h-screen bg-white text-black">
      {/* Header with borders and background */}
      <div className="border-b-4 border-black" style={{ backgroundImage: 'url(/tiles.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <h1 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tighter" style={{ letterSpacing: '-0.02em' }}>
              DASHBOARD
            </h1>
            <button
              onClick={handleNewCall}
              className="border-4 border-black bg-black text-white font-serif font-black text-lg uppercase px-8 py-4 flex items-center gap-3 transition-all"
              style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.3)' }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(6px, 6px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,0.3)';
              }}
            >
              NEW CALL
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Grid */}
          <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-4">Stats</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-4 border-black p-4" style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.2)' }}>
              <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-2">Total Calls</p>
              <p className="text-3xl font-black">{stats.totalCalls}</p>
            </div>
            <div className="border-4 border-black p-4" style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.2)' }}>
              <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-2">Avg Score</p>
              <p className="text-3xl font-black">{stats.avgScore}</p>
            </div>
            <div className="border-4 border-black p-4" style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.2)' }}>
              <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-2">Best Score</p>
              <p className="text-3xl font-black">{stats.bestScore}</p>
            </div>
            <div className="border-4 border-black p-4" style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.2)' }}>
              <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-2">Total Time</p>
              <p className="text-3xl font-black">{Math.floor(stats.totalTime / 60)}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calls Section */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between gap-6 mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-black uppercase tracking-tighter" style={{ letterSpacing: '-0.02em' }}>
            CALLS
          </h2>

          {/* Sort Controls */}
          {calls.length > 0 && (
            <div className="flex gap-3 border-4 border-black">
              <button
                onClick={() => setSortBy('date')}
                className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider border-r-4 border-black transition-all ${
                  sortBy === 'date'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('score')}
                className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                  sortBy === 'score'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                Best
              </button>
            </div>
          )}
        </div>

        {/* Calls List */}
        {calls.length === 0 ? (
          <div className="border-4 border-black p-12 text-center" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)' }}>
            <p className="font-serif text-2xl font-black uppercase mb-3" style={{ letterSpacing: '-0.01em' }}>
              No Calls Yet
            </p>
            <p className="font-mono text-sm text-gray-600 mb-6">Start a simulation to build your history</p>
            <button
              onClick={handleNewCall}
              className="border-4 border-black bg-black text-white font-serif font-black text-lg uppercase px-8 py-4 inline-flex items-center gap-3"
              style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.3)' }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(6px, 6px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,0.3)';
              }}
            >
              START NEW CALL
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => handleViewCall(call.id)}
                className="border-4 border-black p-6 cursor-pointer transition-all duration-150"
                style={{
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translate(-4px, -4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,0.2)';
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs uppercase font-bold tracking-wider text-gray-600 mb-1">
                      {call.personaName}
                    </p>
                    <p className="text-sm font-medium mb-1">{call.personaTitle}</p>
                    <p className="text-xs text-gray-600">{formatDate(call.date)}</p>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-3xl font-black">{call.score}</p>
                      <p className="font-mono text-xs uppercase font-bold text-gray-600">/100</p>
                    </div>

                    <button
                      onClick={(e) => handleDelete(call.id, e)}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="border-t-2 border-gray-300 pt-3">
                  <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Duration</p>
                  <p className="font-medium">{formatDuration(call.duration)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
