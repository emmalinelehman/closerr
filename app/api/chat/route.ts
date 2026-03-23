import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatRequest {
  transcript: string;
  personaId: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  productBrief?: string;
}

interface MetricsResponse {
  // Conversational (25 pts)
  talkToListen: number;
  wpm: number;
  questionCount: number;
  conversationalScore: number;

  // Discovery Depth (25 pts)
  level1Questions: number;
  level2Questions: number;
  level3Questions: number;
  discoveryScore: number;

  // Tactical Empathy (20 pts)
  labelingCount: number;
  mirroringCount: number;
  calibratedQCount: number;
  penaltyCount: number;
  severeViolations: number;
  empathyScore: number;

  // Sentiment
  sentiment: 'Positive' | 'Neutral' | 'Negative';

  // Persona Alignment (10 pts)
  roiMentioned: boolean;
  speedMentioned: boolean;
  costMentioned: boolean;
  personaAlignmentScore: number;

  // Overall
  totalScore: number;
}

const getPersonaSystemPrompt = (personaId: string, productBrief?: string): string => {
  const productContext = productBrief ? `\nContext: ${productBrief}` : '';

  const prompts: Record<string, string> = {
    'skeptical-cfo': `You are a CFO in a first sales meeting. You're listening and open, but cautious about cost and ROI.${productContext}

You're genuinely interested in the idea, but you have natural concerns. React conversationally:
- Show some interest: "That's an interesting approach. We've had challenges with sales training sticking."
- Probe gently on the outcome: "So when you say 35% higher close rates, is that immediate or over time?"
- Express the budget concern naturally: "The price point isn't crazy, but I'd need to see how this compares to other training we've done."
- Ask a practical question if it makes sense: "How long does it actually take to see results?"
- Acknowledge the value but express caution: "I see the appeal, but we need to be thoughtful about new tools."

You're not dismissive. You're a real person evaluating a solution. You might show some warmth if they say something smart. 1-2 sentences, conversational.`,

    'busy-founder': `You are a Founder in a first sales meeting. You're direct and time-conscious, but you listen if something could move the needle.${productContext}

You're genuinely curious but skeptical. React conversationally and naturally:
- Show interest in the speed aspect: "Two weeks to implementation is actually reasonable. How does that usually go?"
- Be honest about your concern: "Training doesn't usually stick with us. How is this different?"
- Ask about results timeline: "When would we actually see impact on deal velocity?"
- Show warmth if they say something that resonates: "I like that—most training vendors ignore the practical side."
- Express your real constraint: "My team is slammed. We can't afford a lot of onboarding overhead."

You're impatient but fair. You might lean in if they address your concerns thoughtfully. You're a pragmatist, not a jerk. 1-2 sentences, real and direct.`,

    'price-sensitive': `You are an SMB Owner in a first sales meeting. You're listening and open, but cost-conscious and cautious.${productContext}

You want to solve problems, but you need to justify budget. React naturally and conversationally:
- Show genuine interest in the value: "Sales training is something we've talked about. AI personas is different—I haven't seen that."
- Express the budget reality: "Five thousand a month is tough for us to swallow initially, but if it works..."
- Ask a practical question: "What's the actual time commitment from our team per month?"
- Show concern about commitment: "Three month minimum—can we try it for a month to see if it fits?"
- Be honest about your situation: "We're small, but we're trying to scale. If this moves the needle, it's worth it."

You're not dismissive—you're someone trying to run a business and make smart investments. You might be interested if they make the ROI clear. 1-2 sentences, real.`,
  };

  return prompts[personaId] || prompts['skeptical-cfo'];
};

// Detect question level based on keywords
function detectQuestionLevel(text: string): 'level1' | 'level2' | 'level3' | 'none' {
  const lower = text.toLowerCase();

  // Level 3: Gap, Impact, Emotional drivers
  const level3Keywords = [
    'should this process look',
    'what does this cost',
    'how is this affecting',
    'biggest blocker',
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
    'what problems',
  ];
  if (level2Keywords.some(kw => lower.includes(kw))) return 'level2';

  // Level 1: Any question
  if (text.includes('?')) return 'level1';

  return 'none';
}

