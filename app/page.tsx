'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Zap, BadgeDollarSign, ArrowRight } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: 'cyan' | 'orange' | 'pink';
}

const PERSONAS: Persona[] = [
  {
    id: 'skeptical-cfo',
    name: 'SKEPTICAL CFO',
    title: 'Financial Rigor',
    description: 'Demands hard ROI metrics and dismisses emotional appeals. Master financial objection handling.',
    icon: <TrendingUp className="w-12 h-12" />,
    accentColor: 'cyan',
  },
  {
    id: 'busy-founder',
    name: 'BUSY FOUNDER',
    title: 'High Velocity',
    description: 'Fast-paced, no small talk. Expects direct answers and bottom-line value propositions.',
    icon: <Zap className="w-12 h-12" />,
    accentColor: 'orange',
  },
  {
    id: 'price-sensitive',
    name: 'SMB OWNER',
    title: 'Budget Conscious',
    description: 'Cost-focused and concerned about immediate overhead impact. Navigate pricing objections.',
    icon: <BadgeDollarSign className="w-12 h-12" />,
    accentColor: 'pink',
  },
];

const getAccentClasses = (color: 'cyan' | 'orange' | 'pink') => {
  switch (color) {
    case 'cyan':
      return { bg: 'bg-[#00E5FF]', text: 'text-[#00E5FF]', style: { backgroundColor: '#00E5FF' } };
    case 'orange':
      return { bg: 'bg-[#FF5E00]', text: 'text-[#FF5E00]', style: { backgroundColor: '#FF5E00' } };
    case 'pink':
      return { bg: 'bg-[#FF2A85]', text: 'text-[#FF2A85]', style: { backgroundColor: '#FF2A85' } };
  }
};

