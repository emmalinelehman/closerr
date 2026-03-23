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
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/30';
    if (score >= 60) return 'bg-blue-500/10 border-blue-500/30';
    if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading your calls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Dashboard</h1>
              <p className="text-sm text-slate-400 mt-1">Track your sales training progress</p>
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
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 sm:p-4">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Total Calls</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-400">{stats.totalCalls}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 sm:p-4">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Avg Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-400">{stats.avgScore}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 sm:p-4">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Best Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">{stats.bestScore}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 sm:p-4">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Total Time</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-400">{Math.floor(stats.totalTime / 60)}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Sort Controls */}
        {calls.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-slate-400">Sort by:</span>
            <button
              onClick={() => setSortBy('date')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                sortBy === 'date'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                sortBy === 'score'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Top Scores
            </button>
          </div>
        )}

        {/* Calls List */}
        {calls.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No calls yet</h3>
            <p className="text-slate-400 mb-6">Start your first training session to see your results here.</p>
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
                className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-slate-800/60 transition-all hover:border-slate-600 group"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  {/* Left: Persona Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{call.personaName}</h3>
                      <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                        {call.personaTitle}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 truncate">{formatDate(call.date)}</p>
                  </div>

                  {/* Right: Score & Duration */}
                  <div className="flex items-center gap-4">
                    <div className={`border rounded-lg p-3 ${getScoreBgColor(call.score)}`}>
                      <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Score</div>
                      <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(call.score)}`}>
                        {call.score}
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Duration</div>
                      <div className="text-sm text-slate-300">{formatDuration(call.duration)}</div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(call.id, e)}
                      className="p-2 hover:bg-red-500/20 rounded transition-all text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100"
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
