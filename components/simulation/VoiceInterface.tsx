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

  const handleStartCall = async () => {
    console.log('▶️ [UI] Starting call');
    store.startCall();
    setError(null);
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

      console.log('🔊 [UI] Calling /api/tts');
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiReply }),
      });

      if (!ttsResponse.ok) {
        throw new Error(`TTS API failed: ${ttsResponse.statusText}`);
      }

      const audioBlob = await ttsResponse.blob();
      console.log('🎵 [UI] Audio blob received:', audioBlob.size, 'bytes');

      console.log('▶️ [UI] Playing audio');
      setIsAudioPlaying(true);
      await playAudioBlob(audioBlob);
      setIsAudioPlaying(false);

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
    ? 'bg-slate-700'
    : metrics.sentiment === 'Positive'
      ? 'bg-green-700'
      : metrics.sentiment === 'Negative'
        ? 'bg-red-700'
        : 'bg-slate-700';

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header - Fixed */}
      <div className="border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-slate-800/30">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${
                isAudioPlaying ? 'bg-purple-500' : isRecording ? 'bg-orange-500' : 'bg-slate-600'
              }`}
            ></div>
            <span className="text-xs sm:text-sm font-mono text-slate-400 truncate">
              {isAudioPlaying ? '🔊 SPEAKING' : isProcessing ? '⚙️ PROCESSING' : isRecording ? '🎙️ RECORDING' : 'READY'}
            </span>
          </div>
          <CallTimer duration={store.duration} />
        </div>
        {productBrief && (
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-slate-800/20 border-t border-slate-800/30">
            <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-2">Your Context</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
              <div>
                <p className="font-semibold text-slate-400 mb-1">Company</p>
                <p>{productBrief.company}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 mb-1">Product</p>
                <p>{productBrief.product}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 mb-1">Pricing</p>
                <p className="text-orange-300 font-semibold">{productBrief.pricing}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 mb-1">Implementation</p>
                <p>{productBrief.implementation}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 mb-1">Results</p>
                <p>{productBrief.results}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 mb-1">Audience</p>
                <p>{productBrief.audience}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-red-500/50 bg-red-500/20 backdrop-blur-sm flex-shrink-0">
          <p className="text-red-300 text-xs sm:text-base font-semibold break-words">🔴 ERROR: {error}</p>
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
                  <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse" />
                  <div
                    className="absolute inset-8 rounded-full border-2 border-purple-500 animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                </>
              )}

              {isAudioPlaying && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-2 border-purple-400 animate-pulse"
                    style={{ animationDelay: '0s' }}
                  />
                  <div
                    className="absolute inset-4 rounded-full border-2 border-purple-300 animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="absolute inset-8 rounded-full border-2 border-purple-200 animate-pulse"
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
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-2xl shadow-purple-500/60 w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44'
                    : isProcessing
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-2xl shadow-purple-500/60 w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40'
                      : isRecording
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl shadow-orange-500/60 w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40'
                        : 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-orange-500/20 w-24 h-24 sm:w-32 sm:h-32'
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
            <h3 className="text-xs sm:text-sm font-mono text-slate-400 mb-3 sm:mb-4 uppercase tracking-wide flex-shrink-0">
              Conversation
            </h3>
            <div className="flex-1 overflow-y-auto min-h-0">
              <Transcript messages={store.callMessages} />
            </div>
          </div>

          {/* Right: Metrics */}
          <div className="lg:col-span-1 flex flex-col space-y-3 sm:space-y-4 min-h-0">
            <h3 className="text-xs sm:text-sm font-mono text-slate-400 uppercase tracking-wide flex-shrink-0">Real-Time Metrics</h3>

            <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto min-h-0">
              <div className="p-3 sm:p-4 rounded-lg border border-slate-700 bg-slate-800/40 backdrop-blur-sm">
                <p className="text-xs text-slate-400 uppercase font-mono tracking-wide mb-2">Talk-to-Listen</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{metrics?.talkToListen || '—'}%</p>
              </div>

              <div className="p-3 sm:p-4 rounded-lg border border-slate-700 bg-slate-800/40 backdrop-blur-sm">
                <p className="text-xs text-slate-400 uppercase font-mono tracking-wide mb-2">Pacing (WPM)</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{metrics?.wpm || '—'}</p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border ${sentimentColor} backdrop-blur-sm`}>
                <p className="text-xs text-slate-400 uppercase font-mono tracking-wide mb-2">Sentiment</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{metrics?.sentiment || '—'}</p>
              </div>

              <div className="p-3 sm:p-4 rounded-lg border border-slate-700 bg-slate-800/40 backdrop-blur-sm">
                <p className="text-xs text-slate-400 uppercase font-mono tracking-wide mb-2">Questions</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{metrics?.questionCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls - Fixed */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 py-3 sm:py-6 border-t border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex-shrink-0">
        {!store.isCallActive ? (
          <Button
            onClick={handleStartCall}
            size="lg"
            className="px-6 sm:px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/40 flex items-center gap-2 text-sm sm:text-base"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Start Call</span>
            <span className="sm:hidden">Start</span>
          </Button>
        ) : isRecording ? (
          <>
            <Button
              onClick={handleStop}
              disabled={isProcessing}
              size="lg"
              className="px-6 sm:px-8 border-orange-500 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 flex items-center gap-2 text-sm sm:text-base"
            >
              <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Stop</span>
              <span className="sm:hidden">Stop</span>
            </Button>
            <Button
              onClick={handleQuickEnd}
              size="lg"
              variant="destructive"
              className="px-6 sm:px-8 flex items-center gap-2 text-sm sm:text-base"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
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
              className="px-6 sm:px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/40 flex items-center gap-2 text-sm sm:text-base"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Continue</span>
              <span className="sm:hidden">Cont.</span>
            </Button>
            <Button
              onClick={handleQuickEnd}
              size="lg"
              variant="destructive"
              className="px-6 sm:px-8 flex items-center gap-2 text-sm sm:text-base"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">End</span>
              <span className="sm:hidden">End</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
