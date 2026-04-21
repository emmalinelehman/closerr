'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import VoiceInterface from '@/components/simulation/VoiceInterface';
import { Product, getAllProducts } from '@/lib/config/productSchema';
import { ArrowRight, ChevronDown } from 'lucide-react';

const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .product-card {
    transition: all 0.3s ease;
  }
`;

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
  const [readyToStart, setReadyToStart] = useState(false);
  const [expandedDrawers, setExpandedDrawers] = useState({ persona: false, product: true });
  const [customProduct, setCustomProduct] = useState({
    name: '',
    category: '',
    pricingCost: '',
    implementationTime: '',
    keyBenefits: '',
  });
  const [showCustomForm, setShowCustomForm] = useState(false);

  if (!persona) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold uppercase mb-4" style={{ letterSpacing: '-0.02em' }}>
            Persona Not Found
          </h1>
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
  };

  const handleContinue = () => {
    if (selectedProduct) {
      setReadyToStart(true);
    }
  };

  const toggleDrawer = (drawer: string) => {
    setExpandedDrawers(prev => ({
      ...prev,
      [drawer]: !prev[drawer]
    }));
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col" style={{
      backgroundImage: 'url(/phoneascii.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <style>{animationStyles}</style>

      <div className="flex-1 mx-auto w-full max-w-3xl bg-white/95">
        {/* Header */}
        <div className="border-b border-gray-200 px-8 md:px-12 py-4">
          <h1 className="font-serif text-3xl md:text-4xl font-black uppercase" style={{ letterSpacing: '-0.02em' }}>
            Prepare for Call
          </h1>
        </div>

        {/* Persona & Context Drawers */}
        <div className="border-b border-gray-200">
        {/* Persona Drawer */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleDrawer('persona')}
            className="w-full px-8 md:px-12 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-serif text-xl font-black uppercase text-black" style={{ letterSpacing: '-0.01em' }}>
                  {persona.name}
                </h3>
                <p className="font-mono text-sm text-gray-600 mt-0.5">{persona.title}</p>
              </div>
            </div>
            <ChevronDown
              className="w-5 h-5 text-gray-600 transition-transform"
              style={{
                transform: expandedDrawers.persona ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {expandedDrawers.persona && (
            <div className="bg-white border-t border-gray-200 px-8 md:px-12 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-sm uppercase font-bold text-gray-600 mb-1">Company</p>
                  <p className="text-sm leading-relaxed text-gray-900">{persona.productBrief.company}</p>
                </div>
                <div>
                  <p className="font-mono text-sm uppercase font-bold text-gray-600 mb-1">Audience</p>
                  <p className="text-sm leading-relaxed text-gray-900">{persona.productBrief.audience}</p>
                </div>
                <div>
                  <p className="font-mono text-sm uppercase font-bold text-gray-600 mb-1">Key Priority</p>
                  <p className="text-sm leading-relaxed text-gray-900">
                    {persona.name.includes('CFO') && 'ROI and financial impact'}
                    {persona.name.includes('Founder') && 'Speed and implementation'}
                    {persona.name.includes('SMB') && 'Cost-effectiveness and value'}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-sm uppercase font-bold text-gray-600 mb-1">Selling Approach</p>
                  <p className="text-sm leading-relaxed text-gray-900">
                    {persona.name.includes('CFO') && 'Lead with numbers, emphasize ROI and risk mitigation'}
                    {persona.name.includes('Founder') && 'Be concise, focus on speed and efficiency'}
                    {persona.name.includes('SMB') && 'Highlight value and affordability'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Brief Drawer */}
        <div>
          <button
            onClick={() => toggleDrawer('product')}
            className="w-full px-8 md:px-12 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div>
              <h3 className="font-serif text-xl font-black uppercase text-black" style={{ letterSpacing: '-0.01em' }}>
                Product Brief
              </h3>
              <p className="font-mono text-sm text-gray-600 mt-0.5">What you're selling</p>
            </div>
            <ChevronDown
              className="w-5 h-5 text-gray-600 transition-transform"
              style={{
                transform: expandedDrawers.product ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {expandedDrawers.product && (
            <div className="bg-gray-50 border-t border-gray-200 px-8 md:px-12 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="font-mono text-sm uppercase font-bold text-gray-600 mb-1">Product</p>
                  <p className="text-sm leading-relaxed text-gray-900">{persona.productBrief.product}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="font-mono text-sm uppercase font-bold text-gray-600 mb-1">Pricing</p>
                  <p className="text-sm leading-relaxed text-gray-900">{persona.productBrief.pricing}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="font-mono text-sm uppercase font-bold text-gray-600 mb-1">Implementation</p>
                  <p className="text-sm leading-relaxed text-gray-900">{persona.productBrief.implementation}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="font-mono text-sm uppercase font-bold text-gray-600 mb-1">Results</p>
                  <p className="text-sm leading-relaxed text-gray-900">{persona.productBrief.results}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Main Content */}
        <div className="px-8 md:px-12 py-8">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="font-serif text-4xl md:text-5xl font-black uppercase mb-2" style={{ letterSpacing: '-0.02em' }}>
            Select Product
          </h2>
          <p className="font-mono text-sm uppercase tracking-widest text-gray-600">What are you selling today?</p>
        </div>

        {/* Product Cards */}
        <div className="space-y-3 mb-8">
          {defaultProducts.map((product, idx) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`product-card w-full p-4 text-left transition-all animate-fade-in-up rounded-lg border-2 ${
                selectedProduct?.id === product.id
                  ? 'border-black bg-black text-white shadow-lg'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow-sm'
              }`}
              style={{
                animationDelay: `${(idx + 1) * 0.1}s`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-black text-xl mb-1">{product.name}</h3>
                  <p className={`font-mono text-sm mb-2 ${selectedProduct?.id === product.id ? 'opacity-75' : 'text-gray-600'}`}>{product.category}</p>
                  <p className={`text-base mb-3 leading-relaxed ${selectedProduct?.id === product.id ? '' : 'text-gray-700'}`}>{product.description}</p>
                  <div className={`space-y-1 text-sm font-mono ${selectedProduct?.id === product.id ? 'opacity-80' : 'text-gray-600'}`}>
                    <p>💰 {product.pricingCost}</p>
                    <p>⏱ {product.implementationTime}</p>
                  </div>
                </div>
                {selectedProduct?.id === product.id && (
                  <div className="flex-shrink-0 text-right">
                    <p className="font-mono text-xs font-bold">✓</p>
                    <p className="font-mono text-xs font-bold uppercase">Selected</p>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Product Section */}
        <div className="mb-8">
          {!showCustomForm ? (
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full p-6 border-2 border-gray-300 bg-white hover:bg-gray-50 font-serif font-black text-sm uppercase transition-all product-card rounded-lg text-gray-700"
            >
              + Create Custom Product
            </button>
          ) : (
            <div className="p-4 border-2 border-gray-300 bg-white rounded-lg animate-fade-in-up">
              <h3 className="font-serif font-black text-lg uppercase mb-4" style={{ letterSpacing: '-0.01em' }}>
                Create Custom Product
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-mono text-sm uppercase font-bold mb-2 text-gray-600">Product Name</label>
                  <input
                    type="text"
                    value={customProduct.name}
                    onChange={(e) => setCustomProduct({ ...customProduct, name: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-2 font-mono text-base bg-white text-black rounded-md focus:border-black focus:outline-none transition-colors"
                    placeholder="e.g., Slack"
                  />
                </div>
                <div>
                  <label className="block font-mono text-sm uppercase font-bold mb-2 text-gray-600">Category</label>
                  <input
                    type="text"
                    value={customProduct.category}
                    onChange={(e) => setCustomProduct({ ...customProduct, category: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 font-mono text-base bg-white text-black rounded-md focus:border-gray-400 focus:outline-none transition-colors"
                    placeholder="e.g., Communication"
                  />
                </div>
                <div>
                  <label className="block font-mono text-sm uppercase font-bold mb-2 text-gray-600">Pricing</label>
                  <input
                    type="text"
                    value={customProduct.pricingCost}
                    onChange={(e) => setCustomProduct({ ...customProduct, pricingCost: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 font-mono text-base bg-white text-black rounded-md focus:border-gray-400 focus:outline-none transition-colors"
                    placeholder="e.g., $12/month per user"
                  />
                </div>
                <div>
                  <label className="block font-mono text-sm uppercase font-bold mb-2 text-gray-600">Implementation</label>
                  <input
                    type="text"
                    value={customProduct.implementationTime}
                    onChange={(e) => setCustomProduct({ ...customProduct, implementationTime: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 font-mono text-base bg-white text-black rounded-md focus:border-gray-400 focus:outline-none transition-colors"
                    placeholder="e.g., 1 week"
                  />
                </div>
                <div>
                  <label className="block font-mono text-sm uppercase font-bold mb-2 text-gray-600">Key Benefits</label>
                  <textarea
                    value={customProduct.keyBenefits}
                    onChange={(e) => setCustomProduct({ ...customProduct, keyBenefits: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 font-mono text-base bg-white text-black rounded-md focus:border-gray-400 focus:outline-none transition-colors"
                    placeholder={`One per line\ne.g., All comms in one place`}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleCustomSubmit();
                      setShowCustomForm(false);
                    }}
                    className="flex-1 bg-black text-white font-serif font-black py-2 rounded-md hover:opacity-90 uppercase text-sm transition-opacity mt-3"
                  >
                    Use This Product
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomForm(false);
                      setCustomProduct({ name: '', category: '', pricingCost: '', implementationTime: '', keyBenefits: '' });
                    }}
                    className="flex-1 bg-white border-2 border-gray-300 font-serif font-black py-2 rounded-md hover:bg-gray-50 uppercase text-sm transition-colors text-gray-900 mt-3"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleContinue}
            disabled={!selectedProduct}
            className="bg-black text-white font-serif font-black text-sm uppercase px-8 py-2 flex items-center gap-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Begin Call
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
