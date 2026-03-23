'use client';

import { useEffect, useRef } from 'react';

interface Message {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: number;
}

interface TranscriptProps {
  messages: Message[];
}

export default function Transcript({ messages }: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/40 backdrop-blur-sm p-4 scroll-smooth">
      <div ref={scrollRef} className="flex flex-col space-y-4">
        {messages.map((message, idx) => (
          <div key={idx} className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs sm:max-w-sm px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm leading-relaxed break-words ${
                message.speaker === 'user'
                  ? 'bg-orange-600/30 text-orange-100 border border-orange-500/30'
                  : 'bg-slate-700/50 text-slate-200 border border-slate-600'
              }`}
            >
              <p className="text-xs font-mono mb-1 opacity-60">
                {message.speaker === 'user' ? 'YOU' : 'PERSONA'}
              </p>
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
