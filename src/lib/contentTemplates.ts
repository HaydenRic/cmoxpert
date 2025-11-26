export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'blog' | 'social' | 'email' | 'ad' | 'landing' | 'press';
  icon: string;
  tone: string;
  length: string;
  promptTemplate: string;
  titleSuggestions: string[];
  keywords: string[];
  exampleOutput?: string;
}

export const contentTemplates: ContentTemplate[] = [
  // BLOG POST TEMPLATES
  {
    id: 'blog-how-to',
    name: 'How-To Guide',
    description: 'Step-by-step tutorial that solves a specific problem',
    category: 'blog',
    icon: '📚',
    tone: 'educational',
    length: 'long',
    promptTemplate: 'Write a comprehensive how-to guide about {topic}. Include step-by-step instructions, screenshots suggestions, and best practices. Focus on actionable advice that readers can implement immediately.',
    titleSuggestions: [
      'How to {Action} in {Timeframe}',
      'The Complete Guide to {Topic}',
      '{Number} Steps to {Outcome}'
    ],
    keywords: ['tutorial', 'guide', 'how-to', 'step-by-step']
  },
  {
    id: 'blog-listicle',
    name: 'Listicle',
    description: 'Numbered list of tips, tools, or strategies',
    category: 'blog',
    icon: '📝',
    tone: 'conversational',
    length: 'medium',
    promptTemplate: 'Create an engaging listicle about {topic}. Make it scannable with clear headers, brief explanations, and actionable takeaways for each point.',
    titleSuggestions: [
      '{Number} Ways to {Action}',
      '{Number} {Tools/Tips} Every {Audience} Needs',
      'Top {Number} {Topic} for {Year}'
    ],
    keywords: ['list', 'tips', 'best']
  },
  {
    id: 'blog-case-study',
    name: 'Case Study',
    description: 'Real-world success story with data and results',
    category: 'blog',
    icon: '📊',
    tone: 'professional',
    length: 'long',
    promptTemplate: 'Write a compelling case study about {topic}. Include: Challenge, Solution, Implementation, Results (with specific metrics), and Key Takeaways.',
    titleSuggestions: [
      'How {Company} Achieved {Result}',
      'Case Study: {Metric}% Increase in {KPI}',
      '{Company}\'s Journey to {Outcome}'
    ],
    keywords: ['case study', 'success', 'results', 'ROI']
  },
  {
    id: 'blog-thought-leadership',
    name: 'Thought Leadership',
    description: 'Expert opinion on industry trends and future',
    category: 'blog',
    icon: '💡',
    tone: 'authoritative',
    length: 'long',
    promptTemplate: 'Write a thought leadership piece about {topic}. Share unique insights, challenge conventional wisdom, and predict future trends. Establish expertise and authority.',
    titleSuggestions: [
      'The Future of {Industry}',
      'Why {Belief} is Wrong About {Topic}',
      '{Number} Predictions for {Industry} in {Year}'
    ],
    keywords: ['future', 'trends', 'innovation', 'prediction']
  },
  {
    id: 'blog-comparison',
    name: 'Product Comparison',
    description: 'Side-by-side comparison of solutions',
    category: 'blog',
    icon: '⚖️',
    tone: 'professional',
    length: 'medium',
    promptTemplate: 'Create an unbiased comparison of {topic}. Include feature comparison table, pros/cons, pricing, and recommendations for different use cases.',
    titleSuggestions: [
      '{Product A} vs {Product B}: Which is Best?',
      '{Number} {Category} Compared',
      'Best {Product} for {Use Case}'
    ],
    keywords: ['vs', 'comparison', 'review', 'best']
  },

  // SOCIAL MEDIA TEMPLATES
  {
    id: 'social-engagement',
    name: 'Engagement Post',
    description: 'Post designed to spark conversation and comments',
    category: 'social',
    icon: '💬',
    tone: 'conversational',
    length: 'short',
    promptTemplate: 'Create an engaging social media post about {topic}. Ask a compelling question, share a hot take, or start a discussion. Include emojis and a clear call-to-action.',
    titleSuggestions: [
      'Question: {Question}?',
      'Hot Take: {Opinion}',
      'Agree or Disagree: {Statement}'
    ],
    keywords: ['question', 'thoughts', 'opinion', 'discuss']
  },
  {
    id: 'social-tip',
    name: 'Quick Tip',
    description: 'Bite-sized valuable advice or hack',
    category: 'social',
    icon: '💡',
    tone: 'friendly',
    length: 'short',
    promptTemplate: 'Share a quick, actionable tip about {topic}. Make it specific, practical, and immediately useful. Use emojis and formatting for visual appeal.',
    titleSuggestions: [
      '💡 Pro Tip: {Tip}',
      'Quick Win: {Action}',
      'Try This: {Advice}'
    ],
    keywords: ['tip', 'hack', 'trick', 'advice']
  },
  {
    id: 'social-story',
    name: 'Story/Behind-The-Scenes',
    description: 'Personal story or company culture post',
    category: 'social',
    icon: '🎬',
    tone: 'friendly',
    length: 'short',
    promptTemplate: 'Tell an authentic story about {topic}. Make it personal, relatable, and human. Share challenges, lessons, or celebrations.',
    titleSuggestions: [
      'Behind the scenes: {Event}',
      'Story time: {Experience}',
      'Here\'s what happened when {Situation}'
    ],
    keywords: ['story', 'behind-the-scenes', 'culture', 'team']
  },
  {
    id: 'social-announcement',
    name: 'Announcement',
    description: 'News, updates, or product launches',
    category: 'social',
    icon: '📣',
    tone: 'professional',
    length: 'short',
    promptTemplate: 'Announce {topic} in an exciting way. Build anticipation, highlight key benefits, and include a clear next step.',
    titleSuggestions: [
      '🚀 Launching: {Product}',
      '📢 Big News: {Announcement}',
      '🎉 Introducing: {Feature}'
    ],
    keywords: ['launch', 'new', 'announcing', 'introducing']
  },
  {
    id: 'social-stats',
    name: 'Data/Stats Post',
    description: 'Share surprising statistics or research',
    category: 'social',
    icon: '📊',
    tone: 'professional',
    length: 'short',
    promptTemplate: 'Share a compelling statistic about {topic}. Include the number, context, source, and why it matters. Make it visually appealing with emojis.',
    titleSuggestions: [
      '📊 {Metric}% of {Audience} {Action}',
      'Surprising stat: {Statistic}',
      'Did you know? {Fact}'
    ],
    keywords: ['stat', 'data', 'research', 'study']
  },

  // EMAIL TEMPLATES
  {
    id: 'email-welcome',
    name: 'Welcome Email',
    description: 'First email to new subscribers or customers',
    category: 'email',
    icon: '👋',
    tone: 'friendly',
    length: 'short',
    promptTemplate: 'Write a warm welcome email for {topic}. Thank them, set expectations, provide immediate value, and guide them to the first action.',
    titleSuggestions: [
      'Welcome to {Company}! Here\'s what to expect',
      'Thanks for joining! Your next steps',
      'You\'re in! Let\'s get started'
    ],
    keywords: ['welcome', 'getting started', 'first steps']
  },
  {
    id: 'email-newsletter',
    name: 'Newsletter',
    description: 'Regular update with news and content',
    category: 'email',
    icon: '📰',
    tone: 'conversational',
    length: 'medium',
    promptTemplate: 'Create a newsletter about {topic}. Include: headline story, 2-3 quick updates, featured content, and a call-to-action. Keep it scannable.',
    titleSuggestions: [
      '{Month} Newsletter: {Theme}',
      'This Week in {Topic}',
      '{Number} Updates You Don\'t Want to Miss'
    ],
    keywords: ['newsletter', 'updates', 'roundup']
  },
  {
    id: 'email-promotion',
    name: 'Promotional Email',
    description: 'Sales or limited-time offer email',
    category: 'email',
    icon: '🎁',
    tone: 'urgent',
    length: 'short',
    promptTemplate: 'Write a compelling promotional email about {topic}. Highlight value, create urgency, address objections, and include a clear CTA with deadline.',
    titleSuggestions: [
      '🔥 {Discount}% Off - Limited Time',
      'Last Chance: {Offer} Ends Soon',
      'Special Offer: {Benefit}'
    ],
    keywords: ['sale', 'offer', 'discount', 'limited']
  },
  {
    id: 'email-reengagement',
    name: 'Re-engagement',
    description: 'Win back inactive subscribers',
    category: 'email',
    icon: '🔄',
    tone: 'friendly',
    length: 'short',
    promptTemplate: 'Create a re-engagement email for {topic}. Acknowledge their absence, remind them of value, offer an incentive, and make it easy to return.',
    titleSuggestions: [
      'We miss you! Come back for {Incentive}',
      'Still interested in {Topic}?',
      'One last thing before you go...'
    ],
    keywords: ['miss you', 'come back', 'inactive']
  },

  // AD COPY TEMPLATES
  {
    id: 'ad-google-search',
    name: 'Google Search Ad',
    description: 'Text ad for Google search results',
    category: 'ad',
    icon: '🔍',
    tone: 'professional',
    length: 'short',
    promptTemplate: 'Write Google Search ad copy for {topic}. Create: Headline 1 (30 chars), Headline 2 (30 chars), Headline 3 (30 chars), Description 1 (90 chars), Description 2 (90 chars). Focus on benefits and include CTA.',
    titleSuggestions: [
      '{Benefit} | {Company}',
      'Get {Outcome} Today',
      '{Solution} for {Problem}'
    ],
    keywords: ['search', 'google ads', 'ppc']
  },
  {
    id: 'ad-facebook',
    name: 'Facebook/Instagram Ad',
    description: 'Social media ad with image or video',
    category: 'ad',
    icon: '📱',
    tone: 'conversational',
    length: 'short',
    promptTemplate: 'Create Facebook/Instagram ad copy for {topic}. Write: Eye-catching hook, benefit-focused body, and strong CTA. Keep it concise and emoji-friendly.',
    titleSuggestions: [
      '{Problem}? Try {Solution}',
      'Stop {Pain Point}. Start {Benefit}',
      '{Number}x Your {Metric}'
    ],
    keywords: ['facebook', 'instagram', 'social ads']
  },
  {
    id: 'ad-linkedin',
    name: 'LinkedIn Ad',
    description: 'B2B professional platform ad',
    category: 'ad',
    icon: '💼',
    tone: 'professional',
    length: 'short',
    promptTemplate: 'Write LinkedIn ad copy for {topic}. Target B2B decision-makers with: credible hook, business value, social proof, and professional CTA.',
    titleSuggestions: [
      'Help Your Team {Outcome}',
      '{Metric}% of {Industry} Leaders Use {Product}',
      'Enterprise {Solution} for {Problem}'
    ],
    keywords: ['b2b', 'enterprise', 'linkedin']
  },

  // LANDING PAGE TEMPLATES
  {
    id: 'landing-saas',
    name: 'SaaS Landing Page',
    description: 'Product landing page for software',
    category: 'landing',
    icon: '💻',
    tone: 'professional',
    length: 'long',
    promptTemplate: 'Create SaaS landing page copy for {topic}. Include: Hero headline, subheadline, key features (3-5), benefits, social proof, FAQ section, and CTA.',
    titleSuggestions: [
      '{Outcome} in {Timeframe}',
      'The {Adjective} Way to {Action}',
      '{Problem}? Solved.'
    ],
    keywords: ['software', 'platform', 'tool', 'solution']
  },
  {
    id: 'landing-webinar',
    name: 'Webinar Registration',
    description: 'Page to drive webinar signups',
    category: 'landing',
    icon: '🎥',
    tone: 'educational',
    length: 'medium',
    promptTemplate: 'Write webinar landing page copy for {topic}. Include: Compelling headline, what attendees will learn, speaker credibility, date/time, and registration CTA.',
    titleSuggestions: [
      'Free Webinar: {Topic}',
      'Learn How to {Outcome}',
      'Master {Skill} in {Timeframe}'
    ],
    keywords: ['webinar', 'workshop', 'training', 'learn']
  },
  {
    id: 'landing-ebook',
    name: 'eBook Download',
    description: 'Lead magnet landing page',
    category: 'landing',
    icon: '📚',
    tone: 'educational',
    length: 'medium',
    promptTemplate: 'Create eBook landing page copy for {topic}. Highlight: What\'s inside, key takeaways, who it\'s for, and what readers will achieve. Include preview images.',
    titleSuggestions: [
      'Free Guide: {Topic}',
      'Download: {Title}',
      'Get Your Free {Resource}'
    ],
    keywords: ['ebook', 'guide', 'download', 'free']
  },

  // PRESS RELEASE TEMPLATES
  {
    id: 'press-product-launch',
    name: 'Product Launch',
    description: 'Announce new product or feature',
    category: 'press',
    icon: '🚀',
    tone: 'professional',
    length: 'medium',
    promptTemplate: 'Write a press release for {topic} product launch. Include: headline, dateline, opening paragraph (who, what, when, where, why), product details, quote from executive, company boilerplate.',
    titleSuggestions: [
      '{Company} Launches {Product}',
      '{Company} Unveils Revolutionary {Solution}',
      'Introducing {Product}: {Benefit}'
    ],
    keywords: ['launch', 'announce', 'unveil', 'introduce']
  },
  {
    id: 'press-funding',
    name: 'Funding Announcement',
    description: 'Announce investment or acquisition',
    category: 'press',
    icon: '💰',
    tone: 'professional',
    length: 'medium',
    promptTemplate: 'Write a press release for {topic} funding announcement. Include: headline, funding amount, investors, what funds will be used for, company traction, and executive quote.',
    titleSuggestions: [
      '{Company} Raises {Amount} Series {Round}',
      '{Company} Secures {Amount} in Funding',
      '{Investor} Invests in {Company}'
    ],
    keywords: ['funding', 'investment', 'series', 'raised']
  }
];

export function getTemplatesByCategory(category: string): ContentTemplate[] {
  if (category === 'all') return contentTemplates;
  return contentTemplates.filter(t => t.category === category);
}

export function getTemplateById(id: string): ContentTemplate | undefined {
  return contentTemplates.find(t => t.id === id);
}

export function getCategoryCounts() {
  return {
    blog: contentTemplates.filter(t => t.category === 'blog').length,
    social: contentTemplates.filter(t => t.category === 'social').length,
    email: contentTemplates.filter(t => t.category === 'email').length,
    ad: contentTemplates.filter(t => t.category === 'ad').length,
    landing: contentTemplates.filter(t => t.category === 'landing').length,
    press: contentTemplates.filter(t => t.category === 'press').length,
  };
}
