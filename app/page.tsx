'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Zap, BadgeDollarSign, Sparkles } from 'lucide-react';

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
    name: 'The Skeptical CFO',
    title: 'Financial Rigor',
    description: 'Demands hard ROI metrics and dismisses emotional appeals. Master financial objection handling.',
    icon: <TrendingUp className="w-8 h-8" />,
  },
  {
    id: 'busy-founder',
    name: 'The Busy Founder',
    title: 'High Velocity',
    description: 'Fast-paced, no small talk. Expects direct answers and bottom-line value propositions.',
    icon: <Zap className="w-8 h-8" />,
  },
  {
    id: 'price-sensitive',
    name: 'SMB Owner',
    title: 'Budget Conscious',
    description: 'Cost-focused and concerned about immediate overhead impact. Navigate pricing objections.',
    icon: <BadgeDollarSign className="w-8 h-8" />,
  },
];

export default function Home() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const handleStartSimulation = () => {
    if (selectedPersona) {
      router.push(`/simulation/${selectedPersona}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-24 sm:py-40">
        <div className="text-center max-w-3xl">
          {/* Top Badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/5">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-400">AI-Powered Sales Training</span>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl sm:text-8xl font-bold mb-6 tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Closerr
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-slate-300 mb-3 font-medium">
            Master Sales Conversations with AI
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl">
            Practice objection handling against realistic buyer personas. Get detailed performance metrics and level up your closing rate.
          </p>
        </div>

        {/* Hero Glow Line */}
        <div className="mt-12 h-1 w-32 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full opacity-60" />
      </section>

      {/* Persona Selection Section */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-14">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Select Target Persona</h2>
          <p className="text-base text-slate-400 max-w-2xl">
            Each buyer profile presents distinct objection types and decision criteria. Choose one to begin your training module.
          </p>
        </div>

        {/* Persona Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {PERSONAS.map((persona) => {
            const isSelected = selectedPersona === persona.id;
            return (
              <Card
                key={persona.id}
                onClick={() => setSelectedPersona(persona.id)}
                className={`group relative p-8 cursor-pointer transition-all duration-300 border rounded-lg overflow-hidden ${
                  isSelected
                    ? 'border-orange-500 bg-slate-900 text-white'
                    : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60'
                }`}
                style={
                  isSelected
                    ? { boxShadow: '0 0 24px rgba(249, 115, 22, 0.25)' }
                    : {}
                }
              >
                {/* Background Gradient (on hover for unselected, always for selected) */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                )}

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`mb-5 inline-flex p-3 rounded-lg ${
                      isSelected
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-300'
                    } transition-all duration-300`}
                  >
                    {persona.icon}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className={`text-xl font-bold mb-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {persona.name}
                  </h3>
                  <p
                    className={`text-xs font-semibold mb-4 ${
                      isSelected ? 'text-orange-400' : 'text-slate-500'
                    }`}
                  >
                    {persona.title.toUpperCase()}
                  </p>

                  {/* Description */}
                  <p
                    className={`text-sm leading-relaxed mb-5 ${
                      isSelected ? 'text-slate-200' : 'text-slate-400'
                    }`}
                  >
                    {persona.description}
                  </p>

                  {/* Selected Badge */}
                  {isSelected && (
                    <Badge className="bg-orange-600 text-white hover:bg-orange-700 border-0">
                      <Zap className="w-3 h-3 mr-1.5" />
                      Selected
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center gap-6">
          <Button
            onClick={handleStartSimulation}
            disabled={!selectedPersona}
            size="lg"
            className={`px-10 py-6 text-base font-semibold transition-all duration-300 flex items-center gap-2 ${
              selectedPersona
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/40 hover:shadow-orange-600/60'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Start Training
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-sm text-slate-500">
            {selectedPersona
              ? '⚡ Ready to begin'
              : 'Select a persona to continue'}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-24 py-8 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            Closerr • Premium AI Sales Training • v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
