'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CallMetrics } from '@/lib/state/callStore';
import { ArrowLeft } from 'lucide-react';

interface SessionSummaryProps {
  personaName: string;
  personaTitle: string;
  scorecard: CallMetrics;
  duration: number;
}

const getScoreGrade = (score: number): { grade: string } => {
  if (score >= 85) return { grade: 'Excellent' };
  if (score >= 70) return { grade: 'Strong' };
  if (score >= 55) return { grade: 'Competent' };
  return { grade: 'Needs Improvement' };
};

const ScoreCategory = ({
  label,
  score,
  maxScore,
  details,
}: {
  label: string;
  score: number;
  maxScore: number;
  details?: string;
}) => {
  const percentage = (score / maxScore) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-lg font-bold text-black">
          {Math.round(score)}/{maxScore}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-black rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {details && <p className="text-xs text-gray-600 mt-1">{details}</p>}
    </div>
  );
};

export default function SessionSummary({
  personaName,
  personaTitle,
  scorecard,
  duration,
}: SessionSummaryProps) {
  const router = useRouter();
  const { grade } = getScoreGrade(scorecard.totalScore);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-300 bg-white px-8 md:px-12 py-6 md:py-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Training
        </button>
        <h1 className="text-4xl md:text-5xl font-serif font-bold">Session Complete</h1>
        <p className="text-lg text-gray-700 mt-3">
          {personaName} • {personaTitle}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Overall Score Card */}
          <div className="border border-gray-300 rounded-lg p-8 md:p-10 bg-gray-50">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Final Score
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl md:text-7xl font-serif font-bold text-black">
                    {Math.round(scorecard.totalScore)}
                  </span>
                  <span className="text-2xl text-gray-600">/100</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl md:text-4xl font-serif font-bold text-black">{grade}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-gray-300">
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold tracking-wide mb-2">Duration</p>
                <p className="text-xl font-bold text-black">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold tracking-wide mb-2">Talk Ratio</p>
                <p className="text-xl font-bold text-black">
                  {scorecard.talkToListen}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold tracking-wide mb-2">WPM</p>
                <p className="text-xl font-bold text-black">{scorecard.wpm}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold tracking-wide mb-2">Questions</p>
                <p className="text-xl font-bold text-black">{scorecard.questionCount}</p>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Conversational Metrics */}
            <div className="border border-gray-300 rounded-lg p-6 md:p-8 bg-gray-50 space-y-6">
              <h3 className="text-lg font-serif font-bold text-black">Conversational Metrics</h3>
              <ScoreCategory
                label="Talk-to-Listen Ratio"
                score={scorecard.talkToListen}
                maxScore={100}
                details={
                  scorecard.talkToListen > 65
                    ? '⚠️ Monologue Warning: Exceeded 65%'
                    : `Target: 43-57% (${Math.round(scorecard.talkToListen)}%)`
                }
              />
              <ScoreCategory
                label="Words Per Minute"
                score={scorecard.wpm}
                maxScore={170}
                details={`Target: 140-170 WPM (${scorecard.wpm})`}
              />
              <ScoreCategory
                label="Question Count"
                score={scorecard.questionCount}
                maxScore={20}
                details={`${scorecard.questionCount} questions asked`}
              />
            </div>

            {/* Discovery Depth */}
            <div className="border border-gray-300 rounded-lg p-6 md:p-8 bg-gray-50 space-y-6">
              <h3 className="text-lg font-serif font-bold text-black">Discovery Depth</h3>
              <ScoreCategory
                label="Level 1 Questions"
                score={scorecard.level1Questions}
                maxScore={10}
                details={`+${scorecard.level1Questions * 1} points`}
              />
              <ScoreCategory
                label="Level 2 Questions"
                score={scorecard.level2Questions}
                maxScore={10}
                details={`+${scorecard.level2Questions * 3} points`}
              />
              <ScoreCategory
                label="Level 3 Questions"
                score={scorecard.level3Questions}
                maxScore={5}
                details={`+${scorecard.level3Questions * 7} points`}
              />
            </div>

            {/* Tactical Empathy */}
            <div className="border border-gray-300 rounded-lg p-6 md:p-8 bg-gray-50 space-y-4">
              <h3 className="text-lg font-serif font-bold text-black">Tactical Empathy</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Labeling Phrases</span>
                  <span className="font-bold text-black">+{scorecard.labelingCount * 5}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Calibrated Questions</span>
                  <span className="font-bold text-black">+{scorecard.calibratedQCount * 5}</span>
                </div>
                {scorecard.penaltyCount > 0 && (
                  <div className="flex justify-between text-gray-800">
                    <span className="text-sm">Penalty Phrases</span>
                    <span className="font-bold">-{scorecard.penaltyCount * 5}</span>
                  </div>
                )}
                {scorecard.severeViolations > 0 && (
                  <div className="flex justify-between text-gray-800">
                    <span className="text-sm">Severe Violations</span>
                    <span className="font-bold">-{scorecard.severeViolations * 10}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Persona Alignment */}
            <div className="border border-gray-300 rounded-lg p-6 md:p-8 bg-gray-50 space-y-4">
              <h3 className="text-lg font-serif font-bold text-black">Persona Alignment</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">ROI Mentioned</span>
                  <span className={scorecard.roiMentioned ? 'text-black font-bold' : 'text-gray-600'}>
                    {scorecard.roiMentioned ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Speed/Efficiency Mentioned</span>
                  <span className={scorecard.speedMentioned ? 'text-black font-bold' : 'text-gray-600'}>
                    {scorecard.speedMentioned ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Cost Mentioned</span>
                  <span className={scorecard.costMentioned ? 'text-black font-bold' : 'text-gray-600'}>
                    {scorecard.costMentioned ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>

            {/* Closing */}
            <div className="border border-gray-300 rounded-lg p-6 md:p-8 bg-gray-50 space-y-4 md:col-span-2">
              <h3 className="text-lg font-serif font-bold text-black">Closing Execution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Next Step Confirmed</span>
                  <span className={scorecard.nextStepConfirmed ? 'text-black font-bold' : 'text-gray-600'}>
                    {scorecard.nextStepConfirmed ? '✓ +4pts' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Calendar Invite</span>
                  <span className={scorecard.calendarInviteAccepted ? 'text-black font-bold' : 'text-gray-600'}>
                    {scorecard.calendarInviteAccepted ? '✓ +3pts' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Mutual Action Plan</span>
                  <span className={scorecard.mutualActionPlan ? 'text-black font-bold' : 'text-gray-600'}>
                    {scorecard.mutualActionPlan ? '✓ +3pts' : '✗'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="border border-gray-300 rounded-lg p-6 md:p-8 bg-gray-50">
            <h3 className="text-lg font-serif font-bold text-black mb-6">Key Takeaways</h3>
            <ul className="space-y-3 text-gray-700 text-sm">
              {scorecard.talkToListen > 65 && (
                <li className="flex gap-3">
                  <span className="text-gray-600">•</span>
                  <span>You talked too much. Aim for 43-57% talk ratio to balance speaking with listening.</span>
                </li>
              )}
              {scorecard.questionCount < 8 && (
                <li className="flex gap-3">
                  <span className="text-gray-600">•</span>
                  <span>Ask more discovery questions—top reps ask 12-18 per call segment.</span>
                </li>
              )}
              {scorecard.level3Questions === 0 && (
                <li className="flex gap-3">
                  <span className="text-gray-600">•</span>
                  <span>Focus on deep discovery—ask about ROI, impact, and emotional drivers.</span>
                </li>
              )}
              {scorecard.penaltyCount > 0 && (
                <li className="flex gap-3">
                  <span className="text-gray-600">•</span>
                  <span>Avoid filler phrases like "Does that make sense?" and "Just checking in."</span>
                </li>
              )}
              {!scorecard.roiMentioned && (
                <li className="flex gap-3">
                  <span className="text-gray-600">•</span>
                  <span>For financial personas, always lead with ROI and risk mitigation.</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-300 bg-white px-8 md:px-12 py-6 md:py-8 flex gap-4 justify-center">
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="px-8 py-3 border border-gray-400 text-black hover:bg-gray-100 font-semibold"
        >
          Back to Training
        </Button>
        <Button
          onClick={() => router.push('/')}
          className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-semibold"
        >
          Try Another Persona
        </Button>
      </div>
    </div>
  );
}
