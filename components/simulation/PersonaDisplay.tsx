'use client';

interface PersonaDisplayProps {
  name: string;
  title: string;
}

export default function PersonaDisplay({ name, title }: PersonaDisplayProps) {
  return (
    <div className="text-center mb-8 sm:mb-10 pb-6 border-b border-gray-300">
      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black mb-2 sm:mb-3">{name}</h2>
      <p className="text-xs sm:text-sm font-mono text-gray-700 uppercase tracking-wider font-semibold mb-2">{title}</p>
      <div className="flex items-center justify-center gap-2">
        <div className="h-1 w-1 rounded-full bg-gray-500"></div>
        <p className="text-xs text-gray-600">Active Buyer Persona</p>
        <div className="h-1 w-1 rounded-full bg-gray-500"></div>
      </div>
    </div>
  );
}
