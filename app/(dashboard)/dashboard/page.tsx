'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading your calls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="border-b border-gray-300 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-8 md:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold">Dashboard</h1>
              <p className="text-lg text-gray-600 mt-2">Track your sales training progress</p>
            </div>
            <Button
              onClick={handleNewCall}
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 font-semibold flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              New Training
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Total Calls</p>
              <p className="text-3xl font-bold text-black">{stats.totalCalls}</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Avg Score</p>
              <p className="text-3xl font-bold text-black">{stats.avgScore}</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Best Score</p>
              <p className="text-3xl font-bold text-black">{stats.bestScore}</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Total Time</p>
              <p className="text-2xl font-bold text-black">{Math.floor(stats.totalTime / 60)}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-8 md:py-10">
        {/* Sort Controls */}
        {calls.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 font-semibold">Sort by:</span>
            <button
              onClick={() => setSortBy('date')}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                sortBy === 'date'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                sortBy === 'score'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              Top Scores
            </button>
          </div>
        )}

        {/* Calls List */}
        {calls.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="text-xl font-semibold text-black mb-2">No calls yet</h3>
            <p className="text-gray-600 mb-6">Start your first training session to see your results here.</p>
            <Button onClick={handleNewCall} className="bg-black hover:bg-gray-800 text-white">
              Start Training
            </Button>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {sortedCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => handleViewCall(call.id)}
                className="bg-gray-50 border border-gray-300 rounded-lg p-4 md:p-6 cursor-pointer hover:bg-gray-100 transition-all group"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left: Persona Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-black text-lg">{call.personaName}</h3>
                      <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                        {call.personaTitle}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">{formatDate(call.date)}</p>
                  </div>

                  {/* Right: Score & Duration */}
                  <div className="flex items-center gap-4">
                    <div className="border border-gray-300 rounded-lg p-3 bg-white">
                      <div className="text-xs text-gray-600 uppercase font-semibold mb-1">Score</div>
                      <div className="text-2xl sm:text-3xl font-bold text-black">
                        {call.score}
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-gray-600 uppercase font-semibold mb-1">Duration</div>
                      <div className="text-sm text-black font-semibold">{formatDuration(call.duration)}</div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(call.id, e)}
                      className="p-2 hover:bg-gray-200 rounded transition-all text-gray-600 hover:text-black opacity-0 group-hover:opacity-100"
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
