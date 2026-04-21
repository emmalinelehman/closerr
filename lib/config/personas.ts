export interface PersonaContext {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  companySize: number;
  yearsAtCompany: number;
  reportingLine: string;

  // Company Profile
  foundedYear: number;
  stage: 'Early' | 'Growth' | 'Scale' | 'Mature';
  annualRevenue: string;
  fundingStatus: string;
  growthRate: string;

  // Current State
  currentStack: string[];
  keyChallenge: string;
  painPoints: string[];
  successMetrics: string[];

  // Role Context
  teamSize: number;
  directReports: number;
  budget: string;
  budgetStatus: 'Invested' | 'Constrained' | 'Flexible';
  responsibilities: string[];

  // Priorities
  q1_q2_priorities: string[];
  timelinePreference: string;
  riskTolerance: 'Low' | 'Medium' | 'High';

  // Personality
  decisionStyle: string;
  communicationStyle: string;
  objectionStyle: string;
}

export const PERSONA_CONTEXTS: Record<string, PersonaContext> = {
  'skeptical-cfo': {
    id: 'skeptical-cfo',
    name: 'Sarah Chen',
    title: 'Chief Financial Officer',
    company: 'DataSync',
    industry: 'B2B SaaS',
    companySize: 150,
    yearsAtCompany: 4,
    reportingLine: 'CEO',

    foundedYear: 2019,
    stage: 'Scale',
    annualRevenue: '$12M ARR',
    fundingStatus: 'Series B - $20M raised',
    growthRate: '40% YoY',

    currentStack: ['Fivetran', 'Custom ETL', 'Airflow', 'Tableau'],
    keyChallenge: 'Data pipeline bottleneck slowing analytics team',
    painPoints: [
      'Data ops costs $500k/year + 2 engineers',
      'ETL jobs failing regularly',
      'Analytics turnaround time: 3-5 days',
      'Team context switching on maintenance',
    ],
    successMetrics: [
      'Operational efficiency',
      'Time to insight',
      'Engineering headcount efficiency',
    ],

    teamSize: 25,
    directReports: 3,
    budget: '$1.5M annual for data infrastructure',
    budgetStatus: 'Flexible',
    responsibilities: [
      'Financial planning and forecasting',
      'Data infrastructure budget',
      'Operational efficiency metrics',
    ],

    q1_q2_priorities: [
      'Cut data ops costs by 30% while improving speed',
      'Reduce technical debt in ETL',
      'Improve data reliability (reduce failures)',
      'Free up engineers for product work',
    ],
    timelinePreference: 'Prefer 4-6 week implementation, not 6 months',
    riskTolerance: 'Medium',

    decisionStyle:
      'Data-driven, asks for ROI and metrics, wants proof before committing',
    communicationStyle:
      'Direct, appreciates specifics over hype, values your understanding of her constraints',
    objectionStyle:
      'Fair but skeptical, pushes back on vague claims, acknowledges good points',
  },

  'busy-founder': {
    id: 'busy-founder',
    name: 'Maya Webb',
    title: 'Founder & CEO',
    company: 'TechFlow',
    industry: 'B2B Developer Tools',
    companySize: 45,
    yearsAtCompany: 6,
    reportingLine: 'Self',

    foundedYear: 2019,
    stage: 'Growth',
    annualRevenue: '$2M ARR',
    fundingStatus: 'Seed - $1.2M raised',
    growthRate: '85% YoY',

    currentStack: ['Stripe', 'Segment', 'Mixpanel', 'Intercom'],
    keyChallenge: 'Customer acquisition costs rising, retention metrics softening',
    painPoints: [
      'Too many point tools creating data silos',
      'Can\'t get clear picture of customer journey',
      'Manual data stitching eating engineering time',
      'Spending 20% of revenue on martech / data tools',
    ],
    successMetrics: [
      'CAC payback period',
      'Product engagement',
      'Customer LTV',
    ],

    teamSize: 12,
    directReports: 2,
    budget: '$200k/year for operational tools',
    budgetStatus: 'Constrained',
    responsibilities: [
      'Product strategy',
      'Go-to-market',
      'Revenue targets',
      'Company culture',
    ],

    q1_q2_priorities: [
      'Reduce CAC by 25% through better targeting',
      'Consolidate tools to reduce cost and complexity',
      'Get 30-day visibility into customer behavior',
      'Move fast - need real impact in 30 days',
    ],
    timelinePreference: 'Implementation must be fast, ideally 2-3 weeks',
    riskTolerance: 'High',

    decisionStyle:
      'Fast decision-maker, needs bottom-line value clear, willing to experiment',
    communicationStyle:
      'Direct, impatient with process talk, appreciates speed and clarity',
    objectionStyle:
      'Skeptical of vendor pitches, but fair if you understand her world',
  },

  'price-sensitive': {
    id: 'price-sensitive',
    name: 'Jennifer Martinez',
    title: 'Operations Manager',
    company: 'LocalServe',
    industry: 'Regional Service Network',
    companySize: 80,
    yearsAtCompany: 8,
    reportingLine: 'VP Operations',

    foundedYear: 2015,
    stage: 'Mature',
    annualRevenue: '$8M',
    fundingStatus: 'Bootstrapped',
    growthRate: '12% YoY',

    currentStack: ['Excel', 'Google Sheets', 'Salesforce', 'Manual processes'],
    keyChallenge: 'Scaling operations without proportional headcount increase',
    painPoints: [
      'Heavy reliance on spreadsheets and manual work',
      'Can\'t scale without hiring more staff',
      'Compliance and audit risks from inconsistent tracking',
      'Data entry errors costing $50k+/year',
    ],
    successMetrics: [
      'Cost per transaction',
      'Operational margin',
      'Staff utilization',
    ],

    teamSize: 18,
    directReports: 4,
    budget: '$150k annual for process improvement',
    budgetStatus: 'Constrained',
    responsibilities: [
      'Day-to-day operations',
      'Cost control',
      'Process optimization',
      'Compliance',
    ],

    q1_q2_priorities: [
      'Reduce manual data entry by 50%',
      'Improve operational margin without hiring',
      'Reduce compliance risks',
      'Solution must pay for itself within 6 months',
    ],
    timelinePreference: 'Needs clear ROI, slow to adopt if unsure',
    riskTolerance: 'Low',

    decisionStyle: 'Financially conservative, wants proof, needs board approval',
    communicationStyle:
      'Practical, cost-conscious, appreciates realistic expectations',
    objectionStyle:
      'Cautious, will test extensively before committing to budget',
  },

  drew: {
    id: 'drew',
    name: 'Dani Sullivan',
    title: 'VP Product Engineering',
    company: 'CloudNine',
    industry: 'Infrastructure SaaS',
    companySize: 200,
    yearsAtCompany: 3,
    reportingLine: 'CTO',

    foundedYear: 2018,
    stage: 'Scale',
    annualRevenue: '$25M ARR',
    fundingStatus: 'Series C - $50M raised',
    growthRate: '60% YoY',

    currentStack: ['Kubernetes', 'Prometheus', 'ELK Stack', 'PagerDuty'],
    keyChallenge:
      'Platform reliability incidents impacting enterprise customers',
    painPoints: [
      'MTTR (mean time to resolution) at 45 mins, should be < 15',
      'On-call rotation burning engineers',
      'Missing visibility into performance degradation',
      'Post-mortems not improving incident prevention',
    ],
    successMetrics: ['MTTR', 'Incident prevention', 'On-call burden', 'Engineer satisfaction'],

    teamSize: 35,
    directReports: 4,
    budget: '$800k annual for reliability infrastructure',
    budgetStatus: 'Flexible',
    responsibilities: [
      'Platform reliability',
      'Engineering culture',
      'Technical hiring',
      'Architecture decisions',
    ],

    q1_q2_priorities: [
      'Cut MTTR by 75% through better observability',
      'Reduce on-call burden to improve retention',
      'Implement better root cause analysis process',
      'Move enterprise customers to SLA compliance',
    ],
    timelinePreference: 'Wants to see impact in 2-3 weeks of pilots',
    riskTolerance: 'High',

    decisionStyle:
      'Technical deep-diver, evaluates on merit, skeptical of sales fluff',
    communicationStyle:
      'Wants you to understand the technical problem deeply',
    objectionStyle:
      'Direct, will call out BS, but fair if you clearly understand the issue',
  },
};

export function getPersonaContext(personaId: string): PersonaContext | undefined {
  return PERSONA_CONTEXTS[personaId];
}
