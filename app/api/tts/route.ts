interface TTSRequest {
  text: string;
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Aria (more reliable default)

export async function POST(request: Request) {
  console.log('🔊 [TTS] POST received');
  try {
    const body: TTSRequest = await request.json();
    const { text } = body;

    if (!text?.trim()) {
      console.log('❌ [TTS] Missing or empty text');
      return Response.json({ error: 'Missing text' }, { status: 400 });
    }

    if (!ELEVENLABS_API_KEY) {
      console.error('❌ [TTS] Missing ELEVENLABS_API_KEY');
      return Response.json({ error: 'TTS not configured' }, { status: 500 });
    }

    console.log('🔊 [TTS] Calling ElevenLabs for text length:', text.length);

    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('❌ [TTS] ElevenLabs error:', {
        status: elevenLabsResponse.status,
        statusText: elevenLabsResponse.statusText,
        response: errorText,
        voiceId: ELEVENLABS_VOICE_ID,
        hasApiKey: !!ELEVENLABS_API_KEY,
      });

      // Provide user-friendly error messages
      let userMessage = 'Failed to generate speech';
      if (elevenLabsResponse.status === 401 || elevenLabsResponse.status === 403) {
        userMessage = 'Speech service authentication failed. Please check configuration.';
      } else if (elevenLabsResponse.status === 429) {
        userMessage = 'Speech service rate limit reached. Please wait and try again.';
      } else if (elevenLabsResponse.status === 400) {
        userMessage = 'Invalid text for speech generation. Please try rephrasing.';
      } else if (elevenLabsResponse.status >= 500) {
        userMessage = 'Speech service is temporarily unavailable. Please try again.';
      }

      return Response.json(
        {
          error: userMessage,
          details: errorText,
          status: elevenLabsResponse.status,
          timestamp: new Date().toISOString(),
        },
        { status: elevenLabsResponse.status }
      );
    }

    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    console.log('✅ [TTS] Audio generated, size:', audioBuffer.byteLength);

    // Return audio as binary
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('❌ [TTS] Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      {
        error: 'Failed to generate speech',
        details: errorMsg,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
