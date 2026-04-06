import { OpenAI } from 'openai';
import { getPersonaContext } from '@/lib/config/personas';
import { Product } from '@/lib/config/productSchema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatRequest {
  transcript: string;
  personaId: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  productBrief?: string;
  product?: Product;
}

interface MetricsResponse {
  // Conversational (25 pts)
  talkToListen: number;
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

  // Objection Handling (10 pts)
  objectionsRaised: number;
  objectionsHandled: number;
  objectionScore: number;

  // Closing (10 pts)
  nextStepConfirmed: boolean;
  calendarInviteAccepted: boolean;
  mutualActionPlan: boolean;
  closingScore: number;

  // Overall
  totalScore: number;
}

const getPersonaSystemPrompt = (personaId: string, product?: Product): string => {
  const context = getPersonaContext(personaId);

  if (!context) {
    return `You are a skeptical business professional in a first sales meeting. You have no prior knowledge of this product.
Be realistic, authentic, and conversational. Ask clarifying questions, reference your business context when relevant, and acknowledge good points the rep makes.
Keep responses natural: 1-2 sentences. React to what they're actually saying, not to pre-scripted knowledge.`;
  }

  let productSection = '';
  if (product) {
    productSection = `

THE REP IS PITCHING:
Product: ${product.name} (${product.category})
What it does: ${product.description}
Pricing: ${product.pricingCost} (${product.pricingModel})
Implementation: ${product.implementationTime}
Key benefits they'll mention: ${product.keyBenefits.join(', ')}

NATURAL CONCERNS YOU SHOULD HAVE:
${product.naturalConcerns.map(c => `- ${c}`).join('\n')}

APPROACH TO THIS PITCH:
- You're hearing about this product for the first time (no prior knowledge)
- React authentically to what they're saying
- If benefits matter to you, acknowledge that they caught your attention
- If concerns aren't addressed, raise them naturally as the conversation goes on
- Reference specific concerns from your situation when relevant`;
  }

  return `You are ${context.name}, ${context.title} at ${context.company}, a ${context.companySize}-person ${context.industry} company.

COMPANY CONTEXT (reference when relevant, but don't info-dump):
- Founded ${context.foundedYear}, ${context.stage} stage, ${context.growthRate} growth
- ${context.annualRevenue} ARR (${context.fundingStatus})
- Team: ${context.teamSize} people, I manage ${context.directReports} direct reports
- Current challenge: ${context.keyChallenge}
- Pain points: ${context.painPoints.join(', ')}
- Q1/Q2 priorities: ${context.q1_q2_priorities.join(', ')}
- Budget: ${context.budget} (${context.budgetStatus})

CRITICAL: HOW TO RESPOND NATURALLY
- You have this company context in your head (you know your situation), but DON'T recite it all at once
- When they ask "tell me about yourself" or "tell me about your company", give a 1-2 sentence natural answer
  - Example: "I'm the CFO at DataSync. We're a 150-person SaaS company dealing with some data infrastructure challenges."
  - Don't list all your pain points, budget, priorities—that's boring and unrealistic
- Reveal details gradually as they ask follow-up questions
  - If they ask "what's the biggest challenge?", then tell them about your data pipeline issue
  - If they ask "how much time do you have?", then mention implementation timeline preference
  - If they ask "what's your budget like?", then mention budget status
- Keep each response 1-2 sentences. Natural human conversation.
- Reference your situation when it's relevant to what they're saying, not unprompted

YOUR PERSONALITY:
- I'm ${context.decisionStyle}
- I communicate like: ${context.communicationStyle}
- When challenged: ${context.objectionStyle}

KEY PRINCIPLE: You're a real person with real constraints, not a walking company brief.
Be genuine. Ask them questions back. Show curiosity about what they're selling.
If something doesn't make sense, push back naturally.${productSection}`;
};


