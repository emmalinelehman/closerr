'use client';

import { useEffect, useRef, useState } from 'react';
import { useCallStore } from '@/lib/state/callStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useCallHistory } from '@/hooks/useCallHistory';

export default function ResultsPage() {
  const router = useRouter();
  const store = useCallStore();
  const { saveCall } = useCallHistory();
  const savedRef = useRef(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    transcript: false,
  });

  const personaName = store.personaName;
  const personaTitle = store.personaTitle;
  const messages = store.callMessages;
  const latestMetrics = store.finalScorecard;

  // Save call to history on mount
  useEffect(() => {
    if (savedRef.current) return;
    if (latestMetrics && !latestMetrics.totalScore) return;

    if (latestMetrics) {
      savedRef.current = true;
      const transcript = messages.map(m => `${m.speaker === 'user' ? 'You' : 'AI'}: ${m.text}`).join('\n\n');

      saveCall({
        id: `call-${Date.now()}`,
        personaId: store.personaId,
        personaName,
        personaTitle,
        score: latestMetrics.totalScore,
        duration: latestMetrics.duration,
        date: Date.now(),
        transcript,
      });
    }
  }, [latestMetrics, messages, store.personaId, personaName, personaTitle, saveCall]);

  const handleNewCall = () => {
    store.resetCall();
    router.push('/');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
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

  return (
    <div className="min-h-screen text-black flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 md:px-12 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-5xl md:text-6xl font-black uppercase" style={{ letterSpacing: '-0.02em' }}>
              Results
            </h1>
            <p className="font-mono text-xs uppercase tracking-wider text-gray-600 mt-3">
              {personaName || 'Unknown'} • {personaTitle || ''}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-white border border-gray-300 text-black font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={handleNewCall}
              className="bg-black text-white font-serif font-black text-sm uppercase px-4 py-2 rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              New Call
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-12">
        <div className="space-y-12">
          {/* Score Card */}
          {latestMetrics && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-4">Total Score</p>
              <p className="text-6xl md:text-7xl font-black" style={{ lineHeight: '1' }}>
                {latestMetrics.totalScore}
              </p>
              <p className="font-mono text-sm uppercase font-bold tracking-wide mt-2 text-gray-600">/100</p>

              {/* Score Interpretation */}
              <div className="mt-8 pt-8 border-t border-gray-300">
                <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-4">Score Interpretation</p>
                  <div className="space-y-2 text-sm">
                    {latestMetrics.totalScore >= 85 && (
                      <p className="text-green-700 font-semibold">
                        🎯 Excellent! You demonstrated strong discovery depth, authentic engagement, and persona alignment.
                      </p>
                    )}
                    {latestMetrics.totalScore >= 70 && latestMetrics.totalScore < 85 && (
                      <p className="text-blue-700 font-semibold">
                        ✓ Strong! You progressed through discovery levels and adapted well to the persona.
                      </p>
                    )}
                    {latestMetrics.totalScore >= 40 && latestMetrics.totalScore < 70 && (
                      <p className="text-orange-700 font-semibold">
                        → Good effort. Keep working on deeper discovery questions and persona alignment.
                      </p>
                    )}
                    {latestMetrics.totalScore < 40 && (
                      <p className="text-gray-700 font-semibold">
                        ⚠ Focus on asking more questions to uncover the prospect's real challenges and priorities.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Call Info */}
          {latestMetrics && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-4">Call Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-bold">{formatDuration(latestMetrics.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-bold">{formatDate(Date.now())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Persona</span>
                  <span className="font-bold">{personaName}</span>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          {latestMetrics && (
            <div>
              <h2 className="font-serif text-3xl font-black uppercase mb-8" style={{ letterSpacing: '-0.02em' }}>
                Performance Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Conversational */}
                  <div className="border border-gray-200 bg-white rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif text-lg font-black uppercase">Conversational</h3>
                        <p className="font-mono text-xs text-gray-600 mt-1">Control, pacing & engagement</p>
                      </div>
                      <span className="text-3xl font-black">{latestMetrics.conversationalScore ?? 0}/25</span>
                    </div>
                    <div className="space-y-2 border-t border-gray-200 pt-4 text-xs">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-mono text-gray-600">Talk-to-Listen Ratio</span>
                          <p className="text-gray-600 text-xs mt-0.5">Target: 45-55% (you talk/prospect talks)</p>
                        </div>
                        <span className="font-bold text-lg">{latestMetrics.talkToListen ?? 50}%</span>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <span className="font-mono text-gray-600">Speaking Pace (WPM)</span>
                          <p className="text-gray-600 text-xs mt-0.5">Target: 120-160 words/min</p>
                        </div>
                        <span className="font-bold text-lg">{latestMetrics.wpm ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <span className="font-mono text-gray-600">Questions Asked</span>
                          <p className="text-gray-600 text-xs mt-0.5">Target: 8+ questions per call</p>
                        </div>
                        <span className="font-bold text-lg">{latestMetrics.questionCount ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Discovery */}
                  <div className="border border-gray-200 bg-white rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif text-lg font-black uppercase">Discovery</h3>
                        <p className="font-mono text-xs text-gray-600 mt-1">Question progression & depth</p>
                      </div>
                      <span className="text-3xl font-black">{latestMetrics.discoveryScore || 0}/30</span>
                    </div>
                    <div className="space-y-2 border-t border-gray-200 pt-4 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-gray-600">Level 1: Current State</span>
                          <span className="font-mono">{latestMetrics.level1Questions ?? 0} (1pt each)</span>
                        </div>
                        <p className="text-gray-600 text-xs">Learning about their existing situation</p>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-gray-600">Level 2: Problems</span>
                          <span className="font-mono">{latestMetrics.level2Questions ?? 0} (3pts each)</span>
                        </div>
                        <p className="text-gray-600 text-xs">Uncovering pain points & challenges</p>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-mono font-bold text-gray-800">Level 3: Impact</span>
                          <span className="font-mono font-bold">{latestMetrics.level3Questions ?? 0} (7pts each)</span>
                        </div>
                        <p className="text-gray-600 text-xs">Connecting to business outcomes & emotions</p>
                      </div>
                    </div>
                  </div>

                  {/* Empathy */}
                  <div className="border border-gray-200 bg-white rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif text-lg font-black uppercase">Empathy</h3>
                        <p className="font-mono text-xs text-gray-600 mt-1">Understanding & tactical skills</p>
                      </div>
                      <span className="text-3xl font-black">{latestMetrics.empathyScore ?? 0}/20</span>
                    </div>
                    <div className="space-y-2 border-t border-gray-200 pt-4 text-xs">
                      <div className="flex justify-between">
                        <span className="font-mono text-gray-600">Labeling</span>
                        <span className="font-bold">{latestMetrics.labelingCount ?? 0} uses (4pts each)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-gray-600">Mirroring</span>
                        <span className="font-bold">{latestMetrics.mirroringCount ?? 0} uses (2pts each)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-gray-600">Calibrated Qs</span>
                        <span className="font-bold">{latestMetrics.calibratedQCount ?? 0} uses (4pts each)</span>
                      </div>
                    </div>
                  </div>

                  {/* Persona Alignment */}
                  <div className="border border-gray-200 bg-white rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif text-lg font-black uppercase">Alignment</h3>
                        <p className="font-mono text-xs text-gray-600 mt-1">Buyer value drivers</p>
                      </div>
                      <span className="text-3xl font-black">{latestMetrics.personaAlignmentScore ?? 0}/10</span>
                    </div>
                    <div className="space-y-2 border-t border-gray-200 pt-4 text-sm">
                      {personaName.includes('CFO') && (
                        <div className="flex justify-between">
                          <span>ROI Mentioned</span>
                          <span className="font-bold">{latestMetrics.roiMentioned ?? false ? '✓' : '✗'}</span>
                        </div>
                      )}
                      {personaName.includes('Founder') && (
                        <div className="flex justify-between">
                          <span>Speed Mentioned</span>
                          <span className="font-bold">{latestMetrics.speedMentioned ?? false ? '✓' : '✗'}</span>
                        </div>
                      )}
                      {personaName.includes('SMB') && (
                        <div className="flex justify-between">
                          <span>Cost Mentioned</span>
                          <span className="font-bold">{latestMetrics.costMentioned ?? false ? '✓' : '✗'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Objections */}
                  <div className="border border-gray-200 bg-white rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif text-lg font-black uppercase">Objections</h3>
                        <p className="font-mono text-xs text-gray-600 mt-1">Recovery & persuasion</p>
                      </div>
                      <span className="text-3xl font-black">{latestMetrics.objectionScore ?? 0}/10</span>
                    </div>
                    <div className="space-y-2 border-t border-gray-200 pt-4 text-sm">
                      <div className="flex justify-between">
                        <span>Objections Raised</span>
                        <span className="font-mono">{latestMetrics.objectionsRaised ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Objections Handled</span>
                        <span className="font-bold">{latestMetrics.objectionsHandled ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Closing */}
                  <div className="border border-gray-200 bg-white rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif text-lg font-black uppercase">Closing</h3>
                        <p className="font-mono text-xs text-gray-600 mt-1">Next steps & commitment</p>
                      </div>
                      <span className="text-3xl font-black">{latestMetrics.closingScore ?? 0}/10</span>
                    </div>
                    <div className="space-y-2 border-t border-gray-200 pt-4 text-sm">
                      <div className="flex justify-between">
                        <span>Next Step Confirmed</span>
                        <span className="font-bold">{latestMetrics.nextStepConfirmed ?? false ? '✓' : '✗'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calendar Invite</span>
                        <span className="font-bold">{latestMetrics.calendarInviteAccepted ?? false ? '✓' : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mutual Action Plan</span>
                        <span className="font-bold">{latestMetrics.mutualActionPlan ?? false ? '✓' : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Transcript */}
          <div className="border border-gray-200 bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('transcript')}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-serif text-lg font-black uppercase">Conversation Transcript</h3>
              <ChevronDown
                className="w-5 h-5 transition-transform text-gray-600"
                style={{
                  transform: expandedSections.transcript ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            {expandedSections.transcript && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="font-mono text-sm text-gray-600">No messages recorded</p>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className="border-l-2 pl-4 py-2"
                        style={{
                          borderLeftColor: msg.speaker === 'user' ? '#000000' : '#E0E0E0',
                        }}
                      >
                        <p className="font-mono text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">
                          {msg.speaker === 'user' ? '👤 You' : '🤖 AI'}
                        </p>
                        <p className="leading-relaxed text-sm text-gray-900">{msg.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-8 md:px-12 bg-white">
        <div className="text-center font-mono text-xs uppercase font-bold tracking-widest text-gray-600">
          CLOSERR © 2024 | TRACK YOUR PROGRESS
        </div>
      </footer>
    </div>
  );
}