// Analyze user input for real-time metrics
function analyzeMetrics(transcript: string, conversationHistory: Array<{ role: string; content: string }>, personaId: string): MetricsResponse {
  // Conversational Metrics
  const userWords = transcript.split(/\s+/).filter(w => w.length > 0).length;
  const userHistoryWords = conversationHistory.filter(m => m.role === 'user').reduce((sum, msg) => sum + msg.content.split(/\s+/).length, 0);
  const aiHistoryWords = conversationHistory.filter(m => m.role === 'assistant').reduce((sum, msg) => sum + msg.content.split(/\s+/).length, 0);
  const totalWords = userWords + userHistoryWords + aiHistoryWords;
  const talkToListen = totalWords > 0 ? Math.round(((userWords + userHistoryWords) / totalWords) * 100) : 50;

  // Calculate WPM
  const wpm = Math.round((userWords / 5) * 60); // Assume 5 second recording

  // Question counting and leveling
  const questionCount = (transcript.match(/\?/g) || []).length;
  let level1Questions = 0;
  let level2Questions = 0;
  let level3Questions = 0;

  const sentences = transcript.split(/[.!?]+/);
  sentences.forEach(sentence => {
    if (sentence.includes('?')) {
      const level = detectQuestionLevel(sentence);
      if (level === 'level1') level1Questions++;
      else if (level === 'level2') level2Questions++;
      else if (level === 'level3') level3Questions++;
    }
  });

  // Tactical Empathy Detection
  const labelingPhrases = /it seems like|it sounds like|it looks like|you're probably feeling/gi;
  const labelingMatches = transcript.match(labelingPhrases) || [];
  const labelingCount = labelingMatches.length;

  const mirroringKeywords = /so you|what you|your approach|your team|your situation/gi;
  const mirroringMatches = transcript.match(mirroringKeywords) || [];
  const mirroringCount = mirroringMatches.length;

  const calibratedQuestions = /how would you|what's the biggest|what happens if/gi;
  const calibratedMatches = transcript.match(calibratedQuestions) || [];
  const calibratedQCount = calibratedMatches.length;

  const penaltyPhrases = /just checking in|does that make sense|any thoughts|circling back|i wanted to follow up/gi;
  const penaltyMatches = transcript.match(penaltyPhrases) || [];
  const penaltyCount = penaltyMatches.length;

  const severeViolations = /(we're the best|trust me)/gi.test(transcript) ? 1 : 0;

  // Sentiment analysis
  const positive = /great|excellent|perfect|amazing|love|fantastic|awesome/gi;
  const negative = /hate|terrible|awful|bad|disappointed|frustrated/gi;
  const posCount = (transcript.match(positive) || []).length;
  const negCount = (transcript.match(negative) || []).length;
  const sentiment: 'Positive' | 'Neutral' | 'Negative' = posCount > negCount ? 'Positive' : negCount > 0 ? 'Negative' : 'Neutral';

  // Persona-specific keywords
  const roiMentioned = /roi|return on investment|payback|financial|investment/gi.test(transcript);
  const speedMentioned = /quick|fast|speed|urgent|implement|rapid/gi.test(transcript);
  const costMentioned = /cost|price|budget|expensive|affordable|fee/gi.test(transcript);

  // Calculate Conversational Score (25 pts max)
  let conversationalScore = 25;
  if (talkToListen > 65) conversationalScore -= 10;
  if (talkToListen < 35) conversationalScore -= 5;
  if (wpm > 180) conversationalScore -= 5;
  if (wpm < 120) conversationalScore -= 5;
  if (questionCount < 8) conversationalScore -= 10;
  if (questionCount > 25) conversationalScore -= 5;
  conversationalScore = Math.max(0, conversationalScore);

  // Calculate Discovery Score (25 pts max)
  const discoveryScore = Math.min(25, level1Questions * 1 + level2Questions * 3 + level3Questions * 7);

  // Calculate Empathy Score (20 pts max)
  let empathyScore = 0;
  empathyScore += labelingCount * 5;
  empathyScore += mirroringCount * 3;
  empathyScore += calibratedQCount * 5;
  empathyScore -= penaltyCount * 5;
  empathyScore -= severeViolations * 10;
  empathyScore = Math.min(20, Math.max(0, empathyScore));

  // Calculate Persona Alignment Score (10 pts max)
  let personaAlignmentScore = 10;
  if (personaId === 'skeptical-cfo' && !roiMentioned) personaAlignmentScore = 0;
  if (personaId === 'busy-founder' && !speedMentioned) personaAlignmentScore = 5;
  if (personaId === 'price-sensitive' && !costMentioned) personaAlignmentScore = 5;

  // Total Score
  const totalScore = conversationalScore + discoveryScore + empathyScore + personaAlignmentScore;

  return {
    talkToListen,
    wpm: Math.max(0, Math.min(wpm, 300)),
    questionCount,
    conversationalScore,
    level1Questions,
    level2Questions,
    level3Questions,
    discoveryScore,
    labelingCount,
    mirroringCount,
    calibratedQCount,
    penaltyCount,
    severeViolations,
    empathyScore,
    sentiment,
    roiMentioned,
    speedMentioned,
    costMentioned,
    personaAlignmentScore,
    totalScore,
  };
}

export async function POST(request: Request) {
  console.log('🧠 [BACKEND] /api/chat POST received');
  try {
    const body: ChatRequest = await request.json();
    console.log('🧠 [BACKEND] Request body:', {
      transcript: body.transcript?.substring(0, 50) + '...',
      personaId: body.personaId,
      historyLength: body.conversationHistory?.length,
    });

    const { transcript, personaId, conversationHistory, productBrief } = body;

    if (!transcript || !personaId) {
      return Response.json(
        { error: 'Missing transcript or personaId' },
        { status: 400 }
      );
    }

    // Analyze metrics from the user's input
    const metrics = analyzeMetrics(transcript, conversationHistory, personaId);
    console.log('📊 [BACKEND] Metrics calculated:', metrics);

    // Build messages for GPT-4o with system prompt
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: getPersonaSystemPrompt(personaId, productBrief),
      },
      ...conversationHistory,
      {
        role: 'user',
        content: transcript,
      },
    ];

    // Call GPT-4o
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as any,
      max_tokens: 150,
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      'I need to think about that more.';

    console.log('✅ [BACKEND] AI Response generated:', reply.substring(0, 50) + '...');

    return Response.json({
      reply,
      metrics,
      tokensUsed: completion.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error('❌ [BACKEND] Chat API error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ [BACKEND] Error stack:', error instanceof Error ? error.stack : 'no stack');
    console.error('❌ [BACKEND] Full error object:', JSON.stringify(error, null, 2));
    return Response.json(
      {
        error: 'Failed to generate response',
        details: errorMsg,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
