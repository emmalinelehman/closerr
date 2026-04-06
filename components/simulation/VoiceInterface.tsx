'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Phone, Volume2, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallStore, CallMetrics } from '@/lib/state/callStore';
import PersonaDisplay from './PersonaDisplay';
import Transcript from './Transcript';
import CallTimer from './CallTimer';
import { useSimpleTranscription } from '@/hooks/useSimpleTranscription';
import { getPersonaContext } from '@/lib/config/personas';
import { Product } from '@/lib/config/productSchema';

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
  product?: Product;
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

// Helper for API calls with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms. Please try again.`);
    }
    throw error;
  }
}

export default function VoiceInterface({
  personaId,
  personaName,
  personaTitle,
  productBrief,
  product,
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
  const [showContext, setShowContext] = useState(false);
  const [showPersonaContext, setShowPersonaContext] = useState(false);
  const [showProductContext, setShowProductContext] = useState(false);
  const personaContext = getPersonaContext(personaId);
  const selectedProduct = product;

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
      const greetingResponse = await fetchWithTimeout('/api/greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId,
          personaName,
        }),
      }, 15000);

      if (!greetingResponse.ok) {
        const errorData = await greetingResponse.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
          `Server error (${greetingResponse.status}). Please refresh and try again.`
        );
      }

      const { greeting } = await greetingResponse.json();
      console.log('👋 [UI] Got greeting:', greeting);

      // Convert greeting to speech
      const ttsResponse = await fetchWithTimeout('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: greeting }),
      }, 20000);

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
          `Speech service error (${ttsResponse.status}). Please try again.`
        );
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

      const chatResponse = await fetchWithTimeout('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          personaId,
          conversationHistory: newHistory,
          productBrief: productBriefString,
          product: selectedProduct,
        }),
      }, 45000); // Chat can take longer

      if (!chatResponse.ok) {
        const errorData = await chatResponse.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
          `Chat failed (${chatResponse.status}). ${chatResponse.status === 408 ? 'Please try again or make your last message shorter.' : 'Please try again.'}`
        );
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
        const ttsResponse = await fetchWithTimeout('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: aiReply }),
        }, 20000);

        if (!ttsResponse.ok) {
          const errorData = await ttsResponse.json().catch(() => ({}));
          console.error('🔊 [UI] TTS API error response:', errorData);
          throw new Error(
            errorData.error ||
            `Speech generation failed (${ttsResponse.status}). Please try again.`
          );
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
    ? 'bg-[#f0f0f0] border-[#e0e0e0] border-l-[#cccccc] text-[#999999]'
    : metrics.sentiment === 'Positive'
      ? 'bg-[#616161]/10 border-[#e0e0e0] border-l-[#616161] text-[#616161]'
      : metrics.sentiment === 'Negative'
        ? 'bg-[#424242]/10 border-[#e0e0e0] border-l-[#424242] text-[#424242]'
        : 'bg-[#757575]/10 border-[#e0e0e0] border-l-[#757575] text-[#757575]';

  return (
    <div className="flex flex-col h-screen bg-[#ffffff]">
      {/* Header - Fixed */}
      <div className="border-b-4 border-[#e0e0e0] bg-[#f9f9f9] flex-shrink-0">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b-4 border-[#e0e0e0]">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${
                isAudioPlaying ? 'bg-gray-400' : isRecording ? 'bg-gray-600' : 'bg-[#cccccc]'
              }`}
            ></div>
            <span className="text-xs sm:text-sm font-mono text-[#666666] truncate">
              {isAudioPlaying ? '🔊 SPEAKING' : isProcessing ? '⚙️ PROCESSING' : isRecording ? '🎙️ RECORDING' : 'READY'}
            </span>
          </div>
          <CallTimer duration={store.duration} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b-4 border-[#424242]/50 bg-[#424242]/10 flex-shrink-0">
          <p className="text-[#424242] text-xs sm:text-base font-semibold break-words">🔴 ERROR: {error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Mobile Layout - Single Column */}
        <div className="lg:hidden w-full flex flex-col overflow-hidden bg-[#ffffff]">
          {/* Top Section: Persona & Microphone */}
          <div className="flex flex-col items-center pt-4 px-4 flex-shrink-0">
            <PersonaDisplay name={personaName} title={personaTitle} />

            <div className="mt-6 mb-4 flex items-center justify-center">
              <div className="relative flex items-center justify-center h-40 w-40">
                {isProcessing && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-gray-600/20 animate-pulse" />
                    <div className="absolute inset-6 rounded-full border-2 border-gray-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  </>
                )}
                {isAudioPlaying && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-[#00E5FF] animate-pulse" style={{ animationDelay: '0s' }} />
                    <div className="absolute inset-3 rounded-full border-2 border-[#00E5FF] animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="absolute inset-6 rounded-full border-2 border-[#00E5FF] animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </>
                )}
                {isRecording && !isProcessing && !isAudioPlaying && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-gray-600 animate-pulse" />
                    <div className="absolute inset-3 rounded-full border-2 border-gray-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  </>
                )}
                <div
                  className={`relative flex items-center justify-center rounded-full transition-all duration-300 z-10 ${
                    isAudioPlaying
                      ? 'bg-gradient-to-br from-gray-500 to-gray-500 shadow-2xl shadow-gray-500/60 w-28 h-28'
                      : isProcessing
                        ? 'bg-gradient-to-br from-gray-600 to-gray-600 shadow-2xl shadow-gray-600/60 w-24 h-24'
                        : isRecording
                          ? 'bg-gradient-to-br from-gray-600 to-gray-600 shadow-2xl shadow-gray-600/60 w-24 h-24'
                          : 'bg-gradient-to-br from-[#f9f9f9] to-[#f0f0f0] shadow-lg shadow-gray-600/20 w-20 h-20'
                  }`}
                >
                  {isAudioPlaying ? (
                    <Volume2 className="w-10 h-10 text-white animate-pulse" />
                  ) : isProcessing ? (
                    <Zap className="w-10 h-10 text-white animate-pulse" />
                  ) : isRecording ? (
                    <Mic className="w-10 h-10 text-white animate-pulse" />
                  ) : (
                    <MicOff className="w-10 h-10 text-[#999999]" />
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs font-mono text-[#666666] mb-3">
              {isAudioPlaying ? '🔊 Speaking' : isProcessing ? '⚙️ Thinking' : isRecording ? '🎙️ Recording' : '✓ Ready'}
            </p>

            {/* Mobile Persona Context */}
            {personaContext && (
              <div className="w-full bg-[#f9f9f9] border-2 border-[#00E5FF]/30 rounded-lg overflow-hidden mb-3">
                <button
                  onClick={() => setShowPersonaContext(!showPersonaContext)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#f0f0f0] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-1 w-1 rounded-full bg-[#00E5FF] flex-shrink-0"></div>
                    <h4 className="text-xs font-semibold text-[#00E5FF] uppercase tracking-wider truncate">Company Context</h4>
                  </div>
                  {showPersonaContext ? (
                    <ChevronUp className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                  )}
                </button>
                {showPersonaContext && (
                  <div className="px-3 py-2 border-t border-[#00E5FF]/30 space-y-1.5 text-xs max-h-40 overflow-y-auto">
                    <div>
                      <p className="font-semibold text-[#00E5FF] mb-0.5">Challenge</p>
                      <p className="text-[#333333] text-xs">{personaContext.keyChallenge}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#00E5FF] mb-0.5">Budget</p>
                      <p className="text-[#333333] text-xs">{personaContext.budget}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Your Product */}
            {selectedProduct && (
              <div className="w-full bg-[#f9f9f9] border-2 border-[#FF5E00]/30 rounded-lg overflow-hidden mb-3">
                <button
                  onClick={() => setShowProductContext(!showProductContext)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#f0f0f0] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-1 w-1 rounded-full bg-[#FF5E00] flex-shrink-0"></div>
                    <h4 className="text-xs font-semibold text-[#FF5E00] uppercase tracking-wider truncate">Your Product</h4>
                  </div>
                  {showProductContext ? (
                    <ChevronUp className="w-4 h-4 text-[#FF5E00] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#FF5E00] flex-shrink-0" />
                  )}
                </button>
                {showProductContext && (
                  <div className="px-3 py-2 border-t border-[#FF5E00]/30 space-y-1.5 text-xs max-h-40 overflow-y-auto">
                    <div>
                      <p className="font-semibold text-[#FF5E00] mb-0.5">Product</p>
                      <p className="text-[#333333] font-bold text-xs">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#FF5E00] mb-0.5">Pricing</p>
                      <p className="text-[#333333] text-xs font-semibold">{selectedProduct.pricingCost}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#FF5E00] mb-0.5">Implementation</p>
                      <p className="text-[#333333] text-xs">{selectedProduct.implementationTime}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Product Context (old productBrief) */}
            {productBrief && (
              <div className="w-full bg-[#f9f9f9] border-2 border-[#616161]/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowContext(!showContext)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#f0f0f0] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-1 w-1 rounded-full bg-[#616161] flex-shrink-0"></div>
                    <h4 className="text-xs font-semibold text-[#616161] uppercase tracking-wider truncate">Your Context</h4>
                  </div>
                  {showContext ? (
                    <ChevronUp className="w-4 h-4 text-[#616161] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#616161] flex-shrink-0" />
                  )}
                </button>
                {showContext && (
                  <div className="px-3 py-2 border-t border-[#616161]/30 space-y-1.5 text-xs max-h-32 overflow-y-auto">
                    <div>
                      <p className="font-semibold text-[#666666] mb-0.5">Company</p>
                      <p className="text-[#333333] text-xs">{productBrief.company}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#666666] mb-0.5">Product</p>
                      <p className="text-[#333333] text-xs">{productBrief.product}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#666666] mb-0.5">Pricing</p>
                      <p className="text-[#FF5E00] font-semibold text-xs">{productBrief.pricing}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Transcript - Takes Remaining Space */}
          <div className="flex-1 overflow-hidden flex flex-col mt-4 px-4 pb-2 min-h-0">
            <div className="flex items-center gap-2 mb-2 flex-shrink-0">
              <div className="h-1 w-1 rounded-full bg-gray-400"></div>
              <h3 className="text-xs font-mono text-[#00E5FF] uppercase tracking-wider font-semibold">Conversation</h3>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <Transcript messages={store.callMessages} />
            </div>
          </div>
        </div>

        {/* Desktop Layout - Three Column */}
        <div className="hidden lg:flex lg:w-full overflow-hidden">
        {/* Left Panel: Persona & Microphone */}
        <div className="hidden lg:flex lg:w-[28%] flex-col items-center justify-start pt-8 pb-8 px-6 border-r-4 border-[#e0e0e0] overflow-y-auto bg-[#ffffff]">
          <PersonaDisplay name={personaName} title={personaTitle} />

          {/* Microphone Hero - Generous Space */}
          <div className="mt-12 mb-12 flex items-center justify-center">
            <div className="relative flex items-center justify-center h-56 w-56">
              {isProcessing && (
                <>
                  <div className="absolute inset-0 rounded-full bg-gray-600/20 animate-pulse" />
                  <div
                    className="absolute inset-8 rounded-full border-2 border-gray-600 animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                </>
              )}

              {isAudioPlaying && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-2 border-[#00E5FF] animate-pulse"
                    style={{ animationDelay: '0s' }}
                  />
                  <div
                    className="absolute inset-4 rounded-full border-2 border-[#00E5FF] animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="absolute inset-8 rounded-full border-2 border-[#00E5FF] animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  />
                </>
              )}

              {isRecording && !isProcessing && !isAudioPlaying && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-gray-600 animate-pulse" />
                  <div
                    className="absolute inset-4 rounded-full border-2 border-gray-600 animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                </>
              )}

              <div
                className={`relative flex items-center justify-center rounded-full transition-all duration-300 z-10 ${
                  isAudioPlaying
                    ? 'bg-gradient-to-br from-gray-500 to-gray-500 shadow-2xl shadow-gray-500/60 w-40 h-40'
                    : isProcessing
                      ? 'bg-gradient-to-br from-gray-600 to-gray-600 shadow-2xl shadow-gray-600/60 w-36 h-36'
                      : isRecording
                        ? 'bg-gradient-to-br from-gray-600 to-gray-600 shadow-2xl shadow-gray-600/60 w-36 h-36'
                        : 'bg-gradient-to-br from-[#f9f9f9] to-[#f0f0f0] shadow-lg shadow-gray-600/20 w-32 h-32'
                }`}
              >
                {isAudioPlaying ? (
                  <Volume2 className="w-14 h-14 text-white animate-pulse" />
                ) : isProcessing ? (
                  <Zap className="w-14 h-14 text-white animate-pulse" />
                ) : isRecording ? (
                  <Mic className="w-14 h-14 text-white animate-pulse" />
                ) : (
                  <MicOff className="w-14 h-14 text-white/60" />
                )}
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-sm font-mono text-[#666666]">
              {isAudioPlaying ? '🔊 Speaking' : isProcessing ? '⚙️ Thinking' : isRecording ? '🎙️ Recording' : '✓ Ready'}
            </p>
          </div>

          {/* Persona Context Drawer */}
          {personaContext && (
            <div className="w-full bg-[#f9f9f9] border-2 border-[#00E5FF]/30 rounded-lg overflow-hidden mb-4">
              <button
                onClick={() => setShowPersonaContext(!showPersonaContext)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f0f0f0] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#00E5FF]"></div>
                  <h4 className="text-xs font-semibold text-[#00E5FF] uppercase tracking-wider">Company Context</h4>
                </div>
                {showPersonaContext ? (
                  <ChevronUp className="w-4 h-4 text-[#00E5FF]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#00E5FF]" />
                )}
              </button>
              {showPersonaContext && (
                <div className="px-4 py-3 border-t border-[#00E5FF]/30 space-y-2 text-xs max-h-64 overflow-y-auto">
                  <div>
                    <p className="font-semibold text-[#00E5FF] mb-1">Role</p>
                    <p className="text-[#333333]">{personaContext.title}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#00E5FF] mb-1">Company</p>
                    <p className="text-[#333333]">{personaContext.company} ({personaContext.companySize} people)</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#00E5FF] mb-1">Key Challenge</p>
                    <p className="text-[#333333] leading-relaxed">{personaContext.keyChallenge}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#00E5FF] mb-1">Budget</p>
                    <p className="text-[#333333]">{personaContext.budget} ({personaContext.budgetStatus})</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#00E5FF] mb-1">Q1/Q2 Priorities</p>
                    <ul className="text-[#333333] space-y-1 list-disc list-inside">
                      {personaContext.q1_q2_priorities.slice(0, 3).map((p, i) => (
                        <li key={i} className="text-xs leading-snug">{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-[#00E5FF] mb-1">Pain Points</p>
                    <ul className="text-[#333333] space-y-1 list-disc list-inside">
                      {personaContext.painPoints.slice(0, 2).map((p, i) => (
                        <li key={i} className="text-xs leading-snug">{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Your Product Drawer */}
          {selectedProduct && (
            <div className="w-full bg-[#f9f9f9] border-2 border-[#FF5E00]/30 rounded-lg overflow-hidden mb-4">
              <button
                onClick={() => setShowProductContext(!showProductContext)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f0f0f0] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#FF5E00]"></div>
                  <h4 className="text-xs font-semibold text-[#FF5E00] uppercase tracking-wider">Your Product</h4>
                </div>
                {showProductContext ? (
                  <ChevronUp className="w-4 h-4 text-[#FF5E00]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#FF5E00]" />
                )}
              </button>
              {showProductContext && (
                <div className="px-4 py-3 border-t border-[#FF5E00]/30 space-y-2 text-xs max-h-64 overflow-y-auto">
                  <div>
                    <p className="font-semibold text-[#FF5E00] mb-1">Product</p>
                    <p className="text-[#333333] font-bold">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#FF5E00] mb-1">Category</p>
                    <p className="text-[#333333]">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#FF5E00] mb-1">Pricing</p>
                    <p className="text-[#333333] font-semibold">{selectedProduct.pricingCost}</p>
                    <p className="text-[#666666] text-xs">({selectedProduct.pricingModel})</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#FF5E00] mb-1">Implementation</p>
                    <p className="text-[#333333]">{selectedProduct.implementationTime}</p>
                  </div>
                  {selectedProduct.keyBenefits.length > 0 && (
                    <div>
                      <p className="font-semibold text-[#FF5E00] mb-1">Key Benefits</p>
                      <ul className="text-[#333333] space-y-1 list-disc list-inside">
                        {selectedProduct.keyBenefits.map((benefit, i) => (
                          <li key={i} className="text-xs leading-snug">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedProduct.naturalConcerns.length > 0 && (
                    <div>
                      <p className="font-semibold text-[#FF5E00] mb-1">Concerns to Expect</p>
                      <ul className="text-[#333333] space-y-1 list-disc list-inside">
                        {selectedProduct.naturalConcerns.slice(0, 2).map((concern, i) => (
                          <li key={i} className="text-xs leading-snug">{concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Product Context Drawer */}
          {productBrief && (
            <div className="w-full bg-[#f9f9f9] border-2 border-[#616161]/30 rounded-lg overflow-hidden mt-auto">
              <button
                onClick={() => setShowContext(!showContext)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f0f0f0] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#616161]"></div>
                  <h4 className="text-xs font-semibold text-[#616161] uppercase tracking-wider">Your Context</h4>
                </div>
                {showContext ? (
                  <ChevronUp className="w-4 h-4 text-[#616161]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#616161]" />
                )}
              </button>
              {showContext && (
                <div className="px-4 py-3 border-t border-[#616161]/30 space-y-2.5 text-xs max-h-64 overflow-y-auto">
                  <div>
                    <p className="font-semibold text-[#666666] mb-1">Company</p>
                    <p className="text-[#333333] text-xs leading-relaxed">{productBrief.company}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#666666] mb-1">Product</p>
                    <p className="text-[#333333] text-xs leading-relaxed">{productBrief.product}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#666666] mb-1">Pricing</p>
                    <p className="text-[#FF5E00] font-semibold text-xs">{productBrief.pricing}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#666666] mb-1">Implementation</p>
                    <p className="text-[#333333] text-xs leading-relaxed">{productBrief.implementation}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#666666] mb-1">Results</p>
                    <p className="text-[#333333] text-xs leading-relaxed">{productBrief.results}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#666666] mb-1">Audience</p>
                    <p className="text-[#333333] text-xs leading-relaxed">{productBrief.audience}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Panel: Transcript (Full Height) */}
        <div className="flex-1 lg:w-[44%] flex flex-col px-4 sm:px-8 py-6 overflow-hidden bg-[#ffffff]">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-1 rounded-full bg-gray-400"></div>
            <h3 className="text-xs font-mono text-[#00E5FF] uppercase tracking-wider font-semibold">
              Conversation
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <Transcript messages={store.callMessages} />
          </div>
        </div>

        {/* Right Panel: Metrics (Stacked Vertically) */}
        <div className="hidden lg:flex lg:w-[28%] flex-col px-6 py-6 border-l-4 border-[#e0e0e0] overflow-y-auto bg-[#ffffff]">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1 w-1 rounded-full bg-[#616161]"></div>
            <h3 className="text-xs font-mono text-[#616161] uppercase tracking-wider font-semibold">Real-Time Metrics</h3>
          </div>

          <div className="space-y-4">
            {/* Talk-to-Listen */}
            <div className="p-4 rounded-lg border border-l-4 border-[#e0e0e0] border-l-[#757575] bg-[#757575]/5 hover:bg-[#757575]/10 transition-colors">
              <p className="text-xs text-[#757575] uppercase font-mono tracking-wide mb-2">Talk-to-Listen Ratio</p>
              <p className="text-3xl font-bold text-[#757575]">{metrics?.talkToListen || '—'}%</p>
            </div>

            {/* WPM */}
            <div className="p-4 rounded-lg border border-l-4 border-[#e0e0e0] border-l-[#00E5FF] bg-gray-400/5 hover:bg-gray-400/10 transition-colors">
              <p className="text-xs text-[#00E5FF] uppercase font-mono tracking-wide mb-2">Speaking Pace (WPM)</p>
              <p className="text-3xl font-bold text-[#00E5FF]">{metrics?.wpm || '—'}</p>
            </div>

            {/* Sentiment */}
            <div className={`p-4 rounded-lg border border-l-4 transition-colors ${sentimentColor}`}>
              <p className="text-xs uppercase font-mono tracking-wide mb-2">Sentiment</p>
              <p className="text-2xl font-bold">{metrics?.sentiment || '—'}</p>
            </div>

            {/* Questions */}
            <div className="p-4 rounded-lg border border-l-4 border-[#e0e0e0] border-l-[#424242] bg-[#424242]/5 hover:bg-[#424242]/10 transition-colors">
              <p className="text-xs text-[#424242] uppercase font-mono tracking-wide mb-2">Questions Asked</p>
              <p className="text-3xl font-bold text-[#424242]">{metrics?.questionCount || 0}</p>
            </div>

            {/* Discovery Depth - NEW */}
            {metrics && (metrics.level1Questions || metrics.level2Questions || metrics.level3Questions) && (
              <div className="p-4 rounded-lg border border-l-4 border-[#e0e0e0] border-l-[#9C27B0] bg-[#9C27B0]/5 hover:bg-[#9C27B0]/10 transition-colors">
                <p className="text-xs text-[#9C27B0] uppercase font-mono tracking-wide mb-3">Discovery Progression</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-[#9C27B0] mb-1">L1</p>
                    <p className="text-2xl font-bold text-[#9C27B0]">{metrics.level1Questions || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9C27B0] mb-1">L2</p>
                    <p className="text-2xl font-bold text-[#9C27B0]">{metrics.level2Questions || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9C27B0] mb-1">L3</p>
                    <p className="text-2xl font-bold text-[#9C27B0]">{metrics.level3Questions || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Empathy Techniques - NEW */}
            {metrics && (metrics.labelingCount || metrics.mirroringCount || metrics.calibratedQCount) && (
              <div className="p-4 rounded-lg border border-l-4 border-[#e0e0e0] border-l-[#FF6B35] bg-[#FF6B35]/5 hover:bg-[#FF6B35]/10 transition-colors">
                <p className="text-xs text-[#FF6B35] uppercase font-mono tracking-wide mb-3">Empathy Techniques</p>
                <div className="space-y-1 text-xs">
                  {metrics.labelingCount > 0 && <p className="text-[#FF6B35]">✓ Labeling: {metrics.labelingCount}</p>}
                  {metrics.mirroringCount > 0 && <p className="text-[#FF6B35]">✓ Mirroring: {metrics.mirroringCount}</p>}
                  {metrics.calibratedQCount > 0 && <p className="text-[#FF6B35]">✓ Calibrated Qs: {metrics.calibratedQCount}</p>}
                </div>
              </div>
            )}

            {/* Persona Alignment - NEW */}
            {metrics && (metrics.roiMentioned || metrics.speedMentioned || metrics.costMentioned) && (
              <div className="p-4 rounded-lg border border-l-4 border-[#e0e0e0] border-l-[#4CAF50] bg-[#4CAF50]/5 hover:bg-[#4CAF50]/10 transition-colors">
                <p className="text-xs text-[#4CAF50] uppercase font-mono tracking-wide mb-2">Alignment Signals</p>
                <div className="space-y-1 text-xs">
                  {metrics.roiMentioned && <p className="text-[#4CAF50] font-semibold">💰 ROI/Financial mentioned</p>}
                  {metrics.speedMentioned && <p className="text-[#4CAF50] font-semibold">⚡ Speed/Urgency mentioned</p>}
                  {metrics.costMentioned && <p className="text-[#4CAF50] font-semibold">📊 Budget/Cost mentioned</p>}
                </div>
              </div>
            )}

            {/* Status Indicator */}
            <div className="mt-6 p-3 rounded-lg bg-[#f0f0f0] border border-[#e0e0e0] flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isAudioPlaying ? 'bg-gray-400' : isRecording ? 'bg-gray-600' : 'bg-[#cccccc]'}`}></div>
              <span className="text-xs text-[#666666]">
                {isAudioPlaying ? 'Persona speaking' : isRecording ? 'Recording' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
        </div>
        {/* End Desktop Layout */}
      </div>
      {/* End Main Content */}

      {/* Bottom Controls - Fixed */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 border-t-4 border-[#616161]/30 bg-[#f9f9f9] flex-shrink-0">
        {!store.isCallActive ? (
          <Button
            onClick={handleStartCall}
            size="lg"
            className="px-7 sm:px-8 bg-gray-600 hover:bg-gray-600/90 text-white shadow-lg shadow-gray-600/40 flex items-center gap-2 text-sm sm:text-base font-semibold transition-all duration-200"
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
              className="px-7 sm:px-8 border border-gray-600 bg-gray-600/20 text-[#FF5E00] hover:bg-gray-600/30 disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base font-semibold transition-all duration-200"
            >
              <MicOff className="w-5 h-5" />
              <span className="hidden sm:inline">Stop</span>
              <span className="sm:hidden">Stop</span>
            </Button>
            <Button
              onClick={handleQuickEnd}
              size="lg"
              className="px-7 sm:px-8 bg-[#424242] hover:bg-[#424242]/90 text-white shadow-lg shadow-[#424242]/40 flex items-center gap-2 text-sm sm:text-base font-semibold transition-all duration-200"
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
              className="px-7 sm:px-8 bg-[#616161] hover:bg-[#616161]/90 text-white shadow-lg shadow-[#616161]/40 disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base font-semibold transition-all duration-200"
            >
              <Mic className="w-5 h-5" />
              <span className="hidden sm:inline">Continue</span>
              <span className="sm:hidden">Cont.</span>
            </Button>
            <Button
              onClick={handleQuickEnd}
              size="lg"
              className="px-7 sm:px-8 bg-[#424242] hover:bg-[#424242]/90 text-white shadow-lg shadow-[#424242]/40 flex items-center gap-2 text-sm sm:text-base font-semibold transition-all duration-200"
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
