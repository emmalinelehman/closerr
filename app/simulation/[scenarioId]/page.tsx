'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import VoiceInterface from '@/components/simulation/VoiceInterface';
import { Product, getAllProducts } from '@/lib/config/productSchema';
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

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
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

  .product-card {
    transition: all 0.3s ease;
  }

  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 30px rgba(255, 255, 0, 0.7), 4px 4px 0px 0px rgba(0, 0, 0, 0.1) !important;
    border-color: #FFFF00 !important;
    border-width: 4px;
  }

  .button-hover:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(255, 255, 0, 0.7) !important;
    border-color: #FFFF00 !important;
  }

  .button-hover:disabled {
    cursor: not-allowed;
    opacity: 0.5;
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

  return (
    <div className="min-h-screen bg-white text-black">
      <style>{animationStyles}</style>

      {/* Header */}
      <div className="border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tighter" style={{ letterSpacing: '-0.02em' }}>
            PREPARE FOR CALL
          </h1>
        </div>
      </div>

      {/* Persona Context Section */}
      <div className="border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <p className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 mb-4">Context</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-2 border-black p-3 bg-white" style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.1)' }}>
              <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Company</p>
              <p className="text-xs leading-tight">{persona.productBrief.company}</p>
            </div>
            <div className="border-2 border-black p-3 bg-white" style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.1)' }}>
              <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Product</p>
              <p className="text-xs leading-tight">{persona.productBrief.product}</p>
            </div>
            <div className="border-2 border-black p-3 bg-white" style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.1)' }}>
              <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Pricing</p>
              <p className="text-xs leading-tight">{persona.productBrief.pricing}</p>
            </div>
            <div className="border-2 border-black p-3 bg-white" style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.1)' }}>
              <p className="font-mono text-xs uppercase font-bold text-gray-600 mb-1">Implementation</p>
              <p className="text-xs leading-tight">{persona.productBrief.implementation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2" style={{ letterSpacing: '-0.02em' }}>
            SELECT PRODUCT
          </h2>
          <p className="font-mono text-xs uppercase tracking-widest text-gray-600">What are you selling to {persona.name}?</p>
        </div>

        {/* Product Cards */}
        <div className="space-y-4 mb-8">
          {defaultProducts.map((product, idx) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`product-card w-full p-6 border-4 text-left transition-all animate-fade-in-up ${
                selectedProduct?.id === product.id
                  ? 'border-black bg-black text-white'
                  : 'border-black bg-white text-black'
              }`}
              style={{
                boxShadow: selectedProduct?.id === product.id ? '0 0 30px rgba(255, 255, 0, 0.7), 4px 4px 0px 0px rgba(0,0,0,0.2)' : '4px 4px 0px 0px rgba(0,0,0,0.1)',
                animationDelay: `${(idx + 1) * 0.1}s`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-black text-lg mb-1">{product.name}</h3>
                  <p className="font-mono text-xs mb-2 opacity-75">{product.category}</p>
                  <p className="text-sm mb-3 leading-relaxed">{product.description}</p>
                  <div className="space-y-1 text-xs font-mono opacity-80">
                    <p>💰 {product.pricingCost}</p>
                    <p>⏱ {product.implementationTime}</p>
                  </div>
                </div>
                {selectedProduct?.id === product.id && (
                  <div className="flex-shrink-0 text-right">
                    <p className="font-mono text-xs font-bold">✓</p>
                    <p className="font-mono text-xs font-bold uppercase">SELECTED</p>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Product Section */}
        <div className="space-y-4 mb-12">
          {!showCustomForm ? (
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full p-6 border-4 border-gray-300 bg-white hover:bg-gray-50 font-serif font-black text-lg uppercase transition-all product-card"
              style={{
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.05)',
              }}
            >
              + CREATE CUSTOM PRODUCT
            </button>
          ) : (
            <div className="p-6 border-4 border-black bg-white animate-fade-in-up" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)' }}>
              <h3 className="font-serif font-black text-xl uppercase tracking-tighter mb-6" style={{ letterSpacing: '-0.01em' }}>
                Create Custom Product
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold mb-2 text-gray-600">Product Name</label>
                  <input
                    type="text"
                    value={customProduct.name}
                    onChange={(e) => setCustomProduct({ ...customProduct, name: e.target.value })}
                    className="w-full border-2 border-black px-3 py-2 font-mono text-sm bg-white text-black"
                    placeholder="e.g., Slack"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase font-bold mb-2 text-gray-600">Category</label>
                  <input
                    type="text"
                    value={customProduct.category}
                    onChange={(e) => setCustomProduct({ ...customProduct, category: e.target.value })}
                    className="w-full border-2 border-black px-3 py-2 font-mono text-sm bg-white text-black"
                    placeholder="e.g., Communication"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase font-bold mb-2 text-gray-600">Pricing</label>
                  <input
                    type="text"
                    value={customProduct.pricingCost}
                    onChange={(e) => setCustomProduct({ ...customProduct, pricingCost: e.target.value })}
                    className="w-full border-2 border-black px-3 py-2 font-mono text-sm bg-white text-black"
                    placeholder="e.g., $12/month per user"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase font-bold mb-2 text-gray-600">Implementation</label>
                  <input
                    type="text"
                    value={customProduct.implementationTime}
                    onChange={(e) => setCustomProduct({ ...customProduct, implementationTime: e.target.value })}
                    className="w-full border-2 border-black px-3 py-2 font-mono text-sm bg-white text-black"
                    placeholder="e.g., 1 week"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase font-bold mb-2 text-gray-600">Key Benefits</label>
                  <textarea
                    value={customProduct.keyBenefits}
                    onChange={(e) => setCustomProduct({ ...customProduct, keyBenefits: e.target.value })}
                    className="w-full border-2 border-black px-3 py-2 font-mono text-sm bg-white text-black"
                    placeholder={`One per line\ne.g., All comms in one place`}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleCustomSubmit();
                      setShowCustomForm(false);
                    }}
                    className="flex-1 bg-black text-white font-serif font-black py-3 hover:bg-gray-800 uppercase text-sm transition-colors"
                  >
                    Use This Product
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomForm(false);
                      setCustomProduct({ name: '', category: '', pricingCost: '', implementationTime: '', keyBenefits: '' });
                    }}
                    className="flex-1 bg-white border-2 border-black font-serif font-black py-3 hover:bg-gray-50 uppercase text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleContinue}
            disabled={!selectedProduct}
            className="button-hover border-4 border-black bg-black text-white font-serif font-black text-lg uppercase px-12 py-4 flex items-center gap-3 transition-all"
            style={{
              boxShadow: selectedProduct ? '6px 6px 0px 0px rgba(0,0,0,0.2)' : 'none',
              opacity: selectedProduct ? 1 : 0.5,
            }}
          >
            CONTINUE
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
