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
    <div className="h-full w-full flex flex-col overflow-y-auto rounded-lg border border-gray-300 bg-gray-50 p-4 scroll-smooth">
      <div ref={scrollRef} className="flex flex-col space-y-3">
        {messages.map((message, idx) => (
          <div key={idx} className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs sm:max-w-sm px-4 py-3 rounded-lg text-xs sm:text-sm leading-relaxed break-words border border-l-2 ${
                message.speaker === 'user'
                  ? 'bg-gray-100 text-gray-900 border-gray-300 border-l-gray-600'
                  : 'bg-white text-gray-900 border-gray-300 border-l-gray-600'
              }`}
            >
              <p className={`text-xs font-mono mb-1.5 font-semibold ${
                message.speaker === 'user' ? 'text-gray-700' : 'text-gray-600'
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
