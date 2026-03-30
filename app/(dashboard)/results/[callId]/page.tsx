'use client';

import { useEffect, useRef } from 'react';
import { useCallStore } from '@/lib/state/callStore';
import { useRouter } from 'next/navigation';
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#000000] flex flex-col">
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
            • YOU CRUSHED IT • ANALYZE YOUR PERFORMANCE • KEEP IMPROVING • MASTER OBJECTIONS • YOU CRUSHED IT • ANALYZE YOUR PERFORMANCE • KEEP IMPROVING • MASTER OBJECTIONS •
          </div>
        </div>
      </div>

      {/* Header - Fixed */}
      <div className="border-b-4 border-[#000000] px-8 py-8 bg-[#FAFAFA] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-3xl md:text-4xl font-black uppercase tracking-tighter" style={{ letterSpacing: '-0.02em' }}>CALL COMPLETE</h1>
              <p className="font-mono text-xs uppercase tracking-wider text-gray-600 mt-2">
                Session with {personaName || 'Unknown'} • {personaTitle || ''}
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => router.push('/dashboard')}
                className="border-4 border-[#000000] bg-white text-black font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleNewCall}
                className="border-4 border-[#000000] bg-[#FF2A85] text-white font-serif font-black text-sm uppercase px-6 py-3 flex items-center gap-2"
                style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(4px, 4px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,1)';
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                NEW CALL
              </button>
            </div>
          </div>

          {/* Overall Score */}
          {latestMetrics && (
            <div className="border-4 border-[#000000] p-8" style={{ backgroundColor: '#FF2A85', color: '#FAFAFA', boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
              <p className="font-mono text-xs uppercase font-bold tracking-widest mb-3 opacity-90">Total Score</p>
              <p className="text-6xl md:text-7xl font-black" style={{ fontSize: 'clamp(3rem, 12vw, 5rem)' }}>
                {latestMetrics.totalScore}
              </p>
              <p className="font-mono text-sm uppercase font-bold tracking-wide mt-2">/100</p>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-8 py-12 space-y-8 max-w-7xl mx-auto">
          {/* Transcript */}
          <div className="border-4 border-[#000000] p-8" style={{ backgroundColor: '#FAFAFA', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)' }}>
            <h2 className="font-serif text-2xl font-black uppercase tracking-tighter mb-6" style={{ letterSpacing: '-0.01em' }}>
              Conversation Transcript
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-4">
              {messages.length === 0 ? (
                <p className="font-mono text-sm text-gray-600">No messages recorded</p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="border-4 border-[#000000] p-4"
                    style={{
                      backgroundColor: msg.speaker === 'user' ? '#FF2A85' : '#00E5FF',
                      color: msg.speaker === 'user' ? '#FAFAFA' : '#000000',
                      boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.2)',
                    }}
                  >
                    <p className="font-mono text-xs font-bold uppercase tracking-widest mb-2 opacity-75">
                      {msg.speaker === 'user' ? '👤 You' : '🤖 AI'}
                    </p>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Scoring Breakdown */}
          {latestMetrics && (
            <div>
              <h2 className="font-serif text-2xl font-black uppercase tracking-tighter mb-6" style={{ letterSpacing: '-0.01em' }}>
                Scoring Breakdown
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* Conversational Metrics */}
                <div className="border-4 border-[#000000] p-6" style={{ backgroundColor: '#FAFAFA', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-lg font-black uppercase">Conversational</h3>
                      <p className="font-mono text-xs text-gray-600 mt-1">Speaking style & pacing</p>
                    </div>
                    <span className="text-3xl font-black">{latestMetrics.conversationalScore}/25</span>
                  </div>
                  <div className="space-y-2 border-t-2 border-gray-300 pt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Talk-to-Listen Ratio</span>
                      <span className={latestMetrics.talkRatio * 100 > 65 || latestMetrics.talkRatio * 100 < 35 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                        {Math.round(latestMetrics.talkRatio * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Speaking Pace (WPM)</span>
                      <span className={latestMetrics.wpm > 180 || latestMetrics.wpm < 120 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                        {latestMetrics.wpm}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Questions Asked</span>
                      <span className={latestMetrics.questionCount < 8 || latestMetrics.questionCount > 25 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                        {latestMetrics.questionCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Discovery Depth */}
                <div className="border-4 border-[#000000] p-6" style={{ backgroundColor: '#FAFAFA', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-lg font-black uppercase">Discovery</h3>
                      <p className="font-mono text-xs text-gray-600 mt-1">Question quality & depth</p>
                    </div>
                    <span className="text-3xl font-black">{latestMetrics.discoveryScore}/25</span>
                  </div>
                  <div className="space-y-2 border-t-2 border-gray-300 pt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Level 1 Questions</span>
                      <span className="font-mono">{latestMetrics.level1Questions} × 1pt</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level 2 Questions</span>
                      <span className="font-mono">{latestMetrics.level2Questions} × 3pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level 3 Questions</span>
                      <span className="font-mono font-bold text-green-600">{latestMetrics.level3Questions} × 7pts</span>
                    </div>
                  </div>
                </div>

                {/* Tactical Empathy */}
                <div className="border-4 border-[#000000] p-6" style={{ backgroundColor: '#00E5FF', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-lg font-black uppercase">Empathy</h3>
                      <p className="font-mono text-xs text-gray-800 mt-1">Negotiation techniques</p>
                    </div>
                    <span className="text-3xl font-black">{latestMetrics.empathyScore}/20</span>
                  </div>
                  <div className="space-y-2 border-t-4 border-black pt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Labeling</span>
                      <span className="font-bold">{latestMetrics.labelingCount} × 5pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mirroring</span>
                      <span className="font-bold">{latestMetrics.mirroringCount} × 3pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calibrated Qs</span>
                      <span className="font-bold">{latestMetrics.calibratedQCount} × 5pts</span>
                    </div>
                  </div>
                </div>

                {/* Persona Alignment */}
                <div className="border-4 border-[#000000] p-6" style={{ backgroundColor: '#FF5E00', color: '#FAFAFA', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-lg font-black uppercase">Persona Alignment</h3>
                      <p className="font-mono text-xs opacity-75 mt-1">Buyer value drivers</p>
                    </div>
                    <span className="text-3xl font-black">{latestMetrics.personaAlignmentScore}/10</span>
                  </div>
                  <div className="space-y-2 border-t-4 border-current pt-4 text-sm">
                    {personaName.includes('CFO') && (
                      <div className="flex justify-between">
                        <span>ROI Mentioned</span>
                        <span className="font-bold">{latestMetrics.roiMentioned ? '✓' : '✗'}</span>
                      </div>
                    )}
                    {personaName.includes('Founder') && (
                      <div className="flex justify-between">
                        <span>Speed Mentioned</span>
                        <span className="font-bold">{latestMetrics.speedMentioned ? '✓' : '✗'}</span>
                      </div>
                    )}
                    {personaName.includes('SMB') && (
                      <div className="flex justify-between">
                        <span>Cost Mentioned</span>
                        <span className="font-bold">{latestMetrics.costMentioned ? '✓' : '✗'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Objection Handling */}
                <div className="border-4 border-[#000000] p-6" style={{ backgroundColor: '#FAFAFA', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-lg font-black uppercase">Objections</h3>
                      <p className="font-mono text-xs text-gray-600 mt-1">Recovery & persuasion</p>
                    </div>
                    <span className="text-3xl font-black">{latestMetrics.objectionScore}/10</span>
                  </div>
                  <div className="space-y-2 border-t-2 border-gray-300 pt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Objections Raised</span>
                      <span className="font-mono">{latestMetrics.objectionsRaised}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Objections Handled</span>
                      <span className={`font-bold ${latestMetrics.objectionsHandled > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {latestMetrics.objectionsHandled}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Closing Execution */}
                <div className="border-4 border-[#000000] p-6" style={{ backgroundColor: '#FAFAFA', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-lg font-black uppercase">Closing</h3>
                      <p className="font-mono text-xs text-gray-600 mt-1">Next steps & commitment</p>
                    </div>
                    <span className="text-3xl font-black">{latestMetrics.closingScore}/10</span>
                  </div>
                  <div className="space-y-2 border-t-2 border-gray-300 pt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Next Step Confirmed</span>
                      <span className={`font-bold ${latestMetrics.nextStepConfirmed ? 'text-green-600' : 'text-red-600'}`}>
                        {latestMetrics.nextStepConfirmed ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calendar Invite</span>
                      <span className={`font-bold ${latestMetrics.calendarInviteAccepted ? 'text-green-600' : 'text-gray-600'}`}>
                        {latestMetrics.calendarInviteAccepted ? '✓' : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mutual Action Plan</span>
                      <span className={`font-bold ${latestMetrics.mutualActionPlan ? 'text-green-600' : 'text-gray-600'}`}>
                        {latestMetrics.mutualActionPlan ? '✓' : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t-4 border-[#000000] py-8 px-8 mt-12">
        <div className="max-w-7xl mx-auto text-center font-mono text-xs uppercase font-bold tracking-widest">
          CLOSERR © 2024 | TRACK YOUR PROGRESS
        </div>
      </footer>
    </div>
  );
}
