'use client';

import { useCallback, useRef, useState } from 'react';

export function useSimpleTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎙️ [Recording] Starting...');
      setError(null);
      audioChunksRef.current = [];

      // Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;
      console.log('✅ [Recording] Mic access granted');

      // Create recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ [Recording] Error:', event.error);
        setError('Microphone error');
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('✅ [Recording] Recording started');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Microphone access failed';
      console.error('❌ [Recording] Error:', msg);
      setError(msg);
      window.alert(`🔴 MIC ERROR\n\n${msg}`);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('⏹️ [Recording] Stopping...');

      if (!mediaRecorderRef.current) {
        setError('No recording in progress');
        reject(new Error('No recording'));
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;

      mediaRecorder.onstop = async () => {
        console.log('✅ [Recording] Stopped, audio chunks:', audioChunksRef.current.length);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Create blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('📦 [Recording] Audio blob created:', audioBlob.size, 'bytes');

        try {
          // Send to /api/transcribe
          console.log('📡 [Recording] Sending to /api/transcribe');
          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.webm');

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Transcribe API failed: ${response.statusText}`);
          }

          const data = await response.json();
          const transcript = data.transcript || '';
          console.log('📝 [Recording] Transcript:', transcript);

          setIsRecording(false);
          resolve(transcript);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Transcription failed';
          console.error('❌ [Recording] Transcription error:', msg);
          setError(msg);
          window.alert(`🔴 TRANSCRIPTION ERROR\n\n${msg}`);
          setIsRecording(false);
          reject(err);
        }
      };

      mediaRecorder.stop();
    });
  }, []);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
  };
}
