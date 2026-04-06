export interface Product {
  id: string;
  name: string;
  category: string; // e.g., "Data Integration", "CRM", "Analytics", "Sales Training"
  description: string; // What it does / who it's for
  targetRole: string; // e.g., "Finance", "Engineering", "Operations", "Sales"
  keyBenefits: string[]; // Top 3-5 benefits
  pricingModel: string; // e.g., "Per-seat", "Per-API-call", "Flat monthly"
  pricingCost: string; // e.g., "$5k/month"
  implementationTime: string; // e.g., "2 weeks"
  minContractLength?: string; // e.g., "3 months"
  naturalConcerns: string[]; // Concerns the persona should have about this product
  successMetrics: string[]; // What success looks like (ROI, time saved, etc.)
}

export const DEFAULT_PRODUCTS: Record<string, Product> = {
  'closerr': {
    id: 'closerr',
    name: 'Closerr',
    category: 'Sales Training',
    description: 'AI-powered sales training platform. Practice negotiations with realistic buyer personas.',
    targetRole: 'Sales',
    keyBenefits: [
      'Practice unlimited sales calls without client fatigue',
      'Get real-time feedback on discovery, objection handling, and closing',
      'Improve close rates through deliberate practice',
    ],
    pricingModel: 'Per-seat monthly',
    pricingCost: '$5k/month',
    implementationTime: '2 weeks',
    minContractLength: '3 months',
    naturalConcerns: [
      'Will our team actually use this or is it another tool gathering dust?',
      'How does AI-generated practice compare to real customer calls?',
      'Can we justify $5k/month for training when we\'re already spending on other tools?',
      'What\'s the time investment required? Our reps are busy closing deals.',
      'How do we measure ROI on sales training?',
    ],
    successMetrics: [
      'Close rate improvement',
      'Average deal size increase',
      'Sales cycle time reduction',
      'Rep confidence in negotiations',
    ],
  },

  'fivetran': {
    id: 'fivetran',
    name: 'Fivetran',
    category: 'Data Integration',
    description: 'Cloud data pipeline. Automatically sync data from 300+ sources to your data warehouse.',
    targetRole: 'Engineering',
    keyBenefits: [
      'Reduce ETL maintenance burden on engineers',
      'Pre-built connectors for 300+ data sources',
      'Real-time and batch data syncing',
    ],
    pricingModel: 'Per-connector monthly',
    pricingCost: '$1.5k-3k per connector',
    implementationTime: '1 week per connector',
    minContractLength: '1 month',
    naturalConcerns: [
      'We have custom connectors we built - how hard is migration?',
      'Will this be more expensive than our current Airflow setup?',
      'How do we handle our edge-case data sources?',
      'What\'s the learning curve for our team?',
      'Do we lose visibility into data pipelines if we go third-party?',
    ],
    successMetrics: [
      'Engineering time freed up',
      'Data freshness improvement',
      'Number of connectors supported',
    ],
  },

  'stripe': {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    description: 'Payment processing platform. Accept payments online with fraud prevention and global support.',
    targetRole: 'Finance',
    keyBenefits: [
      'Accept payments in 135+ currencies',
      'Built-in fraud detection and compliance',
      'Easy integration with webhooks and APIs',
    ],
    pricingModel: 'Per-transaction percentage',
    pricingCost: '2.9% + $0.30 per transaction',
    implementationTime: '1-2 weeks',
    minContractLength: 'No minimum',
    naturalConcerns: [
      'We\'re already using PayPal - switching costs?',
      'What\'s your support like if payment processing goes down?',
      'How do you compare on fraud detection to our current vendor?',
      'Is 2.9% + 30¢ competitive for our volume?',
      'What about PCI compliance - is that on us or you?',
    ],
    successMetrics: [
      'Faster payment processing',
      'Reduced chargeback rate',
      'Expanded international payment options',
    ],
  },
};

export function getProduct(productId: string): Product | undefined {
  return DEFAULT_PRODUCTS[productId];
}

export function getAllProducts(): Product[] {
  return Object.values(DEFAULT_PRODUCTS);
}

export function createProduct(product: Omit<Product, 'id'>): Product {
  return {
    ...product,
    id: `product-${Date.now()}`,
  };
}
