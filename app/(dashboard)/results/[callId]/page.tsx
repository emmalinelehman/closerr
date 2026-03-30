'use client';

import { useEffect, useRef } from 'react';
import { useCallStore } from '@/lib/state/callStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCallHistory } from '@/hooks/useCallHistory';

export default function ResultsPage() {
  const router = useRouter();
  const store = useCallStore();
  const { saveCall } = useCallHistory();
  const savedRef = useRef(false);

  const personaName = store.personaName;
  const personaTitle = store.personaTitle;
  const messages = store.callMessages;
  const latestMetrics = store.finalScorecard;
  const latestApiMetrics = store.callMetrics[store.callMetrics.length - 1];

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

  const sentimentColor =
    latestApiMetrics?.sentiment === 'Positive'
      ? 'text-emerald-400'
      : latestApiMetrics?.sentiment === 'Negative'
        ? 'text-pink-400'
        : 'text-neutral-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-amber-950/10 to-cyan-950/10 text-white flex flex-col">
      {/* Header - Fixed */}
      <div className="border-b-2 border-b-amber-500/30 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-rose-950/40 via-red-950/20 to-rose-950/40 backdrop-blur-md sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">Call Complete</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 truncate">
              Session with {personaName || 'Unknown'} • {personaTitle || ''}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              Dashboard
            </Button>
            <Button
              onClick={handleNewCall}
              className="flex items-center gap-2 whitespace-nowrap bg-orange-600 hover:bg-orange-700"
            >
              <ArrowLeft className="w-4 h-4" />
              New Call
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        {latestMetrics && (
          <div className="bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-emerald-500/20 border-2 border-amber-500/50 rounded-lg p-3 sm:p-4">
            <p className="text-xs text-amber-400 uppercase font-mono mb-1">Total Score</p>
            <p className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300">
              {latestMetrics.totalScore} / 100
            </p>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {/* Transcript */}
          <div className="bg-gradient-to-br from-neutral-800/40 to-cyan-900/20 border-2 border-cyan-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="h-1 w-1 rounded-full bg-cyan-400"></div>
              <h2 className="text-lg sm:text-xl font-bold text-cyan-300">Conversation Transcript</h2>
            </div>
            <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <p className="text-neutral-400 text-sm">No messages recorded</p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm border-l-2 ${
                      msg.speaker === 'user'
                        ? 'bg-orange-500/10 border border-orange-500/30 border-l-orange-500'
                        : 'bg-cyan-500/10 border border-cyan-500/30 border-l-cyan-500'
                    }`}
                  >
                    <p className={`text-xs font-mono uppercase mb-1 ${msg.speaker === 'user' ? 'text-orange-400' : 'text-cyan-400'}`}>
                      {msg.speaker === 'user' ? '👤 You' : '🤖 AI'}
                    </p>
                    <p className="leading-relaxed break-words">{msg.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Scoring Breakdown */}
          {latestMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Conversational Metrics (25 pts) */}
              <div className="bg-gradient-to-br from-orange-500/10 to-neutral-800/40 border-2 border-orange-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-orange-300">Conversational Metrics</h3>
                    <p className="text-xs text-neutral-400">Speaking style & pacing</p>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-orange-400 whitespace-nowrap">{latestMetrics.conversationalScore}/25</div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Talk-to-Listen Ratio</span>
                    <span className={`whitespace-nowrap ${(latestMetrics.talkRatio * 100) > 65 || (latestMetrics.talkRatio * 100) < 35 ? 'text-red-400' : 'text-green-400'}`}>
                      {Math.round(latestMetrics.talkRatio * 100)}% {(latestMetrics.talkRatio * 100) > 65 || (latestMetrics.talkRatio * 100) < 35 ? '⚠️' : '✓'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Speaking Pace (WPM)</span>
                    <span className={`whitespace-nowrap ${latestMetrics.wpm > 180 || latestMetrics.wpm < 120 ? 'text-red-400' : 'text-green-400'}`}>
                      {latestMetrics.wpm} {latestMetrics.wpm > 180 || latestMetrics.wpm < 120 ? '⚠️' : '✓'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Questions Asked</span>
                    <span className={`whitespace-nowrap ${latestMetrics.questionCount < 8 || latestMetrics.questionCount > 25 ? 'text-red-400' : 'text-green-400'}`}>
                      {latestMetrics.questionCount} {latestMetrics.questionCount < 8 || latestMetrics.questionCount > 25 ? '⚠️' : '✓'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Discovery Depth (25 pts) */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-neutral-800/40 border-2 border-cyan-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-cyan-300">Discovery Depth</h3>
                    <p className="text-xs text-neutral-400">Question quality & sophistication</p>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-cyan-400 whitespace-nowrap">{latestMetrics.discoveryScore}/25</div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Level 1 Questions</span>
                    <span className="text-slate-300 whitespace-nowrap">{latestMetrics.level1Questions} × 1pt</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Level 2 Questions</span>
                    <span className="text-slate-300 whitespace-nowrap">{latestMetrics.level2Questions} × 3pts</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Level 3 Questions</span>
                    <span className="text-green-400 font-bold whitespace-nowrap">{latestMetrics.level3Questions} × 7pts</span>
                  </div>
                </div>
              </div>

              {/* Tactical Empathy (20 pts) */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-neutral-800/40 border-2 border-emerald-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-emerald-300">Tactical Empathy</h3>
                    <p className="text-xs text-neutral-400">Negotiation techniques</p>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400 whitespace-nowrap">{latestMetrics.empathyScore}/20</div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Labeling</span>
                    <span className="text-green-400 whitespace-nowrap">{latestMetrics.labelingCount} × 5pts</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Mirroring</span>
                    <span className="text-green-400 whitespace-nowrap">{latestMetrics.mirroringCount} × 3pts</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Calibrated Qs</span>
                    <span className="text-green-400 whitespace-nowrap">{latestMetrics.calibratedQCount} × 5pts</span>
                  </div>
                  {latestMetrics.penaltyCount > 0 && (
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Penalty Phrases</span>
                      <span className="text-red-400 whitespace-nowrap">-{latestMetrics.penaltyCount} × 5pts</span>
                    </div>
                  )}
                  {latestMetrics.severeViolations > 0 && (
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Violations</span>
                      <span className="text-red-400 whitespace-nowrap">-{latestMetrics.severeViolations} × 10pts</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Persona Alignment (10 pts) */}
              <div className="bg-gradient-to-br from-pink-500/10 to-neutral-800/40 border-2 border-pink-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-pink-300">Persona Alignment</h3>
                    <p className="text-xs text-neutral-400">Buyer value drivers</p>
                  </div>
                  <div className={`text-2xl sm:text-3xl font-bold whitespace-nowrap ${latestMetrics.personaAlignmentScore === 10 ? 'text-pink-400' : 'text-pink-300'}`}>
                    {latestMetrics.personaAlignmentScore}/10
                  </div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  {personaName.includes('CFO') && (
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">ROI Mentioned</span>
                      <span className={`whitespace-nowrap ${latestMetrics.roiMentioned ? 'text-green-400 font-bold' : 'text-red-400'}`}>
                        {latestMetrics.roiMentioned ? '✓' : '✗'}
                      </span>
                    </div>
                  )}
                  {personaName.includes('Founder') && (
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Speed Mentioned</span>
                      <span className={`whitespace-nowrap ${latestMetrics.speedMentioned ? 'text-green-400 font-bold' : 'text-red-400'}`}>
                        {latestMetrics.speedMentioned ? '✓' : '✗'}
                      </span>
                    </div>
                  )}
                  {(personaName.includes('Price') || personaName.includes('SMB')) && (
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Cost Mentioned</span>
                      <span className={`whitespace-nowrap ${latestMetrics.costMentioned ? 'text-green-400 font-bold' : 'text-red-400'}`}>
                        {latestMetrics.costMentioned ? '✓' : '✗'}
                      </span>
                    </div>
                  )}
                  {latestApiMetrics && (
                    <div className="flex justify-between gap-2 mt-2 pt-2 border-t border-slate-700">
                      <span className="text-slate-400">Sentiment</span>
                      <span className={`whitespace-nowrap ${sentimentColor}`}>{latestApiMetrics.sentiment}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Objection Handling (10 pts) */}
              <div className="bg-gradient-to-br from-amber-500/10 to-neutral-800/40 border-2 border-amber-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-amber-300">Objection Handling</h3>
                    <p className="text-xs text-neutral-400">Recovery & persuasion</p>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-amber-400 whitespace-nowrap">{latestMetrics.objectionScore}/10</div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Objections Raised</span>
                    <span className="text-slate-300 whitespace-nowrap">{latestMetrics.objectionsRaised}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Objections Handled</span>
                    <span className={`whitespace-nowrap ${latestMetrics.objectionsHandled > 0 ? 'text-green-400 font-bold' : 'text-slate-400'}`}>
                      {latestMetrics.objectionsHandled}
                    </span>
                  </div>
                  {latestMetrics.objectionsRaised > 0 && (
                    <div className="flex justify-between gap-2 pt-2 border-t border-slate-700">
                      <span className="text-slate-400">Success Rate</span>
                      <span className="text-slate-300 whitespace-nowrap">
                        {Math.round((latestMetrics.objectionsHandled / latestMetrics.objectionsRaised) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Closing Execution (10 pts) */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-neutral-800/40 border-2 border-cyan-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-cyan-300">Closing Execution</h3>
                    <p className="text-xs text-neutral-400">Next steps & commitment</p>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-cyan-400 whitespace-nowrap">{latestMetrics.closingScore}/10</div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Next Step Confirmed</span>
                    <span className={`whitespace-nowrap ${latestMetrics.nextStepConfirmed ? 'text-green-400 font-bold' : 'text-red-400'}`}>
                      {latestMetrics.nextStepConfirmed ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Calendar Invite</span>
                    <span className={`whitespace-nowrap ${latestMetrics.calendarInviteAccepted ? 'text-green-400 font-bold' : 'text-slate-500'}`}>
                      {latestMetrics.calendarInviteAccepted ? '✓' : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Mutual Action Plan</span>
                    <span className={`whitespace-nowrap ${latestMetrics.mutualActionPlan ? 'text-green-400 font-bold' : 'text-slate-500'}`}>
                      {latestMetrics.mutualActionPlan ? '✓' : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Footer */}
          {latestMetrics && (
            <div className="bg-gradient-to-r from-neutral-800/40 via-cyan-900/20 to-neutral-800/40 border-2 border-cyan-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm mt-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-1 rounded-full bg-cyan-400"></div>
                <h3 className="text-base sm:text-lg font-bold text-cyan-300">Score Summary</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Conversational</span>
                  <span className="text-orange-400 font-semibold">{latestMetrics.conversationalScore}/25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Discovery</span>
                  <span className="text-cyan-400 font-semibold">{latestMetrics.discoveryScore}/25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Empathy</span>
                  <span className="text-emerald-400 font-semibold">{latestMetrics.empathyScore}/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Persona</span>
                  <span className="text-pink-400 font-semibold">{latestMetrics.personaAlignmentScore}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Objections</span>
                  <span className="text-amber-400 font-semibold">{latestMetrics.objectionScore}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Closing</span>
                  <span className="text-cyan-400 font-semibold">{latestMetrics.closingScore}/10</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-cyan-500/30 flex justify-between items-center">
                <span className="text-cyan-400 font-semibold">TOTAL</span>
                <span className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300">
                  {latestMetrics.totalScore}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
