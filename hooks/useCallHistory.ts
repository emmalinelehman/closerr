'use client';

import { useCallback, useEffect, useState } from 'react';

export interface SavedCall {
  id: string;
  personaId: string;
  personaName: string;
  personaTitle: string;
  score: number;
  duration: number;
  date: number; // timestamp
  transcript: string;
}

export function useCallHistory() {
  const [calls, setCalls] = useState<SavedCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('closerr_call_history');
      if (stored) {
        setCalls(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load call history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCall = useCallback((call: SavedCall) => {
    try {
      const updated = [call, ...calls];
      setCalls(updated);
      localStorage.setItem('closerr_call_history', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save call:', error);
    }
  }, [calls]);

  const deleteCall = useCallback((id: string) => {
    try {
      const updated = calls.filter(c => c.id !== id);
      setCalls(updated);
      localStorage.setItem('closerr_call_history', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete call:', error);
    }
  }, [calls]);

  const clearHistory = useCallback(() => {
    try {
      setCalls([]);
      localStorage.removeItem('closerr_call_history');
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, []);

  const getStats = useCallback(() => {
    if (calls.length === 0) {
      return { totalCalls: 0, avgScore: 0, bestScore: 0, totalTime: 0 };
    }

    const scores = calls.map(c => c.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const bestScore = Math.max(...scores);
    const totalTime = calls.reduce((sum, c) => sum + c.duration, 0);

    return {
      totalCalls: calls.length,
      avgScore,
      bestScore,
      totalTime,
    };
  }, [calls]);

  return {
    calls,
    isLoading,
    saveCall,
    deleteCall,
    clearHistory,
    getStats,
  };
}
