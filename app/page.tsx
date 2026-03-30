'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrendingUp, Zap, BadgeDollarSign, ArrowRight } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const PERSONAS: Persona[] = [
  {
    id: 'skeptical-cfo',
    name: 'SKEPTICAL CFO',
    title: 'Financial Rigor',
    description: 'Demands hard ROI metrics and dismisses emotional appeals. Master financial objection handling.',
    icon: <TrendingUp className="w-12 h-12" />,
  },
  {
    id: 'busy-founder',
    name: 'BUSY FOUNDER',
    title: 'High Velocity',
    description: 'Fast-paced, no small talk. Expects direct answers and bottom-line value propositions.',
    icon: <Zap className="w-12 h-12" />,
  },
  {
    id: 'price-sensitive',
    name: 'SMB OWNER',
    title: 'Budget Conscious',
    description: 'Cost-focused and concerned about immediate overhead impact. Navigate pricing objections.',
    icon: <BadgeDollarSign className="w-12 h-12" />,
  },
];

const gridPattern = `
  radial-gradient(circle, #000000 1px, transparent 1px)
`;

export default function Home() {
  const router = useRouter();
  const [selectedBuyer, setSelectedBuyer] = useState<string | null>(null);
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null);

  const handleStartSimulation = () => {
    if (selectedBuyer) {
      router.push(`/simulation/${selectedBuyer}`);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#FAFAFA] text-[#000000] font-sans overflow-x-hidden"
      style={{
        backgroundColor: '#FAFAFA',
        color: '#000000',
        backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
    >
      {/* MARQUEE TICKER */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .marquee-scroll {
          animation: scroll 15s linear infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>

      <div className="border-b-4 border-t-4 border-[#000000] bg-[#FF2A85] py-3 overflow-hidden">
        <div className="flex marquee-scroll whitespace-nowrap">
          <div className="text-black font-mono font-bold tracking-widest text-lg px-8">
            • NO MORE EXCUSES • CLOSE MORE DEALS • CRUSH YOUR QUOTA • MASTER THE PITCH • NO MORE EXCUSES • CLOSE MORE DEALS • CRUSH YOUR QUOTA • MASTER THE PITCH •
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="border-b-4 border-[#000000] py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-2xl md:text-3xl font-bold tracking-tighter uppercase font-serif" style={{ letterSpacing: '-0.02em' }}>
            CLOSERR
          </div>
        </div>
      </nav>

      {/* HERO SECTION WITH STICKER */}
      <section className="border-b-4 border-[#000000] py-12 md:py-24 px-8 relative">
        {/* Spinning Sticker */}
        <div
          className="absolute top-8 right-8 border-4 border-[#000000] w-24 h-24 md:w-32 md:h-32 flex items-center justify-center spin-slow"
          style={{
            backgroundColor: '#FFD700',
            boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
          }}
        >
          <div className="text-center font-serif font-black text-xs md:text-sm tracking-tighter">
            100%<br />AI
          </div>
        </div>

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
              SELL<br />
              <span style={{ fontStyle: 'italic' }}>HARDER</span>
            </h1>
            <p className="text-lg md:text-xl font-medium mb-8 max-w-md leading-tight">
              Practice against realistic AI buyers. Get real-time feedback. Crush your closes.
            </p>
          </div>

          {/* Right: Circuit Board Image */}
          <div className="hidden md:flex items-center justify-center">
            <div className="border-4 border-[#000000] w-full aspect-square overflow-hidden" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
              <Image
                src="/circuitbw.jpg"
                alt="Circuit board AI"
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BUYER SELECTION - EQUAL SIZE GRID */}
      <section className="border-b-4 border-[#000000] py-12 md:py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12" style={{ letterSpacing: '-0.02em' }}>
            CHOOSE YOUR BUYER
          </h2>

          {/* Equal-size 3-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {PERSONAS.map((persona, idx) => (
              <div
                key={persona.id}
                onClick={() => setSelectedBuyer(persona.id)}
                onMouseEnter={() => setHoveredPersona(persona.id)}
                onMouseLeave={() => setHoveredPersona(null)}
                className="border-4 border-[#000000] p-8 cursor-pointer transition-all duration-150"
                style={{
                  backgroundColor: selectedBuyer === persona.id ? '#000000' : '#FAFAFA',
                  color: selectedBuyer === persona.id ? '#FAFAFA' : '#000000',
                  boxShadow: selectedBuyer === persona.id || hoveredPersona === persona.id ? '8px 8px 0px 0px rgba(0,0,0,1)' : 'none',
                  transform: hoveredPersona === persona.id && selectedBuyer !== persona.id ? 'translate(-4px, -4px)' : 'translate(0, 0)',
                }}
              >
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="text-5xl mb-4" style={{ color: selectedBuyer === persona.id ? '#FAFAFA' : '#000000' }}>
                    {persona.icon}
                  </div>
                  <h3 className="font-serif text-2xl font-black uppercase tracking-tight mb-2" style={{ letterSpacing: '-0.01em' }}>
                    {persona.name}
                  </h3>
                  <p className="font-mono text-xs uppercase font-bold tracking-wider" style={{ color: selectedBuyer === persona.id ? '#FAFAFA' : '#000000' }}>
                    {persona.title}
                  </p>
                </div>
                <p className="text-sm leading-tight text-center mb-4">
                  {persona.description}
                </p>
                {selectedBuyer === persona.id && (
                  <div className="text-center border-t-2 border-current pt-3">
                    <div className="font-mono text-xs uppercase font-bold tracking-widest">✓ SELECTED</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* START PITCH Button - Below Grid */}
          <div className="flex justify-center">
            <button
              onClick={handleStartSimulation}
              disabled={!selectedBuyer}
              className="border-4 border-[#000000] font-serif font-black text-2xl uppercase px-12 py-8 transition-all duration-150 flex items-center gap-4"
              style={{
                backgroundColor: selectedBuyer ? '#FF2A85' : '#CCCCCC',
                color: selectedBuyer ? '#FAFAFA' : '#999999',
                boxShadow: selectedBuyer ? '8px 8px 0px 0px rgba(0,0,0,1)' : 'none',
                cursor: selectedBuyer ? 'pointer' : 'not-allowed',
              }}
              onMouseDown={(e) => {
                if (selectedBuyer) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(8px, 8px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }
              }}
              onMouseUp={(e) => {
                if (selectedBuyer) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedBuyer) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
                }
              }}
            >
              START PITCH
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* WHY CLOSERR WINS - 3 COLORED BOXES */}
      <section className="border-b-4 border-[#000000] py-12 md:py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12" style={{ letterSpacing: '-0.02em' }}>
            WHY CLOSERR WINS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 - Hot Pink */}
            <div className="border-4 border-[#000000] p-8" style={{ backgroundColor: '#FF2A85', color: '#FAFAFA', boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
              <h3 className="font-serif text-2xl font-black uppercase mb-4" style={{ letterSpacing: '-0.01em' }}>
                REAL-TIME METRICS
              </h3>
              <p className="text-sm leading-tight">
                Track talk ratio, pacing, empathy, and objection handling. Every second counts.
              </p>
            </div>

            {/* Feature 2 - Electric Cyan */}
            <div className="border-4 border-[#000000] p-8" style={{ backgroundColor: '#00E5FF', color: '#000000', boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
              <h3 className="font-serif text-2xl font-black uppercase mb-4" style={{ letterSpacing: '-0.01em' }}>
                AI COACHING
              </h3>
              <p className="text-sm leading-tight">
                Get personalized feedback powered by the same AI that beats top closers.
              </p>
            </div>

            {/* Feature 3 - Bold Orange */}
            <div className="border-4 border-[#000000] p-8" style={{ backgroundColor: '#FF5E00', color: '#FAFAFA', boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
              <h3 className="font-serif text-2xl font-black uppercase mb-4" style={{ letterSpacing: '-0.01em' }}>
                REALISTIC BUYERS
              </h3>
              <p className="text-sm leading-tight">
                Three distinct personas that respond naturally to your actual sales approach.
              </p>
            </div>
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
