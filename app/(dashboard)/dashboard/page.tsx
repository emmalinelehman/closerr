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
      {/* Header Section */}
      <div className="border-b border-gray-200 px-8 md:px-12 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-black uppercase" style={{ letterSpacing: '-0.02em' }}>
            Dashboard
          </h1>
          <button
            onClick={handleNewCall}
            className="bg-black text-white font-serif font-black text-sm uppercase px-6 py-3 rounded-md hover:opacity-90 transition-opacity flex items-center gap-2 flex-shrink-0"
          >
            New Call
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
            <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-3">Total Calls</p>
            <p className="text-4xl font-black">{stats.totalCalls}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
            <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-3">Avg Score</p>
            <p className="text-4xl font-black">{stats.avgScore}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
            <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-3">Best Score</p>
            <p className="text-4xl font-black">{stats.bestScore}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
            <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-3">Total Time</p>
            <p className="text-4xl font-black">{Math.floor(stats.totalTime / 60)}m</p>
          </div>
        </div>
      </div>

      {/* Calls Section */}
      <div className="px-8 md:px-12 py-12">
        <div className="flex items-center justify-between gap-6 mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-black uppercase" style={{ letterSpacing: '-0.02em' }}>
            Calls
          </h2>

          {/* Sort Controls */}
          {calls.length > 0 && (
            <div className="flex gap-2 border border-gray-300 rounded-md">
              <button
                onClick={() => setSortBy('date')}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded-l-md ${
                  sortBy === 'date'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Latest
              </button>
              <div className="w-px bg-gray-300" />
              <button
                onClick={() => setSortBy('score')}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded-r-md ${
                  sortBy === 'score'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Best
              </button>
            </div>
          )}
        </div>

        {/* Calls List */}
        {calls.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-12 text-center">
            <p className="font-serif text-2xl font-black uppercase mb-3" style={{ letterSpacing: '-0.01em' }}>
              No Calls Yet
            </p>
            <p className="font-mono text-sm text-gray-600 mb-8">Start a simulation to build your history</p>
            <button
              onClick={handleNewCall}
              className="bg-black text-white font-serif font-black text-sm uppercase px-6 py-3 rounded-md hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              Start New Call
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => handleViewCall(call.id)}
                className="bg-white border border-gray-200 rounded-md p-6 cursor-pointer transition-all duration-150 hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs uppercase font-bold tracking-wider text-gray-600 mb-2">
                      {call.personaName}
                    </p>
                    <p className="text-sm font-semibold mb-1">{call.personaTitle}</p>
                    <p className="text-xs text-gray-600">{formatDate(call.date)}</p>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-3xl font-black">{call.score}</p>
                      <p className="font-mono text-xs text-gray-600">/100</p>
                    </div>

                    <button
                      onClick={(e) => handleDelete(call.id, e)}
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Duration</p>
                  <p className="text-sm font-medium text-gray-900">{formatDuration(call.duration)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
