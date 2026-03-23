import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

interface TTSRequest {
  text: string;
}

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(request: Request) {
  console.log('🔊 [TTS] POST received');
  try {
    const body: TTSRequest = await request.json();
    const { text } = body;

    if (!text?.trim()) {
      console.log('❌ [TTS] Missing or empty text');
      return Response.json({ error: 'Missing text' }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      console.log('❌ [TTS] ElevenLabs API key not configured');
      return Response.json({ error: 'TTS service not configured' }, { status: 500 });
    }

    console.log('🔊 [TTS] Generating speech for text length:', text.length);

    // Use ElevenLabs API to generate speech
    const audioStream = await client.textToSpeech.convert('Sarah', {
      text,
      modelId: 'eleven_monolingual_v1',
    });

    // Convert ReadableStream to buffer
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const audioBuffer = Buffer.concat(chunks.map(c => Buffer.from(c)));
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
