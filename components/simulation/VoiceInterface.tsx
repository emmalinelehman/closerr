'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Phone, Volume2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallStore } from '@/lib/state/callStore';
import PersonaDisplay from './PersonaDisplay';
import Transcript from './Transcript';
import CallTimer from './CallTimer';
import { useSimpleTranscription } from '@/hooks/useSimpleTranscription';

interface VoiceInterfaceProps {
  personaId: string;
  personaName: string;
  personaTitle: string;
  productBrief?: {
    company: string;
    product: string;
    pricing: string;
    implementation: string;
    results: string;
    audience: string;
  };
}

interface CallMetrics {
  talkToListen: number;
  wpm: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  questionCount: number;
  labelingUsed: boolean;
  roiMentioned: boolean;
  speedMentioned: boolean;
  costMentioned: boolean;
}

async function playAudioBlob(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  return new Promise((resolve, reject) => {
    audio.onended = () => {
      console.log('✅ [Audio] Playback completed');
      URL.revokeObjectURL(url);
      resolve();
    };

    audio.onerror = () => {
      console.error('❌ [Audio] Playback failed');
      URL.revokeObjectURL(url);
      reject(new Error('Audio playback error'));
    };

    audio.play().catch((err) => {
      console.error('❌ [Audio] Play error:', err);
      URL.revokeObjectURL(url);
      reject(err);
    });
  });
}

