import { NextRequest, NextResponse } from 'next/server';

const DEEPGRAM_API_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('audio') as Blob;

    if (!audioBlob) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    if (!DEEPGRAM_API_KEY) {
      return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 });
    }

    // Convert blob to buffer
    const buffer = await audioBlob.arrayBuffer();

    // Call Deepgram REST API
    console.log('📡 [Transcribe] Calling Deepgram REST API...');
    const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
      method: 'POST',
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/webm',
      },
      body: buffer,
    });

    if (!deepgramResponse.ok) {
      const error = await deepgramResponse.text();
      console.error('❌ [Transcribe] Deepgram error:', error);
      return NextResponse.json({ error: 'Deepgram transcription failed' }, { status: 500 });
    }

    const result = await deepgramResponse.json();
    console.log('✅ [Transcribe] Deepgram result:', result);

    // Extract transcript
    const transcript =
      result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    console.log('📝 [Transcribe] Extracted transcript:', transcript);

    return NextResponse.json({
      transcript,
      confidence: result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0,
    });
  } catch (error) {
    console.error('❌ [Transcribe] Error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
