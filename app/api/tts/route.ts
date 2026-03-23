interface TTSRequest {
  text: string;
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// Use the default voice ID for consistency
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice

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
      console.log('❌ [TTS] ElevenLabs API key not configured');
      return Response.json({ error: 'TTS service not configured' }, { status: 500 });
    }

    console.log('🔊 [TTS] Generating speech for text length:', text.length);

    // Call ElevenLabs REST API directly
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [TTS] ElevenLabs API error:', response.status, errorText);
      return Response.json(
        {
          error: 'ElevenLabs API failed',
          details: `Status ${response.status}: ${errorText.substring(0, 200)}`,
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('✅ [TTS] Audio generated, size:', audioBuffer.byteLength);

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
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
