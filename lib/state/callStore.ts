import { create } from 'zustand';

export interface Message {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface CallMetrics {
  // Internal tracking (for real-time updates)
  totalWords: number;
  userWords: number;
  aiWords: number;

  // Conversational (25 pts)
  talkToListen: number; // 0-100 percentage from API
  talkRatio: number; // 0-1 for internal use
  wpm: number;
  questionCount: number;
  conversationalScore: number;

  // Discovery Depth (30 pts max)
  level1Questions: number;
  level2Questions: number;
  level3Questions: number;
  discoveryScore: number;

  // Tactical Empathy (20 pts)
  labelingCount: number;
  mirroringCount: number;
  calibratedQCount: number;
  empathyScore: number;

  // Penalties
  penaltyCount: number;
  severeViolations: number;

  // Persona Alignment (10 pts)
  roiMentioned: boolean;
  speedMentioned: boolean;
  costMentioned: boolean;
  personaAlignmentScore: number;

  // Objection Handling (10 pts)
  objectionsRaised: number;
  objectionsHandled: number;
  objectionScore: number;

  // Closing (10 pts)
  nextStepConfirmed: boolean;
  calendarInviteAccepted: boolean;
  mutualActionPlan: boolean;
  closingScore: number;

  // Sentiment
  sentiment: 'Positive' | 'Neutral' | 'Negative';

  // Overall
  totalScore: number;
  duration: number;
}

export interface CallState {
  personaId: string;
  personaName: string;
  personaTitle: string;
  isCallActive: boolean;
  callMessages: Message[];
  startTime: number | null;
  duration: number;
  metrics: CallMetrics;
  callMetrics: CallMetrics[];
  sessionEnded: boolean;
  finalScorecard: CallMetrics | null;

