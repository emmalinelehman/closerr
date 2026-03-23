'use client';

interface PersonaDisplayProps {
  name: string;
  title: string;
}

export default function PersonaDisplay({ name, title }: PersonaDisplayProps) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
      <p className="text-sm font-mono text-orange-400 uppercase tracking-wide">{title}</p>
      <p className="text-xs text-slate-500 mt-3">Active Buyer Persona</p>
    </div>
  );
}
