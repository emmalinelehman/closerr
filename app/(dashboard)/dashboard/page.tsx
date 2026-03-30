'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCallHistory } from '@/hooks/useCallHistory';
import { Trash2, ArrowRight, BarChart3 } from 'lucide-react';

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-pink-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'bg-cyan-500/10 border-cyan-500/30';
    if (score >= 40) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-pink-500/10 border-pink-500/30';
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
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-rose-950/20 to-orange-950/30 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500 mx-auto mb-4" />
          <p className="text-neutral-400">Loading your calls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-rose-950/20 to-orange-950/30 text-white">
      {/* Header */}
      <div className="border-b border-b-pink-500/30 bg-gradient-to-r from-neutral-900/40 via-pink-900/10 to-neutral-900/40 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Dashboard</h1>
              <p className="text-sm text-neutral-400 mt-1">Track your sales training progress</p>
            </div>
            <Button
              onClick={handleNewCall}
              className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              New Training
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-lg p-3 sm:p-4 hover:bg-orange-500/15 transition-colors">
              <p className="text-xs text-orange-400 uppercase font-semibold mb-1">Total Calls</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-300">{stats.totalCalls}</p>
            </div>
            <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-3 sm:p-4 hover:bg-cyan-500/15 transition-colors">
              <p className="text-xs text-cyan-400 uppercase font-semibold mb-1">Avg Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-cyan-300">{stats.avgScore}</p>
            </div>
            <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-lg p-3 sm:p-4 hover:bg-emerald-500/15 transition-colors">
              <p className="text-xs text-emerald-400 uppercase font-semibold mb-1">Best Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-300">{stats.bestScore}</p>
            </div>
            <div className="bg-pink-500/10 border-2 border-pink-500/30 rounded-lg p-3 sm:p-4 hover:bg-pink-500/15 transition-colors">
              <p className="text-xs text-pink-400 uppercase font-semibold mb-1">Total Time</p>
              <p className="text-lg sm:text-2xl font-bold text-pink-300">{Math.floor(stats.totalTime / 60)}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Sort Controls */}
        {calls.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-neutral-400">Sort by:</span>
            <button
              onClick={() => setSortBy('date')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                sortBy === 'date'
                  ? 'bg-orange-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                sortBy === 'score'
                  ? 'bg-orange-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Top Scores
            </button>
          </div>
        )}

        {/* Calls List */}
        {calls.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-cyan-500/30 rounded-lg">
            <BarChart3 className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">No calls yet</h3>
            <p className="text-neutral-400 mb-6">Start your first training session to see your results here.</p>
            <Button onClick={handleNewCall} className="bg-orange-600 hover:bg-orange-700">
              Start Training
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {sortedCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => handleViewCall(call.id)}
                className="bg-gradient-to-r from-neutral-800/40 to-cyan-900/20 border-2 border-l-4 border-neutral-700 border-l-cyan-500 rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-gradient-to-r hover:from-neutral-800/60 hover:to-cyan-900/30 transition-all group"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  {/* Left: Persona Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{call.personaName}</h3>
                      <span className="text-xs text-neutral-400 bg-neutral-700/50 px-2 py-1 rounded">
                        {call.personaTitle}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-400 truncate">{formatDate(call.date)}</p>
                  </div>

                  {/* Right: Score & Duration */}
                  <div className="flex items-center gap-4">
                    <div className={`border rounded-lg p-3 ${getScoreBgColor(call.score)}`}>
                      <div className="text-xs text-neutral-400 uppercase font-semibold mb-1">Score</div>
                      <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(call.score)}`}>
                        {call.score}
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-neutral-400 uppercase font-semibold mb-1">Duration</div>
                      <div className="text-sm text-neutral-300">{formatDuration(call.duration)}</div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(call.id, e)}
                      className="p-2 hover:bg-pink-500/20 rounded transition-all text-neutral-400 hover:text-pink-400 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