  // Actions
  initializeCall: (personaId: string, personaName: string, personaTitle: string) => void;
  startCall: () => void;
  endCall: () => void;
  addMessage: (speaker: 'user' | 'ai', text: string) => void;
  addMetrics: (metrics: CallMetrics) => void;
  updateMetrics: () => void;
  resetCall: () => void;
}

const initialMetrics: CallMetrics = {
  totalWords: 0,
  userWords: 0,
  aiWords: 0,
  talkToListen: 50,
  talkRatio: 0.5,
  wpm: 0,
  questionCount: 0,
  conversationalScore: 0,
  level1Questions: 0,
  level2Questions: 0,
  level3Questions: 0,
  discoveryScore: 0,
  labelingCount: 0,
  mirroringCount: 0,
  calibratedQCount: 0,
  empathyScore: 0,
  penaltyCount: 0,
  severeViolations: 0,
  personaAlignmentScore: 0,
  roiMentioned: false,
  speedMentioned: false,
  costMentioned: false,
  objectionsRaised: 0,
  objectionsHandled: 0,
  objectionScore: 0,
  nextStepConfirmed: false,
  calendarInviteAccepted: false,
  mutualActionPlan: false,
  closingScore: 0,
  sentiment: 'Neutral',
  totalScore: 0,
  duration: 0,
};

const detectQuestionType = (text: string): 'none' | 'level1' | 'level2' | 'level3' => {
  const lower = text.toLowerCase();

  // Level 3: Gap, Impact, Emotional drivers
  const level3Keywords = [
    'should this process look',
    'what does this cost',
    'how is this affecting',
    'what\'s the biggest blocker',
    'what happens if nothing changes',
    'how would you solve',
  ];
  if (level3Keywords.some(kw => lower.includes(kw))) return 'level3';

  // Level 2: Problem exploration
  const level2Keywords = [
    'what challenges',
    'where\'s the friction',
    'what doesn\'t work',
    'what\'s your current',
    'how are you handling',
  ];
  if (level2Keywords.some(kw => lower.includes(kw))) return 'level2';

  // Level 1: Surface questions
  if (text.includes('?')) return 'level1';

  return 'none';
};

const detectLinguisticTriggers = (text: string) => {
  const lower = text.toLowerCase();

  const labelingPhrases = [
    'it seems like',
    'it sounds like',
    'it looks like',
    'you\'re probably feeling',
  ];

  const mirroringPatterns = [
    // Detect when user repeats key prospect words (simple heuristic)
    'you mention',
    'you said',
    'you talked about',
  ];

  const calibratedQuestions = [
    'how would you solve',
    'what\'s the biggest blocker',
    'what happens if nothing changes',
  ];

  const penaltyPhrases = [
    'just checking in',
    'does that make sense',
    'i wanted to follow up',
    'any thoughts',
    'circling back',
  ];

  const severePenalties = [
    'we\'re the best',
    'trust me',
  ];

  const objectionIndicators = [
    'concern',
    'worried about',
    'hesitant',
    'not sure',
    'too expensive',
    'too costly',
    'can\'t afford',
    'don\'t have',
    'we\'re happy with',
    'works fine',
    'no need',
  ];

  const closingIndicators = [
    'let\'s schedule',
    'calendar invite',
    'can you send',
    'i\'ll send you',
    'next week',
    'next meeting',
    'set up a call',
    'let\'s move forward',
  ];

  return {
    hasLabeling: labelingPhrases.some(ph => lower.includes(ph)),
    hasMirroring: mirroringPatterns.some(ph => lower.includes(ph)),
    hasCalibrated: calibratedQuestions.some(ph => lower.includes(ph)),
    hasPenalty: penaltyPhrases.some(ph => lower.includes(ph)),
    hasSevere: severePenalties.some(ph => lower.includes(ph)),
    hasObjection: objectionIndicators.some(ph => lower.includes(ph)),
    hasClosing: closingIndicators.some(ph => lower.includes(ph)),
  };
};

const calculateWPM = (messages: Message[], duration: number) => {
  if (duration === 0) return 0;
  // Only count user words for WPM
  const userMessages = messages.filter(m => m.speaker === 'user');
  const userWordCount = userMessages.reduce((sum, m) => {
    return sum + m.text.split(/\s+/).filter(w => w.length > 0).length;
  }, 0);
  const minutes = duration / 60;
  return Math.round(userWordCount / minutes);
};

export const useCallStore = create<CallState>((set, get) => ({
  personaId: '',
  personaName: '',
  personaTitle: '',
  isCallActive: false,
  callMessages: [],
  startTime: null,
  duration: 0,
  metrics: initialMetrics,
  callMetrics: [],
  sessionEnded: false,
  finalScorecard: null,

  initializeCall: (personaId, personaName, personaTitle) => {
    // Guard: If already initialized with same personaId, skip
    const state = get();
    if (state.personaId === personaId && state.callMessages.length === 0) {
      return; // Already initialized, do nothing
    }

    set({
      personaId,
      personaName,
      personaTitle,
      metrics: initialMetrics,
      callMessages: [],
      callMetrics: [],
      sessionEnded: false,
      finalScorecard: null,
    });
  },

  startCall: () => {
    set({
      isCallActive: true,
      startTime: Date.now(),
      callMessages: [],
    });
  },

  endCall: () => {
    const state = get();
    const finalMetrics = { ...state.metrics };

    // Calculate final duration
    if (state.startTime) {
      finalMetrics.duration = Math.floor((Date.now() - state.startTime) / 1000);
    }

    // Aggregate all metric components into totalScore
    // API has already calculated individual scores, just add them up
    const totalScore = Math.max(0, Math.min(100,
      (finalMetrics.conversationalScore || 0) +
      (finalMetrics.discoveryScore || 0) +
      (finalMetrics.empathyScore || 0) +
      (finalMetrics.personaAlignmentScore || 0) +
      (finalMetrics.objectionScore || 0) +
      (finalMetrics.closingScore || 0) -
      ((finalMetrics.penaltyCount || 0) * 5) -
      ((finalMetrics.severeViolations || 0) * 10)
    ));

    finalMetrics.totalScore = totalScore;

    set({
      isCallActive: false,
      sessionEnded: true,
      finalScorecard: finalMetrics,
    });
  },

  addMessage: (speaker, text) => {
    const state = get();
    const newMessage: Message = {
      speaker,
      text,
      timestamp: state.duration,
    };

    set((s) => ({
      callMessages: [...s.callMessages, newMessage],
    }));

    // Update metrics for user messages
    if (speaker === 'user') {
      const triggers = detectLinguisticTriggers(text);
      const questionType = detectQuestionType(text);

      set((s) => {
        const newMetrics = { ...s.metrics };

        // Word counts
        newMetrics.userWords += text.split(/\s+/).filter(w => w.length > 0).length;
        newMetrics.totalWords = newMetrics.userWords + newMetrics.aiWords;

        // Questions
        if (text.includes('?')) {
          newMetrics.questionCount += 1;
          if (questionType === 'level1') newMetrics.level1Questions += 1;
          if (questionType === 'level2') newMetrics.level2Questions += 1;
          if (questionType === 'level3') newMetrics.level3Questions += 1;
        }

        // Linguistic triggers
        if (triggers.hasLabeling) newMetrics.labelingCount += 1;
        if (triggers.hasMirroring) newMetrics.mirroringCount += 1;
        if (triggers.hasCalibrated) newMetrics.calibratedQCount += 1;

        // Objections and Closing
        if (triggers.hasObjection) newMetrics.objectionsRaised += 1;
        if (triggers.hasClosing) {
          // If closing is achieved and objections were raised, assume they were handled
          if (newMetrics.objectionsRaised > 0 && newMetrics.objectionsHandled === 0) {
            newMetrics.objectionsHandled = newMetrics.objectionsRaised;
          }
          if (text.includes('schedule') || text.includes('calendar')) {
            newMetrics.calendarInviteAccepted = true;
          }
          if (text.includes('next') || text.includes('move forward')) {
            newMetrics.nextStepConfirmed = true;
          }
          if (text.includes('mutual') || text.includes('action plan')) {
            newMetrics.mutualActionPlan = true;
          }
        }

        // Penalties
        if (triggers.hasPenalty) newMetrics.penaltyCount += 1;
        if (triggers.hasSevere) newMetrics.severeViolations += 1;

        // Persona alignment
        if (text.toLowerCase().includes('roi') || text.toLowerCase().includes('return on investment')) {
          newMetrics.roiMentioned = true;
        }
        if (text.toLowerCase().includes('speed') || text.toLowerCase().includes('fast')) {
          newMetrics.speedMentioned = true;
        }
        if (text.toLowerCase().includes('cost') || text.toLowerCase().includes('price')) {
          newMetrics.costMentioned = true;
        }

        return { metrics: newMetrics };
      });
    } else if (speaker === 'ai') {
      set((s) => ({
        metrics: {
          ...s.metrics,
          aiWords: s.metrics.aiWords + text.split(/\s+/).filter(w => w.length > 0).length,
          totalWords: s.metrics.userWords + s.metrics.aiWords + text.split(/\s+/).filter(w => w.length > 0).length,
        },
      }));
    }
  },

  addMetrics: (metrics: CallMetrics) => {
    set((s) => ({
      metrics: {
        ...s.metrics,
        ...metrics, // Merge API metrics into main metrics object
      },
      callMetrics: [...s.callMetrics, metrics], // Keep history for debugging
    }));
  },

  updateMetrics: () => {
    const state = get();
    if (!state.startTime || !state.isCallActive) return;

    const duration = Math.floor((Date.now() - state.startTime) / 1000);
    const totalWords = state.metrics.totalWords || 1;

    set((s) => ({
      duration,
      metrics: {
        ...s.metrics,
        duration,
        wpm: calculateWPM(s.callMessages, duration),
        talkRatio: s.metrics.userWords / Math.max(totalWords, 1),
      },
    }));
  },

  resetCall: () => {
    set({
      personaId: '',
      personaName: '',
      personaTitle: '',
      isCallActive: false,
      callMessages: [],
      startTime: null,
      duration: 0,
      metrics: initialMetrics,
      callMetrics: [],
      sessionEnded: false,
      finalScorecard: null,
    });
  },
}));
