interface TTSRequest {
  text: string;
}

export async function POST(request: Request) {
  console.log('🔊 [BACKEND] /api/tts POST received');
  try {
    const body: TTSRequest = await request.json();
    const { text } = body;

    console.log('🔊 [BACKEND] TTS Request:', {
      textLength: text?.length,
    });

    if (!text) {
      console.log('❌ [BACKEND] Missing text');
      return Response.json({ error: 'Missing text' }, { status: 400 });
    }

    // Truncate to max 200 characters to avoid URL length issues
    const truncatedText = text.length > 200 ? text.substring(0, 200) + '...' : text;
    console.log('🔊 [BACKEND] Truncated text:', truncatedText.substring(0, 50));

    // Use Google Translate's TTS endpoint (free, no key needed)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(truncatedText)}&tl=en&client=tw-ob`;
    console.log('🔊 [BACKEND] URL length:', url.length);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.log('❌ [BACKEND] Google Translate TTS failed with status:', response.status);
      console.log('❌ [BACKEND] Response headers:', Object.fromEntries(response.headers));
      const errorText = await response.text();
      console.log('❌ [BACKEND] Error response:', errorText.substring(0, 200));
      throw new Error(`TTS service failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('✅ [BACKEND] Audio generated, size:', audioBuffer.byteLength);

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('❌ [BACKEND] TTS API error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ [BACKEND] Error details:', errorMsg);
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