// Detect question level based on keywords
// Level 1: Situational Awareness - learning about current state
// Level 2: Problem Uncovering - understanding pain points and inefficiencies
// Level 3: Business Impact - connecting to outcomes and emotions
function detectQuestionLevel(text: string): 'level1' | 'level2' | 'level3' | 'none' {
  const lower = text.toLowerCase();

  // Level 3: Business Impact & Outcomes
  const level3Keywords = [
    'what does this cost',
    'how is this affecting',
    'biggest blocker',
    'what happens if nothing changes',
    'how would you solve',
    'impact of',
    'affects your',
    'affects the',
    "what's at stake",
    'if nothing changes',
    'cost you',
    'timeline for',
    'strategic priority',
  ];
  if (level3Keywords.some(kw => lower.includes(kw))) return 'level3';

  // Level 2: Problem Uncovering
  const level2Keywords = [
    'what challenges',
    "where's the friction",
    'where is the friction',
    "what doesn't work",
    "what's your current",
    'what is your current',
    'how are you handling',
    'how do you handle',
    'what problems',
    'frustrated',
    'pain point',
    'struggle',
    'broken',
    'lose time',
    'lose money',
  ];
  if (level2Keywords.some(kw => lower.includes(kw))) return 'level2';

  // Level 1: Situational Awareness
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

  // Objection Handling Detection
  const objectionKeywords = /concern|worried about|hesitant|too expensive|can't afford|don't have|we're happy with|don't need|works fine/gi;
  const objectionMatches = transcript.match(objectionKeywords) || [];
  const objectionsRaised = objectionMatches.length;

  // Closing Detection
  const closingKeywords = /let's schedule|calendar invite|set up a call|next week|next meeting|let's move forward|i'll send|can you send|schedule a call/gi;
  const closingMatches = transcript.match(closingKeywords) || [];
  const closingIndicators = closingMatches.length;

  let objectionsHandled = 0;
  if (closingIndicators > 0 && objectionsRaised > 0) {
    objectionsHandled = Math.min(objectionsRaised, closingIndicators);
  }

  const objectionScore = objectionsRaised > 0
    ? Math.min(10, Math.round((objectionsHandled / objectionsRaised) * 10))
    : 0;

  const closingScore = closingIndicators > 0 ? Math.min(10, closingIndicators * 3) : 0;
  const nextStepConfirmed = /next week|next meeting|schedule|call back|follow up/.test(transcript);
  const calendarInviteAccepted = /calendar|invite|send|propose|email/.test(transcript);
  const mutualActionPlan = /action plan|mutual|both agree|committed/.test(transcript);

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
  // Rebalanced to be achievable: solid call = 20+, great call = 23-25
  let conversationalScore = 25;
  if (talkToListen > 70) conversationalScore -= 5; // Harsh only if really dominant
  if (talkToListen < 30) conversationalScore -= 5; // Lost control
  if (wpm > 190) conversationalScore -= 3; // Too fast
  if (wpm < 100) conversationalScore -= 3; // Too slow
  if (questionCount < 5) conversationalScore -= 8; // Very few questions
  if (questionCount < 8) conversationalScore -= 3; // Fewer than ideal but not terrible
  if (questionCount > 30) conversationalScore -= 5; // Machine-gunning
  conversationalScore = Math.max(0, conversationalScore);

  // Calculate Discovery Score (25 pts baseline, can exceed for exceptional progress)
  // Rewards progression: L1=1pt, L2=3pts, L3=7pts. Cap at 30 for practicality
  const discoveryScore = Math.min(30, level1Questions * 1 + level2Questions * 3 + level3Questions * 7);

  // Calculate Empathy Score (20 pts max)
  // Rebalanced: show empathy techniques = good, penalties only for egregious mistakes
  let empathyScore = 0;
  empathyScore += labelingCount * 4; // Reduced from 5
  empathyScore += mirroringCount * 2; // Reduced from 3
  empathyScore += calibratedQCount * 4; // Reduced from 5
  empathyScore -= penaltyCount * 2; // Reduced from 5 (less punitive)
  empathyScore -= severeViolations * 8; // Reduced from 10
  empathyScore = Math.min(20, Math.max(0, empathyScore));

  // Calculate Persona Alignment Score (10 pts max)
  // More flexible: mentioning key concerns = full pts, but focus area matters
  let personaAlignmentScore = 5; // Base for being in conversation
  if (personaId === 'skeptical-cfo') {
    if (roiMentioned) personaAlignmentScore = 10;
    else if (/financial|budget|investment|cost|return/i.test(transcript))
      personaAlignmentScore = 7; // Partial credit for financial discussion
  } else if (personaId === 'busy-founder') {
    if (speedMentioned) personaAlignmentScore = 10;
    else if (/timeline|implement|quick|fast/i.test(transcript))
      personaAlignmentScore = 7;
  } else if (personaId === 'price-sensitive') {
    if (costMentioned) personaAlignmentScore = 10;
    else if (/budget|expense|affordable|affordable|pricing/i.test(transcript))
      personaAlignmentScore = 7;
  } else if (personaId === 'drew') {
    if (/reliability|mttr|incident|uptime|monitoring|observability/i.test(transcript))
      personaAlignmentScore = 10;
  }

  // Total Score (rebalanced for achievability)
  // Scoring bands: 0-40 (needs work) | 40-70 (good effort) | 70-85 (strong) | 85-100 (excellent)
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
    objectionsRaised,
    objectionsHandled,
    objectionScore,
    nextStepConfirmed,
    calendarInviteAccepted,
    mutualActionPlan,
    closingScore,
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

    const { transcript, personaId, conversationHistory, productBrief, product } = body;

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
        content: getPersonaSystemPrompt(personaId, product),
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

    // Determine error type and provide specific guidance
    let userMessage = 'Failed to generate response';
    let status = 500;

    if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
      userMessage = 'Response took too long. Please try again or make your last message shorter.';
      status = 408; // Request Timeout
    } else if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
      userMessage = 'OpenAI rate limit reached. Please wait a moment and try again.';
      status = 429;
    } else if (errorMsg.includes('authentication') || errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
      userMessage = 'Authentication error. Please check server configuration.';
      status = 401;
    } else if (errorMsg.includes('model') || errorMsg.includes('gpt-4o')) {
      userMessage = 'The AI model is not available. Please try again later.';
      status = 503; // Service Unavailable
    }

    return Response.json(
      {
        error: userMessage,
        details: errorMsg,
        type: userMessage === 'Failed to generate response' ? 'unknown' : 'known',
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }
}
