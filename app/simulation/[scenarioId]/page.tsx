'use client';

import { useParams } from 'next/navigation';
import VoiceInterface from '@/components/simulation/VoiceInterface';

const PERSONA_MAP: Record<string, { name: string; title: string; productBrief: { company: string; product: string; pricing: string; implementation: string; results: string; audience: string } }> = {
  'skeptical-cfo': {
    name: 'The Skeptical CFO',
    title: 'Financial Rigor',
    productBrief: {
      company: '150-person B2B SaaS startup',
      product: 'AI personas for sales training—lets reps practice negotiations without clients',
      pricing: '$5k/month per team seat',
      implementation: '2-week implementation, 3-month contract minimum',
      results: '35% higher close rates (case studies) after 60 days',
      audience: 'Enterprise sales teams (10+ reps)',
    },
  },
  'busy-founder': {
    name: 'The Busy Founder',
    title: 'High Velocity',
    productBrief: {
      company: '150-person B2B SaaS startup',
      product: 'AI personas for sales training—lets reps practice negotiations without clients',
      pricing: '$5k/month per team seat',
      implementation: '2-week implementation, 3-month contract minimum',
      results: '35% higher close rates (case studies) after 60 days',
      audience: 'Enterprise sales teams (10+ reps)',
    },
  },
  'price-sensitive': {
    name: 'SMB Owner',
    title: 'Budget Conscious',
    productBrief: {
      company: '150-person B2B SaaS startup',
      product: 'AI personas for sales training—lets reps practice negotiations without clients',
      pricing: '$5k/month per team seat',
      implementation: '2-week implementation, 3-month contract minimum',
      results: '35% higher close rates (case studies) after 60 days',
      audience: 'Enterprise sales teams (10+ reps)',
    },
  },
};

export default function SimulationPage() {
  const params = useParams();
  const scenarioId = params.scenarioId as string;
  const persona = PERSONA_MAP[scenarioId];

  if (!persona) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Persona Not Found</h1>
          <p className="text-slate-400">The selected persona could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <VoiceInterface
      personaId={scenarioId}
      personaName={persona.name}
      personaTitle={persona.title}
      productBrief={persona.productBrief}
    />
  );
}
