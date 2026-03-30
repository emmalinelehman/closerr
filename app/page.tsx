'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }

  .section-fade-in {
    animation: fadeInUp 0.8s ease-out;
  }

  .stagger-1 {
    animation-delay: 0.1s;
  }

  .stagger-2 {
    animation-delay: 0.2s;
  }

  .stagger-3 {
    animation-delay: 0.3s;
  }

  .persona-card {
    transition: all 0.3s ease;
  }

  .persona-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 30px rgba(255, 255, 0, 0.7), 0 12px 24px rgba(0, 0, 0, 0.08);
    border-color: #FFFF00 !important;
    border-width: 2px;
  }

  .benefit-card {
    transition: all 0.3s ease;
  }

  .benefit-card:hover {
    transform: translateY(-2px);
  }

  .button-hover {
    transition: all 0.2s ease;
  }

  .button-hover:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  .button-hover:not(:disabled):active {
    transform: translateY(0);
  }

  .button-hover:not(:disabled):hover {
    box-shadow: 0 0 30px rgba(255, 255, 0, 0.7) !important;
    border-color: #FFFF00 !important;
  }
`;

interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'skeptical-cfo',
    name: 'SKEPTICAL CFO',
    title: 'Financial Rigor',
    description: 'Demands hard ROI metrics and dismisses emotional appeals. Master financial objection handling.',
  },
  {
    id: 'busy-founder',
    name: 'BUSY FOUNDER',
    title: 'High Velocity',
    description: 'Fast-paced, no small talk. Expects direct answers and bottom-line value propositions.',
  },
  {
    id: 'price-sensitive',
    name: 'SMB OWNER',
    title: 'Budget Conscious',
    description: 'Cost-focused and concerned about immediate overhead impact. Navigate pricing objections.',
  },
];

export default function Home() {
  const router = useRouter();
  const [selectedBuyer, setSelectedBuyer] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navScale = Math.max(0.6, 1 - scrollY / 500);
  const navPadding = Math.max(4, 8 - scrollY / 200);

  const handleStartSimulation = () => {
    if (selectedBuyer) {
      router.push(`/simulation/${selectedBuyer}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <style>{animationStyles}</style>
      {/* NAVIGATION */}
      <nav
        className="border-b border-gray-300 px-8 md:px-12 fixed top-0 left-0 right-0 bg-white z-50 transition-all duration-300"
        style={{
          padding: `${navPadding}px 2rem`,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className="font-serif font-bold transition-all duration-300"
            style={{
              fontSize: `clamp(1rem, ${3 * navScale}vw, ${2 * navScale}rem)`,
              transform: `scale(${navScale})`,
              transformOrigin: 'left',
            }}
          >
            CLOSERR
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed nav */}
      <div style={{ height: `${navPadding * 2}px` }}></div>

      {/* HERO SECTION */}
      <section
        className="border-b border-gray-300 h-screen px-8 md:px-12 relative animate-fade-in flex items-center mt-16"
        style={{
          backgroundImage: 'url(/barbs.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="w-full relative z-10">
          <div className="max-w-2xl">
            <h1
              className="font-serif font-bold leading-tight tracking-tight mb-0"
              style={{
                fontSize: 'clamp(4rem, 20vw, 12rem)',
                lineHeight: '0.9',
                color: '#FFFFFF',
              }}
            >
              SELL<br />
              <span style={{ fontStyle: 'italic' }}>HARDER</span>
            </h1>
          </div>
        </div>
      </section>

      {/* BUYER SELECTION */}
      <section className="border-b border-gray-300 py-32 md:py-40 px-8 md:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-tight mb-20" style={{ letterSpacing: '-0.01em' }}>
            Choose Your Buyer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {PERSONAS.map((persona, idx) => (
              <div
                key={persona.id}
                onClick={() => setSelectedBuyer(persona.id)}
                className={`border border-gray-300 p-10 cursor-pointer animate-fade-in-up persona-card ${idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : 'stagger-3'}`}
                style={{
                  backgroundColor: selectedBuyer === persona.id ? '#000000' : '#FFFFFF',
                  color: selectedBuyer === persona.id ? '#FFFFFF' : '#000000',
                }}
              >
                <h3 className="font-serif text-2xl font-bold uppercase tracking-tight mb-2" style={{ letterSpacing: '-0.01em' }}>
                  {persona.name}
                </h3>
                <p className="text-sm font-semibold text-gray-600 mb-4" style={{ color: selectedBuyer === persona.id ? '#BDBDBD' : '#757575' }}>
                  {persona.title}
                </p>
                <p className="text-base leading-relaxed mb-6" style={{ color: selectedBuyer === persona.id ? '#E0E0E0' : '#424242' }}>
                  {persona.description}
                </p>
                {selectedBuyer === persona.id && (
                  <div className="text-sm font-semibold">✓ SELECTED</div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleStartSimulation}
              disabled={!selectedBuyer}
              className="px-16 py-6 border-2 border-gray-400 font-serif font-bold text-xl uppercase flex items-center gap-3 button-hover"
              style={{
                backgroundColor: selectedBuyer ? '#000000' : '#F5F5F5',
                color: selectedBuyer ? '#FFFFFF' : '#BDBDBD',
                cursor: selectedBuyer ? 'pointer' : 'not-allowed',
              }}
            >
              BEGIN TRAINING
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* WHY CLOSERR WORKS */}
      <section
        className="border-b border-gray-300 py-32 md:py-40 px-8 md:px-12 relative"
        style={{
          backgroundImage: 'url(/ripple.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="bg-white border border-gray-300 p-12 md:p-20 animate-fade-in-up">
            <h2 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4 text-center" style={{ letterSpacing: '-0.01em' }}>
              Why Closerr Works
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-16 text-center max-w-full mx-auto">Practice against realistic AI buyers. Get real-time feedback. Crush your closes.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="animate-fade-in-up stagger-1 benefit-card py-2">
                <h3 className="font-serif text-lg font-bold text-black mb-3">Real-Time Feedback</h3>
                <p className="text-sm leading-relaxed text-gray-700">
                  Track talk ratio, pacing, empathy, and objection handling. Every word counts.
                </p>
              </div>

              <div className="animate-fade-in-up stagger-2 benefit-card py-2">
                <h3 className="font-serif text-lg font-bold text-black mb-3">AI Coaching</h3>
                <p className="text-sm leading-relaxed text-gray-700">
                  Get personalized feedback powered by the same AI that beats top closers.
                </p>
              </div>

              <div className="animate-fade-in-up stagger-3 benefit-card py-2">
                <h3 className="font-serif text-lg font-bold text-black mb-3">Realistic Buyers</h3>
                <p className="text-sm leading-relaxed text-gray-700">
                  Three distinct personas that respond naturally to your actual sales approach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-300 py-16 px-8 md:px-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600 font-semibold tracking-wide">
          CLOSERR © 2024 | AI SALES TRAINING
        </div>
      </footer>
    </div>
  );
}