export default function VoiceInterface({
  personaId,
  personaName,
  personaTitle,
  productBrief,
}: VoiceInterfaceProps) {
  const router = useRouter();
  const store = useCallStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<CallMetrics | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);

  const { isRecording, error: recordingError, startRecording, stopRecording } = useSimpleTranscription();

  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    store.initializeCall(personaId, personaName, personaTitle);
  }, [personaId, personaName, personaTitle, store]);

  useEffect(() => {
    if (recordingError) {
      setError(recordingError);
    }
  }, [recordingError]);

  // Update metrics every 500ms while call is active
  useEffect(() => {
    if (!store.isCallActive) return;

    const interval = setInterval(() => {
      store.updateMetrics();
    }, 500);

    return () => clearInterval(interval);
  }, [store.isCallActive, store]);

  const handleStartCall = async () => {
    console.log('▶️ [UI] Starting call');
    store.startCall();
    setError(null);
    setIsAudioPlaying(true);

    try {
      // Fetch initial greeting
      console.log('👋 [UI] Fetching greeting');
      const greetingResponse = await fetch('/api/greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId,
          personaName,
        }),
      });

      if (!greetingResponse.ok) {
        throw new Error('Failed to fetch greeting');
      }

      const { greeting } = await greetingResponse.json();
      console.log('👋 [UI] Got greeting:', greeting);

      // Convert greeting to speech
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: greeting }),
      });

      if (!ttsResponse.ok) {
        throw new Error('Failed to generate speech for greeting');
      }

      const audioBlob = await ttsResponse.blob();
      console.log('👋 [UI] Playing greeting');
      await playAudioBlob(audioBlob);

      // Add greeting to conversation history and store
      store.addMessage('ai', greeting);
      setConversationHistory([{ role: 'assistant', content: greeting }]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ [UI] Greeting error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsAudioPlaying(false);
    }

    // Start recording after greeting finishes
    await startRecording();
  };

  const handleContinue = async () => {
    console.log('🔄 [UI] CONTINUE - Starting next turn');
    await startRecording();
  };

  const handleStop = async () => {
    console.log('🛑 [UI] STOP CLICKED');
    setIsProcessing(true);

    try {
      const transcript = await stopRecording();

      if (!transcript?.trim()) {
        setError('No speech detected. Try again.');
        setIsProcessing(false);
        return;
      }

      console.log('📝 [UI] Transcript:', transcript);

      const newHistory = [...conversationHistory, { role: 'user' as const, content: transcript }];

      console.log('🧠 [UI] Calling /api/chat');
      const productBriefString = productBrief
        ? `Company: ${productBrief.company}. Product: ${productBrief.product}. Pricing: ${productBrief.pricing}. Implementation: ${productBrief.implementation}. Results: ${productBrief.results}. Audience: ${productBrief.audience}.`
        : undefined;

      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          personaId,
          conversationHistory: newHistory,
          productBrief: productBriefString,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error(`Chat API failed: ${chatResponse.statusText}`);
      }

      const chatData = await chatResponse.json();
      const aiReply = chatData.reply;
      const responseMetrics = chatData.metrics as CallMetrics;

      console.log('💬 [UI] AI response:', aiReply);
      console.log('📊 [UI] Metrics:', responseMetrics);

      setMetrics(responseMetrics);
      store.addMessage('user', transcript);
      store.addMessage('ai', aiReply);
      store.addMetrics(responseMetrics);
      setConversationHistory([...newHistory, { role: 'assistant', content: aiReply }]);

      console.log('🔊 [UI] Calling TTS API for ElevenLabs');
      setIsAudioPlaying(true);

      try {
        // Request audio from ElevenLabs via backend
        const ttsResponse = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: aiReply }),
        });

        if (!ttsResponse.ok) {
          const errorData = await ttsResponse.json();
          console.error('🔊 [UI] TTS API error response:', errorData);
          throw new Error(`TTS failed: ${errorData.error} - ${errorData.details || ''}`);
        }

        const audioBlob = await ttsResponse.blob();
        console.log('✅ [UI] Audio blob received, size:', audioBlob.size);
        await playAudioBlob(audioBlob);
      } finally {
        setIsAudioPlaying(false);
      }

      console.log('✅ [UI] Call complete');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ [UI] Error:', errorMsg);
      setError(errorMsg);
      window.alert(`🔴 ERROR\n\n${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickEnd = () => {
    console.log('❌ [UI] End call');
    store.endCall();
    setError(null);
    const callId = `call-${Date.now()}`;
    router.push(`/results/${callId}`);
  };

  const sentimentColor = !metrics
    ? 'bg-neutral-800/40 border-neutral-700 border-l-neutral-600 text-neutral-400'
    : metrics.sentiment === 'Positive'
      ? 'bg-emerald-500/10 border-neutral-700 border-l-emerald-500 text-emerald-100'
      : metrics.sentiment === 'Negative'
        ? 'bg-pink-500/10 border-neutral-700 border-l-pink-500 text-pink-100'
        : 'bg-amber-500/10 border-neutral-700 border-l-amber-500 text-amber-100';

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-red-950 via-rose-950/20 to-orange-950/30">
      {/* Header - Fixed */}
      <div className="border-b border-b-cyan-500/30 bg-gradient-to-r from-neutral-900/40 via-neutral-900/30 to-neutral-900/40 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-neutral-700/30">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${
                isAudioPlaying ? 'bg-cyan-500' : isRecording ? 'bg-orange-500' : 'bg-neutral-600'
              }`}
            ></div>
            <span className="text-xs sm:text-sm font-mono text-neutral-400 truncate">
              {isAudioPlaying ? '🔊 SPEAKING' : isProcessing ? '⚙️ PROCESSING' : isRecording ? '🎙️ RECORDING' : 'READY'}
            </span>
          </div>
          <CallTimer duration={store.duration} />
        </div>
        {productBrief && (
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-gradient-to-r from-neutral-800/40 via-emerald-900/10 to-neutral-800/40 border-t border-t-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-1 rounded-full bg-emerald-400"></div>
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Your Context</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-neutral-400 mb-1">Company</p>
                <p className="text-neutral-200">{productBrief.company}</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-400 mb-1">Product</p>
                <p className="text-neutral-200">{productBrief.product}</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-400 mb-1">Pricing</p>
                <p className="text-orange-400 font-semibold">{productBrief.pricing}</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-400 mb-1">Implementation</p>
                <p className="text-neutral-200">{productBrief.implementation}</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-400 mb-1">Results</p>
                <p className="text-neutral-200">{productBrief.results}</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-400 mb-1">Audience</p>
                <p className="text-neutral-200">{productBrief.audience}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-pink-600/50 bg-pink-600/20 backdrop-blur-sm flex-shrink-0">
          <p className="text-pink-300 text-xs sm:text-base font-semibold break-words">🔴 ERROR: {error}</p>
        </div>
      )}

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-8">
          {/* Left: Persona & Orb */}
          <div className="lg:col-span-1 flex flex-col items-center space-y-4">
            <PersonaDisplay name={personaName} title={personaTitle} />

            <div className="relative flex items-center justify-center h-48 w-48 sm:h-60 sm:w-60 lg:h-72 lg:w-72">
              {isProcessing && (
                <>
                  <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-pulse" />
                  <div
                    className="absolute inset-8 rounded-full border-2 border-orange-500 animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                </>
              )}

              {isAudioPlaying && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-pulse"
                    style={{ animationDelay: '0s' }}
                  />
                  <div
                    className="absolute inset-4 rounded-full border-2 border-cyan-500 animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="absolute inset-8 rounded-full border-2 border-cyan-600 animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  />
                </>
              )}

              {isRecording && !isProcessing && !isAudioPlaying && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-orange-400 animate-pulse" />
                  <div
                    className="absolute inset-4 rounded-full border-2 border-orange-500 animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                </>
              )}

              <div
                className={`relative flex items-center justify-center rounded-full transition-all duration-300 z-10 ${
                  isAudioPlaying
                    ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-2xl shadow-cyan-500/60 w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44'
                    : isProcessing
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl shadow-orange-500/60 w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40'
                      : isRecording
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl shadow-orange-500/60 w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40'
                        : 'bg-gradient-to-br from-neutral-800 to-neutral-900 shadow-lg shadow-orange-500/20 w-24 h-24 sm:w-32 sm:h-32'
                }`}
              >
                {isAudioPlaying ? (
                  <Volume2 className="w-10 h-10 sm:w-14 sm:h-14 text-white animate-pulse" />
                ) : isProcessing ? (
                  <Zap className="w-10 h-10 sm:w-14 sm:h-14 text-white animate-pulse" />
                ) : isRecording ? (
                  <Mic className="w-10 h-10 sm:w-14 sm:h-14 text-white animate-pulse" />
                ) : (
                  <MicOff className="w-10 h-10 sm:w-14 sm:h-14 text-white/60" />
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs sm:text-sm font-mono text-slate-300">
                {isAudioPlaying ? '🔊 Speaking...' : isProcessing ? '⚙️ Thinking...' : isRecording ? '🎙️ Recording...' : '✓ Ready'}
              </p>
            </div>
          </div>

          {/* Center: Transcript */}
          <div className="lg:col-span-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-1 rounded-full bg-cyan-400"></div>
              <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold flex-shrink-0">
                Conversation
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <Transcript messages={store.callMessages} />
            </div>
          </div>

          {/* Right: Metrics */}
          <div className="lg:col-span-1 flex flex-col space-y-4 min-h-0">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-emerald-400"></div>
              <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold flex-shrink-0">Real-Time Metrics</h3>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
              <div className="p-4 rounded-lg border border-l-2 border-neutral-700 border-l-amber-500 bg-amber-500/5 backdrop-blur-sm hover:bg-amber-500/10 transition-colors">
                <p className="text-xs text-amber-400 uppercase font-mono tracking-wide mb-2">Talk-to-Listen</p>
                <p className="text-3xl font-bold text-amber-100">{metrics?.talkToListen || '—'}%</p>
              </div>

              <div className="p-4 rounded-lg border border-l-2 border-neutral-700 border-l-cyan-500 bg-cyan-500/5 backdrop-blur-sm hover:bg-cyan-500/10 transition-colors">
                <p className="text-xs text-cyan-400 uppercase font-mono tracking-wide mb-2">Pacing (WPM)</p>
                <p className="text-3xl font-bold text-cyan-100">{metrics?.wpm || '—'}</p>
              </div>

              <div className={`p-4 rounded-lg border border-l-2 backdrop-blur-sm transition-colors ${sentimentColor}`}>
                <p className="text-xs uppercase font-mono tracking-wide mb-2">Sentiment</p>
                <p className="text-2xl font-bold">{metrics?.sentiment || '—'}</p>
              </div>

              <div className="p-4 rounded-lg border border-l-2 border-neutral-700 border-l-pink-500 bg-pink-500/5 backdrop-blur-sm hover:bg-pink-500/10 transition-colors">
                <p className="text-xs text-pink-400 uppercase font-mono tracking-wide mb-2">Questions</p>
                <p className="text-3xl font-bold text-pink-100">{metrics?.questionCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls - Fixed */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 border-t border-t-emerald-500/30 bg-gradient-to-r from-neutral-900/40 via-neutral-900/30 to-neutral-900/40 backdrop-blur-md flex-shrink-0">
        {!store.isCallActive ? (
          <Button
            onClick={handleStartCall}
            size="lg"
            className="px-7 sm:px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/40 flex items-center gap-2 text-sm sm:text-base font-semibold transition-all duration-200"
          >
            <Mic className="w-5 h-5" />
            <span className="hidden sm:inline">Start Call</span>
            <span className="sm:hidden">Start</span>
          </Button>
        ) : isRecording ? (
          <>
            <Button
              onClick={handleStop}
              disabled={isProcessing}
              size="lg"
              className="px-7 sm:px-8 border border-orange-500 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base font-semibold transition-all duration-200"
            >
              <MicOff className="w-5 h-5" />
              <span className="hidden sm:inline">Stop</span>
              <span className="sm:hidden">Stop</span>
            </Button>
            <Button
              onClick={handleQuickEnd}
              size="lg"
              className="px-7 sm:px-8 bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/40 flex items-center gap-2 text-sm sm:text-base font-semibold transition-all duration-200"
            >
              <Phone className="w-5 h-5" />
              <span className="hidden sm:inline">End</span>
              <span className="sm:hidden">End</span>
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleContinue}
              disabled={isProcessing || isAudioPlaying}
              size="lg"
              className="px-7 sm:px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/40 disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base font-semibold transition-all duration-200"
            >
              <Mic className="w-5 h-5" />
              <span className="hidden sm:inline">Continue</span>
              <span className="sm:hidden">Cont.</span>
            </Button>
            <Button
              onClick={handleQuickEnd}
              size="lg"
              className="px-7 sm:px-8 bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/40 flex items-center gap-2 text-sm sm:text-base font-semibold transition-all duration-200"
            >
              <Phone className="w-5 h-5" />
              <span className="hidden sm:inline">End</span>
              <span className="sm:hidden">End</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
