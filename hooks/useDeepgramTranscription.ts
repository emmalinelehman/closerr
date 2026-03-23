'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useDeepgramTranscription(apiKey: string) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fullTranscriptRef = useRef<string>('');
  const isMountedRef = useRef(true);

  const startListening = useCallback(async () => {
    try {
      console.log('🎙️ [Deepgram] Starting...');
      console.log('   API Key loaded:', apiKey ? '✅ YES' : '❌ NO');

      if (!apiKey) {
        throw new Error('Deepgram API key not configured');
      }

      // Get microphone
      console.log('🎙️ [Deepgram] Requesting microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;
      console.log('✅ [Deepgram] Mic Stream Active');

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;

      // SET UP ondataavailable BEFORE WebSocket connection
      mediaRecorder.ondataavailable = (event) => {
        console.log('🎤 [Deepgram] ondataavailable fired:', event.data.size, 'bytes, WS state:', wsRef.current?.readyState);
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          console.log('📤 [Deepgram] Sending chunk:', event.data.size, 'bytes');
          wsRef.current.send(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ [Deepgram] MediaRecorder error:', event.error);
      };

      mediaRecorder.onstart = () => {
        console.log('✅ [Deepgram] MediaRecorder onstart fired');
      };

      mediaRecorder.onstop = () => {
        console.log('✅ [Deepgram] MediaRecorder onstop fired');
      };

      // DIRECT WEBSOCKET - Use subprotocol for auth (cleaner than URL params)
      const wsUrl = 'wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true';
      console.log('📡 [Deepgram] Opening WebSocket with subprotocol auth');

      // Subprotocol format: ['token', 'apikey']
      const ws = new WebSocket(wsUrl, ['token', apiKey]);
      wsRef.current = ws;

      ws.addEventListener('open', () => {
        console.log('✅ [Deepgram] Socket Open');
        if (!isMountedRef.current) return;

        setIsListening(true);
        fullTranscriptRef.current = '';
        setTranscript('');
        setError(null);

        // CRITICAL: Send initial message to Deepgram with audio format
        const initialMessage = {
          type: 'Start',
          audio_codec: 'opus',
          sample_rate: 16000,
        };
        console.log('📨 [Deepgram] Sending initial handshake:', initialMessage);
        ws.send(JSON.stringify(initialMessage));

        // Start recording with 250ms chunks
        mediaRecorder.start(250);
        console.log('✅ [Deepgram] Recording started');
      });

      ws.addEventListener('message', (event) => {
        try {
          console.log('📥 [Deepgram] Raw message received:', event.data.substring(0, 100));
          const data = JSON.parse(event.data);
          console.log('📥 [Deepgram] Parsed message type:', data.type);

          if (data.type === 'Results' && data.result?.results?.[0]?.alternatives?.[0]) {
            const alternative = data.result.results[0].alternatives[0];
            const text = alternative.transcript || '';
            const isFinal = !data.result.is_interim;

            if (text && isMountedRef.current) {
              console.log(`📝 [Deepgram] ${isFinal ? 'FINAL' : 'interim'}: "${text}"`);
              setTranscript(text);

              if (isFinal) {
                fullTranscriptRef.current += (fullTranscriptRef.current ? ' ' : '') + text;
              }
            }
          }
        } catch (err) {
          console.error('❌ [Deepgram] Message parse error:', err);
        }
      });

      ws.addEventListener('error', (event) => {
        console.error('❌ [Deepgram] WebSocket error:', event);
        console.error('   WebSocket readyState:', ws.readyState);
        if (isMountedRef.current) {
          const errorMsg = `Deepgram WebSocket failed. Your API key might be invalid or expired. Check settings.`;
          setError(new Error(errorMsg));
          setIsListening(false);
          // Alert user
          window.alert(`🔴 DEEPGRAM ERROR\n\n${errorMsg}\n\nAPI Key starts with: ${apiKey.substring(0, 8)}...`);
        }
      });

      ws.addEventListener('close', (event) => {
        console.log('🔌 [Deepgram] Connection closed', event.code, event.reason);
        if (isMountedRef.current) {
          setIsListening(false);
        }
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('❌ [Deepgram] Start error:', error.message);
      if (isMountedRef.current) {
        setError(error);
        setIsListening(false);
        window.alert(`🔴 MICROPHONE ERROR\n\n${error.message}`);
      }
    }
  }, [apiKey]);

  const stopListening = useCallback(() => {
    console.log('⏹️ [Deepgram] Stopping...');

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    if (isMountedRef.current) {
      setIsListening(false);
    }
  }, []);

  const getFullTranscript = useCallback(() => {
    return fullTranscriptRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopListening();
    };
  }, [stopListening]);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    getFullTranscript,
  };
}
