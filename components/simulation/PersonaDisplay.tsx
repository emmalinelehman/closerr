'use client';

interface PersonaDisplayProps {
  name: string;
  title: string;
}

export default function PersonaDisplay({ name, title }: PersonaDisplayProps) {
  return (
    <div className="text-center mb-8 sm:mb-10 pb-6 border-b-2 border-b-cyan-500/30">
      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neutral-50 via-cyan-300 to-neutral-50 bg-clip-text text-transparent mb-2 sm:mb-3">{name}</h2>
      <p className="text-xs sm:text-sm font-mono text-orange-500 uppercase tracking-wider font-semibold mb-2">{title}</p>
      <div className="flex items-center justify-center gap-2">
        <div className="h-1 w-1 rounded-full bg-emerald-400"></div>
        <p className="text-xs text-neutral-400">Active Buyer Persona</p>
        <div className="h-1 w-1 rounded-full bg-pink-400"></div>
      </div>
    </div>
  );
}
