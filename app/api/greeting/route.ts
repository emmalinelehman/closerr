interface GreetingRequest {
  personaId: string;
  personaName: string;
}

const getGreeting = (personaId: string, personaName: string): string => {
  const greetings: Record<string, string> = {
    'skeptical-cfo': `Hi, thanks for jumping on a quick call. I'm ${personaName}. I've got a few minutes, so why don't you walk me through what you're pitching?`,
    'busy-founder': `Hey, ${personaName} here. I've got about 10 minutes before my next thing. What's this about?`,
    'price-sensitive': `Hi, I'm ${personaName}. Appreciate you taking the time to chat with us. So what are we looking at today?`,
    'drew': `${personaName} here. I'm slammed as always, so let's make this quick. What's the pitch?`,
  };

  return greetings[personaId] || greetings['skeptical-cfo'];
};

export async function POST(request: Request) {
  console.log('👋 [GREETING] POST received');
  try {
    const body: GreetingRequest = await request.json();
    const { personaId, personaName } = body;

    if (!personaId || !personaName) {
      return Response.json(
        { error: 'Missing personaId or personaName' },
        { status: 400 }
      );
    }

    const greeting = getGreeting(personaId, personaName);
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
