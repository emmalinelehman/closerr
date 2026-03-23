'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CallMetrics } from '@/lib/state/callStore';
import { ArrowLeft, Award, TrendingUp } from 'lucide-react';

interface SessionSummaryProps {
  personaName: string;
  personaTitle: string;
  scorecard: CallMetrics;
  duration: number;
}

const getScoreGrade = (score: number): { grade: string; color: string } => {
  if (score >= 85) return { grade: 'Elite', color: 'text-green-400' };
  if (score >= 70) return { grade: 'Strong', color: 'text-blue-400' };
  if (score >= 55) return { grade: 'Average', color: 'text-yellow-400' };
  return { grade: 'Needs Work', color: 'text-orange-500' };
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
        <span className="text-sm font-mono text-slate-300">{label}</span>
        <span className="text-lg font-bold text-orange-400">
          {Math.round(score)}/{maxScore}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {details && <p className="text-xs text-slate-400 mt-1">{details}</p>}
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
  const { grade, color } = getScoreGrade(scorecard.totalScore);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-md px-8 py-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Training
        </button>
        <h1 className="text-4xl font-bold">Session Complete</h1>
        <p className="text-slate-400 mt-2">
          {personaName} • {personaTitle}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Overall Score Card */}
          <div className="relative p-8 rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-slate-800/40 backdrop-blur-md">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm font-mono text-orange-400 uppercase tracking-wide mb-2">
                  Final Score
                </p>
                <div className="flex items-baseline gap-3">
                  <span className={`text-6xl font-bold ${color}`}>
                    {Math.round(scorecard.totalScore)}
                  </span>
                  <span className="text-2xl text-slate-400">/100</span>
                </div>
              </div>
              <div className="text-right">
                <Award className="w-12 h-12 text-orange-500 ml-auto mb-2" />
                <p className={`text-3xl font-bold ${color}`}>{grade}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-700">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Duration</p>
                <p className="text-lg font-bold text-white">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Talk Ratio</p>
                <p className="text-lg font-bold text-white">
                  {Math.round(scorecard.talkRatio * 100)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">WPM</p>
                <p className="text-lg font-bold text-white">{scorecard.wpm}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Questions</p>
                <p className="text-lg font-bold text-white">{scorecard.questionCount}</p>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conversational Metrics */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/40 backdrop-blur-sm space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Conversational Metrics
              </h3>
              <ScoreCategory
                label="Talk-to-Listen Ratio"
                score={scorecard.talkRatio * 100}
                maxScore={100}
                details={
                  scorecard.talkRatio > 0.65
                    ? '⚠️ Monologue Warning: Exceeded 65%'
                    : `Target: 43-57% (${Math.round(scorecard.talkRatio * 100)}%)`
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
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/40 backdrop-blur-sm space-y-4">
              <h3 className="text-lg font-bold text-white">Discovery Depth</h3>
              <div className="space-y-3">
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
            </div>

            {/* Tactical Empathy */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/40 backdrop-blur-sm space-y-4">
              <h3 className="text-lg font-bold text-white">Tactical Empathy</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Labeling Phrases</span>
                  <span className="font-bold text-orange-400">+{scorecard.labelingCount * 5}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Calibrated Questions</span>
                  <span className="font-bold text-orange-400">+{scorecard.calibratedQCount * 5}</span>
                </div>
                {scorecard.penaltyCount > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span className="text-sm">Penalty Phrases</span>
                    <span className="font-bold">-{scorecard.penaltyCount * 5}</span>
                  </div>
                )}
                {scorecard.severeViolations > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span className="text-sm">Severe Violations</span>
                    <span className="font-bold">-{scorecard.severeViolations * 10}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Persona Alignment */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/40 backdrop-blur-sm space-y-4">
              <h3 className="text-lg font-bold text-white">Persona Alignment</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">ROI Mentioned</span>
                  <span className={scorecard.roiMentioned ? 'text-green-400 font-bold' : 'text-red-400'}>
                    {scorecard.roiMentioned ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Speed/Efficiency Mentioned</span>
                  <span className={scorecard.speedMentioned ? 'text-green-400 font-bold' : 'text-red-400'}>
                    {scorecard.speedMentioned ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Cost Mentioned</span>
                  <span className={scorecard.costMentioned ? 'text-green-400 font-bold' : 'text-red-400'}>
                    {scorecard.costMentioned ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>

            {/* Closing */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/40 backdrop-blur-sm space-y-4">
              <h3 className="text-lg font-bold text-white">Closing Execution</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Next Step Confirmed</span>
                  <span className={scorecard.nextStepConfirmed ? 'text-green-400 font-bold' : 'text-red-400'}>
                    {scorecard.nextStepConfirmed ? '✓ +4pts' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Calendar Invite</span>
                  <span className={scorecard.calendarInviteAccepted ? 'text-green-400 font-bold' : 'text-red-400'}>
                    {scorecard.calendarInviteAccepted ? '✓ +3pts' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Mutual Action Plan</span>
                  <span className={scorecard.mutualActionPlan ? 'text-green-400 font-bold' : 'text-red-400'}>
                    {scorecard.mutualActionPlan ? '✓ +3pts' : '✗'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/40 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">Key Takeaways</h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              {scorecard.talkRatio > 0.65 && (
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  <span>You talked too much. Aim for 43-57% talk ratio to balance speaking with listening.</span>
                </li>
              )}
              {scorecard.questionCount < 8 && (
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Ask more discovery questions—top reps ask 12-18 per call segment.</span>
                </li>
              )}
              {scorecard.level3Questions === 0 && (
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Focus on deep discovery—ask about ROI, impact, and emotional drivers.</span>
                </li>
              )}
              {scorecard.penaltyCount > 0 && (
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Avoid filler phrases like "Does that make sense?" and "Just checking in."</span>
                </li>
              )}
              {!scorecard.roiMentioned && (
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  <span>For financial personas, always lead with ROI and risk mitigation.</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-slate-800/50 bg-slate-900/40 backdrop-blur-md px-8 py-6 flex gap-4 justify-center">
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="px-8 border-slate-600 text-slate-300 hover:border-slate-500"
        >
          Back to Training
        </Button>
        <Button
          onClick={() => router.push('/')}
          className="px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/40"
        >
          Try Another Persona
        </Button>
      </div>
    </div>
  );
}
