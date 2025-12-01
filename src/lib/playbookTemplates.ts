export interface PlaybookTactic {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost: string;
  timeframe: string;
  kpis: string[];
  implementation: string[];
  completed?: boolean;
}

export interface PlaybookTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry?: string[];
  icon: string;
  tactics: PlaybookTactic[];
  estimatedBudget: string;
  timeline: string;
  expectedROI: string;
}

export const playbookTemplates: PlaybookTemplate[] = [
  // SAAS GROWTH STRATEGIES
  {
    id: 'saas-growth-starter',
    name: 'SaaS Growth Starter Pack',
    description: 'Essential growth tactics for early-stage SaaS companies',
    category: 'growth-strategy',
    industry: ['SaaS', 'B2B Software'],
    icon: '🚀',
    estimatedBudget: '$5,000-$15,000/month',
    timeline: '3-6 months',
    expectedROI: '3-5x',
    tactics: [
      {
        id: 'product-led-growth',
        title: 'Implement Product-Led Growth',
        description: 'Create free trial or freemium tier to drive user acquisition',
        priority: 'high',
        estimatedCost: '$2,000-$5,000',
        timeframe: '2-4 weeks',
        kpis: ['Free trial signups', 'Trial-to-paid conversion', 'Time to value'],
        implementation: [
          'Define free tier limitations and premium features',
          'Build self-service onboarding flow',
          'Create in-app upgrade prompts',
          'Set up email nurture sequences for trial users',
          'Implement usage tracking and engagement scoring'
        ]
      },
      {
        id: 'seo-foundation',
        title: 'SEO Content Foundation',
        description: 'Build organic traffic through targeted content',
        priority: 'high',
        estimatedCost: '$3,000-$6,000',
        timeframe: '4-8 weeks',
        kpis: ['Organic traffic', 'Keyword rankings', 'Backlinks'],
        implementation: [
          'Conduct keyword research for target personas',
          'Create 10-15 SEO-optimized blog posts',
          'Optimize website technical SEO',
          'Build internal linking structure',
          'Create content distribution plan'
        ]
      },
      {
        id: 'review-generation',
        title: 'Social Proof Engine',
        description: 'Generate and showcase customer reviews and testimonials',
        priority: 'medium',
        estimatedCost: '$1,000-$2,000',
        timeframe: '2-3 weeks',
        kpis: ['Reviews collected', 'G2/Capterra rating', 'Testimonials'],
        implementation: [
          'Set up automated review request emails',
          'Create G2 and Capterra profiles',
          'Design testimonial collection process',
          'Build social proof sections on website',
          'Create case study template'
        ]
      },
      {
        id: 'referral-program',
        title: 'Customer Referral Program',
        description: 'Leverage existing customers to drive new signups',
        priority: 'medium',
        estimatedCost: '$2,000-$4,000',
        timeframe: '3-4 weeks',
        kpis: ['Referrals generated', 'Referral conversion rate', 'Customer LTV'],
        implementation: [
          'Design referral incentive structure',
          'Build referral tracking system',
          'Create referral landing pages',
          'Launch email campaign to existing customers',
          'Set up referral analytics dashboard'
        ]
      }
    ]
  },

  // DEMAND GENERATION
  {
    id: 'demand-gen-b2b',
    name: 'B2B Demand Generation Machine',
    description: 'Multi-channel lead generation for B2B companies',
    category: 'demand-generation',
    industry: ['B2B', 'Enterprise', 'Professional Services'],
    icon: '🎯',
    estimatedBudget: '$10,000-$30,000/month',
    timeline: '3-6 months',
    expectedROI: '4-6x',
    tactics: [
      {
        id: 'linkedin-outbound',
        title: 'LinkedIn Outbound Campaign',
        description: 'Targeted outreach to decision-makers on LinkedIn',
        priority: 'high',
        estimatedCost: '$5,000-$10,000',
        timeframe: '4-8 weeks',
        kpis: ['Connection acceptance rate', 'Meeting bookings', 'SQL generated'],
        implementation: [
          'Build targeted prospect list (500-1000 contacts)',
          'Create personalized connection request templates',
          'Design 3-5 touch follow-up sequence',
          'Set up LinkedIn Sales Navigator',
          'Train sales team on social selling'
        ]
      },
      {
        id: 'webinar-series',
        title: 'Educational Webinar Series',
        description: 'Host monthly webinars to generate and nurture leads',
        priority: 'high',
        estimatedCost: '$3,000-$8,000',
        timeframe: '6-12 weeks',
        kpis: ['Registrations', 'Attendance rate', 'Post-webinar conversions'],
        implementation: [
          'Plan 3-month webinar topic calendar',
          'Create landing pages and registration forms',
          'Set up email promotion sequence',
          'Design webinar slide decks',
          'Create post-webinar nurture campaigns'
        ]
      },
      {
        id: 'content-syndication',
        title: 'Content Syndication Network',
        description: 'Distribute content through B2B publisher networks',
        priority: 'medium',
        estimatedCost: '$4,000-$10,000',
        timeframe: '4-6 weeks',
        kpis: ['Lead volume', 'Cost per lead', 'Lead quality score'],
        implementation: [
          'Identify relevant syndication partners',
          'Create high-value content assets (whitepapers, guides)',
          'Set up lead capture and routing',
          'Negotiate CPL or CPA deals',
          'Build lead scoring model'
        ]
      },
      {
        id: 'account-based-marketing',
        title: 'ABM Pilot Program',
        description: 'Target top 50 accounts with personalized campaigns',
        priority: 'high',
        estimatedCost: '$6,000-$15,000',
        timeframe: '8-12 weeks',
        kpis: ['Account engagement', 'Pipeline from target accounts', 'Win rate'],
        implementation: [
          'Select and research 50 target accounts',
          'Create personalized landing pages',
          'Design account-specific ad campaigns',
          'Coordinate sales and marketing touchpoints',
          'Set up ABM analytics and reporting'
        ]
      }
    ]
  },

  // BRAND POSITIONING
  {
    id: 'brand-differentiation',
    name: 'Brand Differentiation Strategy',
    description: 'Stand out in a crowded market with clear positioning',
    category: 'brand-positioning',
    industry: ['All Industries'],
    icon: '⭐',
    estimatedBudget: '$8,000-$20,000',
    timeline: '2-4 months',
    expectedROI: '5-8x long-term',
    tactics: [
      {
        id: 'positioning-workshop',
        title: 'Brand Positioning Workshop',
        description: 'Define unique value proposition and market positioning',
        priority: 'high',
        estimatedCost: '$3,000-$5,000',
        timeframe: '2-3 weeks',
        kpis: ['Positioning clarity score', 'Internal alignment', 'Message differentiation'],
        implementation: [
          'Conduct stakeholder interviews',
          'Analyze competitor positioning',
          'Define target personas and their needs',
          'Create positioning statement and messaging hierarchy',
          'Test messaging with target audience'
        ]
      },
      {
        id: 'visual-identity-refresh',
        title: 'Visual Identity Refresh',
        description: 'Update brand visuals to reflect positioning',
        priority: 'high',
        estimatedCost: '$5,000-$12,000',
        timeframe: '4-6 weeks',
        kpis: ['Brand recognition', 'Design consistency', 'Visual engagement'],
        implementation: [
          'Audit current visual assets',
          'Design updated logo and color palette',
          'Create brand style guide',
          'Update website design elements',
          'Redesign marketing collateral'
        ]
      },
      {
        id: 'thought-leadership',
        title: 'Thought Leadership Program',
        description: 'Position executives as industry experts',
        priority: 'medium',
        estimatedCost: '$2,000-$5,000',
        timeframe: '8-12 weeks',
        kpis: ['Media mentions', 'Speaking engagements', 'LinkedIn engagement'],
        implementation: [
          'Identify key executives and their expertise',
          'Create content calendar for LinkedIn posts',
          'Pitch speaking opportunities at conferences',
          'Write byline articles for industry publications',
          'Build personal brand for executives'
        ]
      }
    ]
  },

  // CONTENT MARKETING
  {
    id: 'content-machine',
    name: 'Content Marketing Machine',
    description: 'Systematic content creation and distribution engine',
    category: 'content-marketing',
    industry: ['All Industries'],
    icon: '📝',
    estimatedBudget: '$6,000-$18,000/month',
    timeline: '3-6 months',
    expectedROI: '4-7x',
    tactics: [
      {
        id: 'pillar-strategy',
        title: 'Pillar Content Strategy',
        description: 'Create comprehensive guides as traffic magnets',
        priority: 'high',
        estimatedCost: '$4,000-$8,000',
        timeframe: '4-6 weeks',
        kpis: ['Organic traffic', 'Time on page', 'Lead generation'],
        implementation: [
          'Identify 3-5 pillar topics aligned with buyer journey',
          'Create 5,000+ word comprehensive guides',
          'Design supporting content cluster',
          'Build internal linking structure',
          'Promote through email and social channels'
        ]
      },
      {
        id: 'video-content',
        title: 'Video Content Series',
        description: 'Create engaging video content for multiple platforms',
        priority: 'high',
        estimatedCost: '$3,000-$7,000',
        timeframe: '4-8 weeks',
        kpis: ['Video views', 'Engagement rate', 'Lead conversions'],
        implementation: [
          'Plan 12-video content calendar',
          'Set up simple video production workflow',
          'Create YouTube channel and optimize',
          'Repurpose videos for LinkedIn, Instagram, TikTok',
          'Add CTAs and lead capture forms'
        ]
      },
      {
        id: 'newsletter-growth',
        title: 'Newsletter Growth Engine',
        description: 'Build and monetize email subscriber base',
        priority: 'medium',
        estimatedCost: '$2,000-$4,000',
        timeframe: '6-12 weeks',
        kpis: ['Subscriber growth', 'Open rate', 'Click-through rate'],
        implementation: [
          'Create compelling newsletter value proposition',
          'Design newsletter template',
          'Set up lead magnets and opt-in forms',
          'Plan content calendar (weekly or bi-weekly)',
          'Implement subscriber segmentation'
        ]
      }
    ]
  },

  // COMPETITIVE ANALYSIS
  {
    id: 'competitive-intel',
    name: 'Competitive Intelligence System',
    description: 'Monitor and respond to competitive threats',
    category: 'competitive-analysis',
    industry: ['All Industries'],
    icon: '🔍',
    estimatedBudget: '$3,000-$10,000',
    timeline: '1-3 months',
    expectedROI: '6-10x (defensive)',
    tactics: [
      {
        id: 'battlecards',
        title: 'Competitive Battlecards',
        description: 'Equip sales team with competitive intelligence',
        priority: 'high',
        estimatedCost: '$2,000-$4,000',
        timeframe: '2-4 weeks',
        kpis: ['Win rate vs competitors', 'Sales confidence', 'Deal velocity'],
        implementation: [
          'Research top 5 competitors (features, pricing, positioning)',
          'Create battlecard for each competitor',
          'Document objection handling scripts',
          'Train sales team on competitive positioning',
          'Set up quarterly battlecard updates'
        ]
      },
      {
        id: 'monitoring-system',
        title: 'Competitor Monitoring Dashboard',
        description: 'Track competitor activities in real-time',
        priority: 'medium',
        estimatedCost: '$1,000-$3,000',
        timeframe: '2-3 weeks',
        kpis: ['Competitor activities tracked', 'Response time', 'Market insights'],
        implementation: [
          'Set up Google Alerts for competitors',
          'Monitor competitor websites with change detection',
          'Track competitor social media and content',
          'Subscribe to competitor newsletters',
          'Create weekly competitive intelligence report'
        ]
      },
      {
        id: 'win-loss-analysis',
        title: 'Win/Loss Analysis Program',
        description: 'Learn from won and lost deals',
        priority: 'high',
        estimatedCost: '$2,000-$5,000',
        timeframe: '4-6 weeks',
        kpis: ['Interview completion rate', 'Actionable insights', 'Win rate improvement'],
        implementation: [
          'Design win/loss interview template',
          'Train team to conduct interviews',
          'Set up interview scheduling process',
          'Analyze themes and patterns',
          'Present findings and action items quarterly'
        ]
      }
    ]
  },

  // CUSTOMER RETENTION
  {
    id: 'retention-playbook',
    name: 'Customer Retention Playbook',
    description: 'Reduce churn and increase customer lifetime value',
    category: 'customer-retention',
    industry: ['SaaS', 'Subscription'],
    icon: '💚',
    estimatedBudget: '$5,000-$15,000/month',
    timeline: '3-6 months',
    expectedROI: '8-12x',
    tactics: [
      {
        id: 'onboarding-optimization',
        title: 'Customer Onboarding Optimization',
        description: 'Get customers to value faster',
        priority: 'high',
        estimatedCost: '$3,000-$7,000',
        timeframe: '4-6 weeks',
        kpis: ['Time to value', 'Feature adoption', 'Early churn rate'],
        implementation: [
          'Map customer journey and key milestones',
          'Create step-by-step onboarding checklist',
          'Build in-app onboarding tooltips and walkthroughs',
          'Set up automated onboarding email sequence',
          'Train CSMs on onboarding best practices'
        ]
      },
      {
        id: 'health-scoring',
        title: 'Customer Health Scoring System',
        description: 'Proactively identify at-risk customers',
        priority: 'high',
        estimatedCost: '$2,000-$5,000',
        timeframe: '3-4 weeks',
        kpis: ['Churn prediction accuracy', 'Intervention success rate', 'Net retention'],
        implementation: [
          'Define health score criteria (usage, support tickets, payments)',
          'Build automated health score dashboard',
          'Create red/yellow/green alert system',
          'Design intervention playbooks for at-risk accounts',
          'Set up automated alerts for CSM team'
        ]
      },
      {
        id: 'expansion-program',
        title: 'Customer Expansion Program',
        description: 'Drive upsells and cross-sells',
        priority: 'medium',
        estimatedCost: '$2,000-$5,000',
        timeframe: '4-8 weeks',
        kpis: ['Expansion revenue', 'Seats added', 'Feature upgrades'],
        implementation: [
          'Identify expansion triggers (usage patterns, team growth)',
          'Create expansion conversation scripts',
          'Design upgrade incentive offers',
          'Build in-app upgrade prompts',
          'Track expansion revenue and CAC payback'
        ]
      },
      {
        id: 'community-building',
        title: 'Customer Community Platform',
        description: 'Create peer-to-peer support and engagement',
        priority: 'medium',
        estimatedCost: '$2,000-$4,000',
        timeframe: '6-8 weeks',
        kpis: ['Community members', 'Active participation', 'NPS score'],
        implementation: [
          'Choose community platform (Slack, Circle, Discord)',
          'Create community guidelines and structure',
          'Recruit customer champions and moderators',
          'Plan weekly discussion topics and events',
          'Measure engagement and gather feedback'
        ]
      }
    ]
  },

  // E-COMMERCE GROWTH
  {
    id: 'ecommerce-growth',
    name: 'E-commerce Growth Accelerator',
    description: 'Drive online sales through multi-channel marketing',
    category: 'growth-strategy',
    industry: ['E-commerce', 'Retail', 'DTC'],
    icon: '🛒',
    estimatedBudget: '$8,000-$25,000/month',
    timeline: '3-6 months',
    expectedROI: '4-6x',
    tactics: [
      {
        id: 'abandoned-cart',
        title: 'Abandoned Cart Recovery',
        description: 'Recover lost sales through automated sequences',
        priority: 'high',
        estimatedCost: '$1,000-$2,000',
        timeframe: '1-2 weeks',
        kpis: ['Recovery rate', 'Recovered revenue', 'Email open rate'],
        implementation: [
          'Set up cart abandonment tracking',
          'Create 3-email recovery sequence',
          'Add discount incentive for hesitant buyers',
          'Implement SMS recovery for high-value carts',
          'A/B test timing and messaging'
        ]
      },
      {
        id: 'google-shopping',
        title: 'Google Shopping Campaigns',
        description: 'Drive qualified traffic through product ads',
        priority: 'high',
        estimatedCost: '$5,000-$15,000',
        timeframe: '2-4 weeks',
        kpis: ['ROAS', 'Conversion rate', 'CPA'],
        implementation: [
          'Optimize product feed for Google Merchant Center',
          'Create product groups and bidding strategy',
          'Set up conversion tracking',
          'Test Performance Max campaigns',
          'Optimize based on product performance data'
        ]
      },
      {
        id: 'influencer-partnerships',
        title: 'Influencer Marketing Program',
        description: 'Partner with influencers for product promotion',
        priority: 'medium',
        estimatedCost: '$3,000-$10,000',
        timeframe: '4-8 weeks',
        kpis: ['Influencer ROI', 'Brand mentions', 'Attributed sales'],
        implementation: [
          'Identify relevant micro-influencers (10k-100k followers)',
          'Create partnership offers (commission, free products)',
          'Set up unique discount codes for tracking',
          'Provide product and creative guidelines',
          'Measure performance and scale winners'
        ]
      }
    ]
  },

  // STARTUP LAUNCH
  {
    id: 'startup-launch',
    name: 'Startup Launch Strategy',
    description: 'Go-to-market plan for new product launches',
    category: 'growth-strategy',
    industry: ['Startups', 'New Products'],
    icon: '🎉',
    estimatedBudget: '$5,000-$15,000',
    timeline: '2-3 months',
    expectedROI: '3-5x',
    tactics: [
      {
        id: 'beta-program',
        title: 'Beta User Program',
        description: 'Build initial user base and gather feedback',
        priority: 'high',
        estimatedCost: '$1,000-$3,000',
        timeframe: '4-6 weeks',
        kpis: ['Beta signups', 'Feedback collected', 'Early adopter retention'],
        implementation: [
          'Create beta landing page and application form',
          'Recruit 50-100 beta users from target audience',
          'Set up feedback collection system',
          'Offer early adopter perks and lifetime deals',
          'Create beta user community'
        ]
      },
      {
        id: 'product-hunt-launch',
        title: 'Product Hunt Launch',
        description: 'Generate buzz and early traction',
        priority: 'high',
        estimatedCost: '$2,000-$5,000',
        timeframe: '2-3 weeks',
        kpis: ['Upvotes', 'Comments', 'Signups from PH'],
        implementation: [
          'Build relationships with Product Hunt community',
          'Create compelling product video and screenshots',
          'Coordinate launch timing (Tuesday-Thursday)',
          'Rally team and supporters for upvotes',
          'Respond to all comments within first 24 hours'
        ]
      },
      {
        id: 'launch-content',
        title: 'Launch Content Blitz',
        description: 'Create pre-launch and launch day content',
        priority: 'medium',
        estimatedCost: '$2,000-$5,000',
        timeframe: '3-4 weeks',
        kpis: ['Content reach', 'Social engagement', 'Traffic generated'],
        implementation: [
          'Write founder story blog post',
          'Create launch announcement email',
          'Design social media content calendar',
          'Pitch story to tech journalists',
          'Create demo videos and explainers'
        ]
      }
    ]
  }
];

export function getTemplatesByCategory(category: string): PlaybookTemplate[] {
  if (category === 'all') return playbookTemplates;
  return playbookTemplates.filter(t => t.category === category);
}

export function getTemplatesByIndustry(industry: string): PlaybookTemplate[] {
  return playbookTemplates.filter(t =>
    !t.industry || t.industry.includes(industry) || t.industry.includes('All Industries')
  );
}

export function getTemplateById(id: string): PlaybookTemplate | undefined {
  return playbookTemplates.find(t => t.id === id);
}

export function getCategoryCounts() {
  return {
    'growth-strategy': playbookTemplates.filter(t => t.category === 'growth-strategy').length,
    'demand-generation': playbookTemplates.filter(t => t.category === 'demand-generation').length,
    'brand-positioning': playbookTemplates.filter(t => t.category === 'brand-positioning').length,
    'content-marketing': playbookTemplates.filter(t => t.category === 'content-marketing').length,
    'competitive-analysis': playbookTemplates.filter(t => t.category === 'competitive-analysis').length,
    'customer-retention': playbookTemplates.filter(t => t.category === 'customer-retention').length,
  };
}
