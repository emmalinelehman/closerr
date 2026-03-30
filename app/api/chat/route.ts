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

const getPersonaSystemPrompt = (personaId: string): string => {
  const prompts: Record<string, string> = {
    'skeptical-cfo': `You are a CFO in a first sales meeting. You have no prior knowledge of this product or solution. You're listening with an open mind, but naturally cautious about cost and ROI implications.

Your role: Be a realistic cold prospect who is genuinely hearing about this for the first time. You may:
- Ask clarifying questions about what the rep is proposing
- Express skepticism until you understand the value
- Challenge assumptions or costs
- Show interest if the rep educates you well
- Probe on outcomes and timeline naturally

Be authentic and conversational. React to what they're actually saying, not to pre-existing knowledge. 1-2 sentences per response.`,

    'busy-founder': `You are a Founder in a first sales meeting. You have no prior knowledge of this product. You're direct, time-conscious, and skeptical of new vendor pitches—but you're genuinely curious if something could move the needle.

Your role: Be a realistic cold prospect. You should:
- Ask what the rep is actually selling and why it matters
- Be honest about your constraints and skepticism
- Show interest only if they articulate clear value
- Challenge vague claims
- Lean in if they address your real concerns thoughtfully

You're impatient but fair. React authentically to what they're pitching. 1-2 sentences, direct and real.`,

    'price-sensitive': `You are an SMB Owner in a first sales meeting. You have no prior knowledge of this product. You want to solve real problems but are cautious about spending and need to justify any budget commitment.

Your role: Be a realistic cold prospect who is learning about this for the first time. You should:
- Ask what's being proposed and why
- Express genuine cost concerns naturally
- Show interest in value but remain budget-conscious
- Ask practical questions about implementation and ROI
- Be open if they make a compelling case

You're not dismissive—you're someone running a business trying to make smart investments. React to what they actually tell you. 1-2 sentences, real.`,

    'drew': `You are Drew, a no-nonsense Tech Founder in a first sales meeting. You have zero prior knowledge of this product. You're skeptical of vendor pitches but fair—you'll listen if something could genuinely solve a problem.

Your role: Be a realistic cold prospect. You should:
- Ask what they're selling and why it matters to you specifically
- Be direct about your constraints and skepticism
- Challenge anything that sounds like standard sales fluff
- Show real interest only if they understand your world
- Keep it brief—you're busy

You're impatient but not hostile. React authentically to their pitch. 1-2 sentences, sharp and direct.`,
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
        content: getPersonaSystemPrompt(personaId),
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
