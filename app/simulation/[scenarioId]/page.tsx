'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import VoiceInterface from '@/components/simulation/VoiceInterface';
import { Product, getAllProducts } from '@/lib/config/productSchema';

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

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customProduct, setCustomProduct] = useState({
    name: '',
    category: '',
    pricingCost: '',
    implementationTime: '',
    keyBenefits: '',
  });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [readyToStart, setReadyToStart] = useState(false);

  if (!persona) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold uppercase mb-4">Persona Not Found</h1>
          <p className="text-gray-600 font-mono text-sm">The selected persona could not be loaded.</p>
        </div>
      </div>
    );
  }

  // If ready to start, show the VoiceInterface
  if (readyToStart && selectedProduct) {
    return (
      <VoiceInterface
        personaId={scenarioId}
        personaName={persona.name}
        personaTitle={persona.title}
        productBrief={persona.productBrief}
        product={selectedProduct}
      />
    );
  }

  // Product selector UI
  const defaultProducts = getAllProducts();

  const handleCustomSubmit = () => {
    if (!customProduct.name || !customProduct.category || !customProduct.pricingCost) {
      alert('Please fill in product name, category, and pricing');
      return;
    }

    const benefits = customProduct.keyBenefits.split('\n').filter(b => b.trim());
    if (benefits.length === 0) {
      alert('Please add at least one key benefit');
      return;
    }

    const newProduct: Product = {
      id: `custom-${Date.now()}`,
      name: customProduct.name,
      category: customProduct.category,
      description: `${customProduct.name} - A ${customProduct.category} solution for modern teams.`,
      targetRole: 'Operations',
      keyBenefits: benefits,
      pricingModel: 'Custom',
      pricingCost: customProduct.pricingCost,
      implementationTime: customProduct.implementationTime || '2-3 weeks',
      naturalConcerns: [
        'Will this integrate with our existing tools?',
        'What is the total cost of ownership?',
        'How long will implementation take?',
        'Do you have references from companies like ours?',
      ],
      successMetrics: [
        'Time savings',
        'Cost reduction',
        'Improved efficiency',
        'Team adoption rate',
      ],
    };

    setSelectedProduct(newProduct);
    setReadyToStart(true);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tighter" style={{ letterSpacing: '-0.02em' }}>
            PREPARE FOR CALL
          </h1>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8 md:items-stretch">
          {/* Left Column: Persona Context (Sticky) */}
          <div className="md:w-2/5 flex flex-col">
            <div className="md:sticky md:top-8 border-4 border-black p-6 bg-white h-full" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)' }}>
              {/* Persona Profile */}
              <div>
                <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-3">Persona Profile</p>
                <h2 className="font-serif text-2xl font-black uppercase tracking-tighter mb-1" style={{ letterSpacing: '-0.02em' }}>
                  {persona.name}
                </h2>
                <p className="font-mono text-xs uppercase tracking-wider text-gray-500 mb-6">{persona.title}</p>
              </div>

              {/* Context Information */}
              <div className="mt-6 space-y-3">
                <div>
                  <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Company</p>
                  <p className="text-sm">{persona.productBrief.company}</p>
                </div>
                <div>
                  <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Product / Solution</p>
                  <p className="text-sm">{persona.productBrief.product}</p>
                </div>
                <div>
                  <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Pricing</p>
                  <p className="text-sm">{persona.productBrief.pricing}</p>
                </div>
                <div>
                  <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Implementation</p>
                  <p className="text-sm">{persona.productBrief.implementation}</p>
                </div>
                <div>
                  <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Expected Results</p>
                  <p className="text-sm">{persona.productBrief.results}</p>
                </div>
                <div>
                  <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Target Audience</p>
                  <p className="text-sm">{persona.productBrief.audience}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Selection */}
          <div className="md:w-3/5 space-y-6">
            {/* Header */}
            <div>
              <h2 className="font-serif text-3xl font-black uppercase tracking-tighter mb-1" style={{ letterSpacing: '-0.02em' }}>
                SELECT PRODUCT
              </h2>
              <p className="font-mono text-xs uppercase tracking-wider text-gray-600">What are you selling?</p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-4">
              {defaultProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setReadyToStart(true);
                  }}
                  className={`p-5 border-4 text-left transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-black bg-black text-white'
                      : 'border-black bg-white hover:bg-gray-50'
                  }`}
                  style={{
                    boxShadow: selectedProduct?.id === product.id ? '4px 4px 0px 0px rgba(0,0,0,0.3)' : '4px 4px 0px 0px rgba(0,0,0,0.1)',
                  }}
                >
                  <h3 className="font-serif font-black text-base mb-1">{product.name}</h3>
                  <p className="font-mono text-xs mb-2 opacity-75">{product.category}</p>
                  <p className="text-xs mb-3 leading-tight">{product.description}</p>
                  <div className="space-y-1 text-xs font-mono opacity-80">
                    <p>💰 {product.pricingCost}</p>
                    <p>⏱ {product.implementationTime}</p>
                  </div>
                </button>
              ))}
            </div>


            {/* Custom Product Form */}
            {!showCustomForm ? (
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full p-5 border-4 border-gray-300 bg-white hover:bg-gray-50 font-serif font-black text-base uppercase transition-all"
                style={{
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.05)',
                }}
              >
                + CREATE CUSTOM PRODUCT
              </button>
            ) : (
              <div className="p-5 border-4 border-black bg-white" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)' }}>
                <h3 className="font-serif font-black text-lg uppercase tracking-tighter mb-4" style={{ letterSpacing: '-0.01em' }}>
                  Create Custom Product
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block font-mono text-xs uppercase font-bold mb-1 text-gray-600">Product Name</label>
                    <input
                      type="text"
                      value={customProduct.name}
                      onChange={(e) => setCustomProduct({ ...customProduct, name: e.target.value })}
                      className="w-full border-2 border-black px-3 py-2 font-mono text-sm bg-white"
                      placeholder="e.g., Slack"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase font-bold mb-1 text-gray-600">Category</label>
                    <input
                      type="text"
                      value={customProduct.category}
                      onChange={(e) => setCustomProduct({ ...customProduct, category: e.target.value })}
                      className="w-full border-2 border-black px-3 py-2 font-mono text-sm bg-white"
                      placeholder="e.g., Communication"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase font-bold mb-1 text-gray-600">Pricing</label>
                    <input
                      type="text"
                      value={customProduct.pricingCost}
                      onChange={(e) => setCustomProduct({ ...customProduct, pricingCost: e.target.value })}
                      className="w-full border-2 border-black px-3 py-2 font-mono text-sm bg-white"
                      placeholder="e.g., $12/month per user"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase font-bold mb-1 text-gray-600">Implementation</label>
                    <input
                      type="text"
                      value={customProduct.implementationTime}
                      onChange={(e) => setCustomProduct({ ...customProduct, implementationTime: e.target.value })}
                      className="w-full border-2 border-black px-3 py-2 font-mono text-sm bg-white"
                      placeholder="e.g., 1 week"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase font-bold mb-1 text-gray-600">Key Benefits</label>
                    <textarea
                      value={customProduct.keyBenefits}
                      onChange={(e) => setCustomProduct({ ...customProduct, keyBenefits: e.target.value })}
                      className="w-full border-2 border-black px-3 py-2 font-mono text-sm bg-white"
                      placeholder={`One per line\ne.g., All comms in one place`}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleCustomSubmit}
                      className="flex-1 bg-black text-white font-serif font-black py-2 hover:bg-gray-800 uppercase text-sm transition-colors"
                    >
                      Use This Product
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomForm(false);
                        setCustomProduct({ name: '', category: '', pricingCost: '', implementationTime: '', keyBenefits: '' });
                      }}
                      className="flex-1 bg-white border-2 border-black font-serif font-black py-2 hover:bg-gray-50 uppercase text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
