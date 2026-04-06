import { getPersonaContext } from '@/lib/config/personas';

interface GreetingRequest {
  personaId: string;
}

const getGreeting = (personaId: string): string => {
  const context = getPersonaContext(personaId);
  const name = context?.name || 'I';

  const greetings: Record<string, string> = {
    'skeptical-cfo': `Hey, ${name} here. Thanks for making time. So what's this about?`,
    'busy-founder': `${name} speaking. I've got about 10 minutes, so walk me through what you've got.`,
    'price-sensitive': `Hi, it's ${name}. Happy to chat—what's on your mind?`,
    'drew': `${name} here. Look, I've got a busy schedule, so let's jump in. What are you selling?`,
  };

  return greetings[personaId] || greetings['skeptical-cfo'];
};

export async function POST(request: Request) {
  console.log('👋 [GREETING] POST received');
  try {
    const body: GreetingRequest = await request.json();
    const { personaId } = body;

    if (!personaId) {
      return Response.json(
        { error: 'Missing personaId' },
        { status: 400 }
      );
    }

    const greeting = getGreeting(personaId);
    console.log('👋 [GREETING] Generated:', greeting);

    return Response.json({ greeting });
  } catch (error) {
    console.error('❌ [GREETING] Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      {
        error: 'Failed to generate greeting',
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}
