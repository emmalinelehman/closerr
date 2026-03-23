'use client';

interface BargeInIndicatorProps {
  isActive: boolean;
}

export default function BargeInIndicator({ isActive }: BargeInIndicatorProps) {
  return (
    <div className="mt-6 text-center">
      <div
        className={`inline-block px-4 py-2 rounded-full border font-mono text-xs tracking-wide transition-all duration-300 ${
          isActive
            ? 'border-orange-500 bg-orange-500/20 text-orange-300'
            : 'border-slate-600 bg-slate-800/40 text-slate-400'
        }`}
      >
        {isActive ? '🎙️ Mic Active - Barge-In Ready' : 'Listening...'}
      </div>
    </div>
  );
}