export default function Home() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null);

  const handleStartSimulation = () => {
    if (selectedPersona) {
      router.push(`/simulation/${selectedPersona}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#000000] font-sans" style={{ backgroundColor: '#FAFAFA', color: '#000000' }}>
      {/* NAVIGATION */}
      <nav className="border-b-4 border-[#000000] py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-2xl md:text-3xl font-bold tracking-tighter uppercase font-serif" style={{ letterSpacing: '-0.02em' }}>
            CLOSERR
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="border-b-4 border-[#000000] py-12 md:py-24 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Massive Headline */}
          <div className="flex flex-col justify-center">
            <h1
              className="font-serif font-black tracking-tighter uppercase leading-none mb-6"
              style={{
                fontSize: 'clamp(3rem, 12vw, 8rem)',
                lineHeight: '0.95',
                letterSpacing: '-0.02em',
              }}
            >
              SELL<br />HARDER
            </h1>
            <p className="text-lg md:text-xl font-medium mb-8 max-w-md leading-tight">
              Practice against realistic AI buyers. Get real-time feedback. Crush your closes.
            </p>

            {/* CTA Button - Massive Hot Pink */}
            <button
              onClick={handleStartSimulation}
              disabled={!selectedPersona}
              className="border-4 border-[#000000] w-full md:w-auto font-serif font-black text-lg uppercase px-8 py-6 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: selectedPersona ? '#FF2A85' : '#FAFAFA',
                color: selectedPersona ? '#FAFAFA' : '#000000',
                boxShadow: selectedPersona ? '8px 8px 0px 0px rgba(0,0,0,1)' : 'none',
              }}
              onMouseDown={(e) => {
                if (selectedPersona) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(8px, 8px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }
              }}
              onMouseUp={(e) => {
                if (selectedPersona) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPersona) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
                }
              }}
            >
              {selectedPersona ? 'START SIMULATOR' : 'SELECT A PERSONA'}
            </button>
          </div>

          {/* Right: Visual Element */}
          <div className="hidden md:flex items-center justify-center">
            <div className="border-4 border-[#000000] w-full aspect-square flex items-center justify-center bg-[#FAFAFA]" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
              <div className="text-6xl font-bold opacity-10">AI</div>
            </div>
          </div>
        </div>
      </section>

      {/* PERSONA DOSSIERS - BENTO BOX LAYOUT */}
      <section className="border-b-4 border-[#000000] py-12 md:py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12" style={{ letterSpacing: '-0.02em' }}>
            CHOOSE YOUR OPPONENT
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card 1 - CYAN - Large */}
            <div
              className="md:col-span-6 border-4 border-[#000000] p-8 md:p-12 cursor-pointer transition-all duration-150"
              onClick={() => setSelectedPersona(PERSONAS[0].id)}
              onMouseEnter={() => setHoveredPersona(PERSONAS[0].id)}
              onMouseLeave={() => setHoveredPersona(null)}
              style={{
                backgroundColor: selectedPersona === PERSONAS[0].id ? '#00E5FF' : '#FAFAFA',
                boxShadow: selectedPersona === PERSONAS[0].id || hoveredPersona === PERSONAS[0].id ? '8px 8px 0px 0px rgba(0,0,0,1)' : 'none',
                transform: hoveredPersona === PERSONAS[0].id && selectedPersona !== PERSONAS[0].id ? 'translate(-4px, -4px)' : 'translate(0, 0)',
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl font-black uppercase tracking-tight mb-1" style={{ letterSpacing: '-0.01em' }}>
                    {PERSONAS[0].name}
                  </h3>
                  <p className="font-mono text-sm uppercase font-bold tracking-wider">
                    {PERSONAS[0].title}
                  </p>
                </div>
                <div className="text-4xl md:text-5xl" style={{ color: selectedPersona === PERSONAS[0].id ? '#FAFAFA' : '#000000' }}>
                  {PERSONAS[0].icon}
                </div>
              </div>
              <p className={`text-base leading-tight ${selectedPersona === PERSONAS[0].id ? 'text-[#FAFAFA]' : 'text-[#000000]'}`}>
                {PERSONAS[0].description}
              </p>
              {selectedPersona === PERSONAS[0].id && (
                <div className="mt-6 border-t-2 border-current pt-4">
                  <div className="font-mono text-xs uppercase font-bold tracking-widest">✓ SELECTED</div>
                </div>
              )}
            </div>

            {/* Card 2 - ORANGE - Medium */}
            <div
              className="md:col-span-3 border-4 border-[#000000] p-8 cursor-pointer transition-all duration-150"
              onClick={() => setSelectedPersona(PERSONAS[1].id)}
              onMouseEnter={() => setHoveredPersona(PERSONAS[1].id)}
              onMouseLeave={() => setHoveredPersona(null)}
              style={{
                backgroundColor: selectedPersona === PERSONAS[1].id ? '#FF5E00' : '#FAFAFA',
                boxShadow: selectedPersona === PERSONAS[1].id || hoveredPersona === PERSONAS[1].id ? '8px 8px 0px 0px rgba(0,0,0,1)' : 'none',
                transform: hoveredPersona === PERSONAS[1].id && selectedPersona !== PERSONAS[1].id ? 'translate(-4px, -4px)' : 'translate(0, 0)',
              }}
            >
              <div className="flex flex-col items-center text-center mb-4">
                <div className="text-4xl mb-3" style={{ color: selectedPersona === PERSONAS[1].id ? '#FAFAFA' : '#000000' }}>
                  {PERSONAS[1].icon}
                </div>
                <h3 className="font-serif text-xl font-black uppercase tracking-tight" style={{ letterSpacing: '-0.01em', color: selectedPersona === PERSONAS[1].id ? '#FAFAFA' : '#000000' }}>
                  {PERSONAS[1].name}
                </h3>
                <p className="font-mono text-xs uppercase font-bold tracking-wider mt-2" style={{ color: selectedPersona === PERSONAS[1].id ? '#FAFAFA' : '#000000' }}>
                  {PERSONAS[1].title}
                </p>
              </div>
              <p className={`text-sm leading-tight text-center ${selectedPersona === PERSONAS[1].id ? 'text-[#FAFAFA]' : 'text-[#000000]'}`}>
                {PERSONAS[1].description}
              </p>
              {selectedPersona === PERSONAS[1].id && (
                <div className="mt-4 text-center border-t-2 border-current pt-3">
                  <div className="font-mono text-xs uppercase font-bold tracking-widest">✓ SELECTED</div>
                </div>
              )}
            </div>

            {/* Card 3 - PINK - Medium */}
            <div
              className="md:col-span-3 border-4 border-[#000000] p-8 cursor-pointer transition-all duration-150"
              onClick={() => setSelectedPersona(PERSONAS[2].id)}
              onMouseEnter={() => setHoveredPersona(PERSONAS[2].id)}
              onMouseLeave={() => setHoveredPersona(null)}
              style={{
                backgroundColor: selectedPersona === PERSONAS[2].id ? '#FF2A85' : '#FAFAFA',
                boxShadow: selectedPersona === PERSONAS[2].id || hoveredPersona === PERSONAS[2].id ? '8px 8px 0px 0px rgba(0,0,0,1)' : 'none',
                transform: hoveredPersona === PERSONAS[2].id && selectedPersona !== PERSONAS[2].id ? 'translate(-4px, -4px)' : 'translate(0, 0)',
              }}
            >
              <div className="flex flex-col items-center text-center mb-4">
                <div className="text-4xl mb-3" style={{ color: selectedPersona === PERSONAS[2].id ? '#FAFAFA' : '#000000' }}>
                  {PERSONAS[2].icon}
                </div>
                <h3 className="font-serif text-xl font-black uppercase tracking-tight" style={{ letterSpacing: '-0.01em', color: selectedPersona === PERSONAS[2].id ? '#FAFAFA' : '#000000' }}>
                  {PERSONAS[2].name}
                </h3>
                <p className="font-mono text-xs uppercase font-bold tracking-wider mt-2" style={{ color: selectedPersona === PERSONAS[2].id ? '#FAFAFA' : '#000000' }}>
                  {PERSONAS[2].title}
                </p>
              </div>
              <p className={`text-sm leading-tight text-center ${selectedPersona === PERSONAS[2].id ? 'text-[#FAFAFA]' : 'text-[#000000]'}`}>
                {PERSONAS[2].description}
              </p>
              {selectedPersona === PERSONAS[2].id && (
                <div className="mt-4 text-center border-t-2 border-current pt-3">
                  <div className="font-mono text-xs uppercase font-bold tracking-widest">✓ SELECTED</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION - Magazine Spread */}
      <section className="border-b-4 border-[#000000] py-12 md:py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12" style={{ letterSpacing: '-0.02em' }}>
            WHY CLOSERR WINS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="border-4 border-[#000000] p-8" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
              <h3 className="font-serif text-2xl font-black uppercase mb-3" style={{ letterSpacing: '-0.01em' }}>
                REAL-TIME METRICS
              </h3>
              <p className="text-sm leading-tight">
                Track talk ratio, pacing, empathy, and objection handling. Every second counts.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="border-4 border-[#000000] p-8"
              style={{ backgroundColor: '#00E5FF', boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
            >
              <h3 className="font-serif text-2xl font-black uppercase mb-3" style={{ letterSpacing: '-0.01em' }}>
                AI COACHING
              </h3>
              <p className="text-sm leading-tight">
                Get personalized feedback powered by the same AI that beats top closers.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="border-4 border-[#000000] p-8"
              style={{ backgroundColor: '#FF5E00', boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
            >
              <h3 className="font-serif text-2xl font-black uppercase mb-3" style={{ letterSpacing: '-0.01em' }}>
                REALISTIC BUYERS
              </h3>
              <p className="text-sm leading-tight">
                Three distinct personas that respond naturally to your actual sales approach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-12 md:py-24 px-8">
        <div className="max-w-7xl mx-auto border-4 border-[#000000] p-12 md:p-16" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
          <div className="text-center">
            <h2 className="font-serif text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6" style={{ letterSpacing: '-0.02em' }}>
              TIME TO TRAIN
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Stop practicing with colleagues who go easy on you. Start practicing with AI that doesn't.
            </p>

            <button
              onClick={handleStartSimulation}
              disabled={!selectedPersona}
              className="border-4 border-[#000000] font-serif font-black text-lg uppercase px-12 py-8 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-4"
              style={{
                backgroundColor: selectedPersona ? '#FF2A85' : '#FAFAFA',
                color: selectedPersona ? '#FAFAFA' : '#000000',
                boxShadow: selectedPersona ? '8px 8px 0px 0px rgba(0,0,0,1)' : 'none',
              }}
              onMouseDown={(e) => {
                if (selectedPersona) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(8px, 8px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }
              }}
              onMouseUp={(e) => {
                if (selectedPersona) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPersona) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
                }
              }}
            >
              {selectedPersona ? 'LET\'S GO' : 'SELECT A PERSONA FIRST'}
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-4 border-[#000000] py-8 px-8">
        <div className="max-w-7xl mx-auto text-center font-mono text-xs uppercase font-bold tracking-widest">
          CLOSERR © 2024 | AI SALES TRAINING
        </div>
      </footer>
    </div>
  );
}
