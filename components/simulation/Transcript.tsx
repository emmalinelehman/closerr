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
    <div className="h-full w-full flex flex-col overflow-y-auto rounded-lg border-2 border-cyan-500/40 bg-gradient-to-br from-neutral-800/40 to-cyan-900/10 backdrop-blur-sm p-4 scroll-smooth">
      <div ref={scrollRef} className="flex flex-col space-y-3">
        {messages.map((message, idx) => (
          <div key={idx} className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs sm:max-w-sm px-4 py-3 rounded-lg text-xs sm:text-sm leading-relaxed break-words border-l-2 ${
                message.speaker === 'user'
                  ? 'bg-orange-600/20 text-orange-100 border border-orange-500/40 border-l-orange-500'
                  : 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/40 border-l-cyan-500'
              }`}
            >
              <p className={`text-xs font-mono mb-1.5 font-semibold ${
                message.speaker === 'user' ? 'text-orange-400' : 'text-cyan-400'
              }`}>
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
