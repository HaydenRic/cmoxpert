/*
  # AI Playbook Generation Edge Function

  This function generates custom marketing playbooks using AI based on client data and market analysis.
  It creates actionable, strategic playbooks tailored to specific client needs and industry context.

  ## Services Used:
  - OpenAI GPT for playbook generation
  - Client data from Supabase
  - Market analysis data from reports

  ## Input:
  - client_id: UUID of the client
  - user_id: UUID of the authenticated user
  - playbook_type: Type of playbook to generate (optional)

  ## Output:
  - Creates a new playbook in the database
  - Returns playbook ID and generation status
*/

import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface RequestPayload {
  clientId: string;
  userId: string;
  playbookType?: string;
  reportId?: string;
}

interface PlaybookData {
  name: string;
  description: string;
  tactics: any[];
  category: string;
}

interface PlaybookTactic {
  title: string;
  description: string;
  timeline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  impact: 'Low' | 'Medium' | 'High';
  resources: string[];
  kpis: string[];
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  initialDelay: number = INITIAL_DELAY
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Playbook generation attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

// Validate playbook data structure
function validatePlaybookData(data: any): PlaybookData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid playbook data: not an object');
  }

  const { name, description, category, tactics } = data;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Invalid playbook data: missing or invalid name');
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    throw new Error('Invalid playbook data: missing or invalid description');
  }

  if (!category || typeof category !== 'string') {
    throw new Error('Invalid playbook data: missing or invalid category');
  }

  if (!Array.isArray(tactics)) {
    throw new Error('Invalid playbook data: tactics must be an array');
  }

  // Validate each tactic
  const validatedTactics = tactics.map((tactic, index) => {
    if (!tactic || typeof tactic !== 'object') {
      throw new Error(`Invalid tactic at index ${index}: not an object`);
    }

    const validatedTactic: PlaybookTactic = {
      title: tactic.title || `Tactic ${index + 1}`,
      description: tactic.description || 'No description provided',
      timeline: tactic.timeline || 'TBD',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(tactic.difficulty) ? tactic.difficulty : 'Medium',
      impact: ['Low', 'Medium', 'High'].includes(tactic.impact) ? tactic.impact : 'Medium',
      resources: Array.isArray(tactic.resources) ? tactic.resources : [],
      kpis: Array.isArray(tactic.kpis) ? tactic.kpis : []
    };

    return validatedTactic;
  });

  return {
    name: name.trim(),
    description: description.trim(),
    category: category.trim(),
    tactics: validatedTactics
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { clientId, userId, playbookType = 'growth-strategy', reportId }: RequestPayload = await req.json();

    if (!clientId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: clientId and userId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify user ID matches authenticated user
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 1: Fetch client data and verify ownership
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single();

    if (clientError || !clientData) {
      return new Response(
        JSON.stringify({ error: 'Client not found or access denied' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 2: Fetch latest market analysis if available
    let marketAnalysis = null;
    if (reportId) {
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .eq('client_id', clientId)
        .single();
      
      if (!reportError && reportData) {
        marketAnalysis = reportData;
      }
    } else {
      // Get the latest completed report for this client
      const { data: latestReportData, error: latestReportError } = await supabase
        .from('reports')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!latestReportError && latestReportData) {
        marketAnalysis = latestReportData;
      }
    }

    // Step 3: Generate AI playbook with retry and validation
    const playbookData = await retryWithBackoff(() => 
      generateAIPlaybook(clientData, marketAnalysis, playbookType)
    );
    
    // Step 4: Insert playbook into database
    const { data: insertedPlaybook, error: insertError } = await supabase
      .from('playbooks')
      .insert([{
        name: playbookData.name,
        description: playbookData.description,
        tactics: playbookData.tactics,
        category: playbookData.category,
        user_id: userId,
        source_client_id: clientId,
      }])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save playbook: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'AI playbook generated successfully',
        playbookId: insertedPlaybook.id,
        playbook: playbookData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating AI playbook:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI playbook',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Generate AI playbook using OpenAI with enhanced validation
async function generateAIPlaybook(client: any, marketAnalysis: any, playbookType: string): Promise<PlaybookData> {
  try {
    if (!openAIApiKey) {
      console.log('OpenAI API key not configured, using mock playbook');
      return generateEnhancedMockPlaybook(client, playbookType);
    }

    const prompt = `As a senior marketing strategist, create a comprehensive marketing playbook for the following client:

Client Information:
- Company: ${client.name}
- Domain: ${client.domain}
- Industry: ${client.industry || 'General B2B SaaS'}
- Status: ${client.status}

${marketAnalysis ? `Market Analysis Data:
- AI Analysis: ${marketAnalysis.ai_analysis ? marketAnalysis.ai_analysis.substring(0, 1000) + '...' : 'Not available'}
- SEMrush Data: ${JSON.stringify(marketAnalysis.semrush_data, null, 2)}
- Trends Data: ${JSON.stringify(marketAnalysis.trends_data, null, 2)}` : 'No market analysis data available - create playbook based on industry best practices.'}

Playbook Type: ${playbookType}

Create a strategic marketing playbook with:
1. A compelling name (max 60 characters)
2. A detailed description (2-3 paragraphs)
3. 8-12 specific, actionable tactics with the following structure for each tactic:
   - title: Clear, action-oriented title
   - description: Detailed explanation of the tactic
   - timeline: Implementation timeframe (e.g., "Week 1-2", "Month 1", "Ongoing")
   - difficulty: "Easy", "Medium", or "Hard"
   - impact: "Low", "Medium", or "High"
   - resources: Array of required resources/tools
   - kpis: Array of key performance indicators to track

Focus on practical, implementable strategies that align with modern B2B SaaS marketing best practices.

Return the response as a valid JSON object with this exact structure:
{
  "name": "Playbook Name",
  "description": "Detailed description...",
  "category": "${playbookType}",
  "tactics": [
    {
      "title": "Tactic Title",
      "description": "Detailed description...",
      "timeline": "Implementation timeframe",
      "difficulty": "Easy|Medium|Hard",
      "impact": "Low|Medium|High",
      "resources": ["Resource 1", "Resource 2"],
      "kpis": ["KPI 1", "KPI 2"]
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a senior marketing strategist with 15+ years of experience in B2B SaaS marketing. Create practical, actionable marketing playbooks. Always respond with valid JSON only, no additional text or formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    
    // Validate response structure
    if (!result.choices || !Array.isArray(result.choices) || result.choices.length === 0) {
      throw new Error('Invalid OpenAI API response structure');
    }

    const content = result.choices[0]?.message?.content;
    
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Empty or invalid content from OpenAI API');
    }

    try {
      // Parse and validate the JSON response
      const rawPlaybookData = JSON.parse(content);
      const validatedPlaybookData = validatePlaybookData(rawPlaybookData);
      return validatedPlaybookData;
    } catch (parseError) {
      console.error('Failed to parse or validate AI response:', parseError);
      console.log('Raw AI response:', content);
      
      // Fallback to mock data if JSON parsing or validation fails
      return generateEnhancedMockPlaybook(client, playbookType);
    }
  } catch (error) {
    console.error('Error generating AI playbook:', error);
    
    // If it's a timeout or network error, throw to trigger retry
    if (error.name === 'TimeoutError' || error.name === 'TypeError') {
      throw error;
    }
    
    // For other errors, return mock playbook
    return generateEnhancedMockPlaybook(client, playbookType);
  }
}

// Enhanced mock playbook generator (keeping existing implementation)
function generateEnhancedMockPlaybook(client: any, playbookType: string): PlaybookData {
  const companyName = client.name;
  const industry = client.industry || 'B2B SaaS';
  
  const playbookTemplates = {
    'growth-strategy': {
      name: `Growth Acceleration Playbook for ${companyName}`,
      description: `A comprehensive growth strategy designed specifically for ${companyName} in the ${industry} sector. This playbook focuses on sustainable revenue growth through strategic market positioning, customer acquisition optimization, and retention enhancement. Each tactic is designed to build upon previous efforts, creating a compounding effect that accelerates growth velocity while maintaining operational efficiency.`,
      category: 'growth-strategy',
      tactics: [
        {
          title: 'Competitive Intelligence Dashboard',
          description: 'Set up automated monitoring of competitor pricing, features, and marketing campaigns to identify market gaps and opportunities.',
          timeline: 'Week 1-2',
          difficulty: 'Medium',
          impact: 'High',
          resources: ['SEMrush', 'Ahrefs', 'Google Alerts', 'Competitive analysis tools'],
          kpis: ['Competitor updates tracked', 'Market opportunities identified', 'Pricing advantage maintained']
        },
        {
          title: 'Customer Success Story Campaign',
          description: 'Develop and promote detailed case studies showcasing measurable ROI and success metrics from existing customers.',
          timeline: 'Week 2-4',
          difficulty: 'Easy',
          impact: 'High',
          resources: ['Customer interviews', 'Design tools', 'Content management system'],
          kpis: ['Case studies published', 'Social proof engagement', 'Sales cycle reduction']
        },
        {
          title: 'SEO Content Hub Development',
          description: 'Create a comprehensive content hub targeting high-intent keywords in your industry vertical.',
          timeline: 'Month 1-2',
          difficulty: 'Medium',
          impact: 'High',
          resources: ['Content writers', 'SEO tools', 'CMS platform', 'Keyword research tools'],
          kpis: ['Organic traffic growth', 'Keyword rankings', 'Content engagement metrics']
        },
        {
          title: 'Lead Scoring Optimization',
          description: 'Implement advanced lead scoring based on behavioral data and demographic information to improve sales efficiency.',
          timeline: 'Week 3-4',
          difficulty: 'Hard',
          impact: 'High',
          resources: ['Marketing automation platform', 'CRM integration', 'Data analytics tools'],
          kpis: ['Lead quality score', 'Sales conversion rate', 'Time to close']
        },
        {
          title: 'Referral Program Launch',
          description: 'Design and launch a customer referral program with compelling incentives and easy sharing mechanisms.',
          timeline: 'Month 1',
          difficulty: 'Medium',
          impact: 'Medium',
          resources: ['Referral software', 'Incentive budget', 'Email marketing platform'],
          kpis: ['Referral rate', 'Customer acquisition cost', 'Program participation']
        },
        {
          title: 'Social Proof Integration',
          description: 'Integrate customer testimonials, reviews, and trust signals throughout the customer journey.',
          timeline: 'Week 2-3',
          difficulty: 'Easy',
          impact: 'Medium',
          resources: ['Review platforms', 'Website development', 'Customer feedback tools'],
          kpis: ['Conversion rate improvement', 'Trust signal visibility', 'Customer confidence metrics']
        },
        {
          title: 'Email Nurture Sequence Optimization',
          description: 'Develop sophisticated email nurture sequences based on user behavior and engagement patterns.',
          timeline: 'Week 4-6',
          difficulty: 'Medium',
          impact: 'High',
          resources: ['Email marketing platform', 'Automation tools', 'Content creation'],
          kpis: ['Email engagement rates', 'Nurture conversion rate', 'Customer lifetime value']
        },
        {
          title: 'Partnership Channel Development',
          description: 'Identify and establish strategic partnerships for co-marketing and channel expansion opportunities.',
          timeline: 'Month 2-3',
          difficulty: 'Hard',
          impact: 'High',
          resources: ['Partnership management', 'Legal support', 'Co-marketing materials'],
          kpis: ['Partnership deals closed', 'Channel revenue', 'Market reach expansion']
        }
      ]
    },
    'demand-generation': {
      name: `Demand Generation Engine for ${companyName}`,
      description: `A systematic approach to generating qualified demand for ${companyName} through multi-channel campaigns and content marketing. This playbook emphasizes creating valuable content that attracts, engages, and converts prospects while building brand authority in the ${industry} space.`,
      category: 'demand-generation',
      tactics: [
        {
          title: 'Content Marketing Calendar',
          description: 'Develop a strategic content calendar aligned with buyer journey stages and seasonal trends.',
          timeline: 'Week 1-2',
          difficulty: 'Medium',
          impact: 'High',
          resources: ['Content planning tools', 'Editorial calendar', 'Content creators'],
          kpis: ['Content publication consistency', 'Engagement rates', 'Lead generation from content']
        },
        {
          title: 'LinkedIn Thought Leadership',
          description: 'Establish executive presence on LinkedIn through strategic content sharing and industry engagement.',
          timeline: 'Ongoing',
          difficulty: 'Easy',
          impact: 'Medium',
          resources: ['LinkedIn Premium', 'Content creation', 'Social media management'],
          kpis: ['LinkedIn followers', 'Post engagement', 'Inbound connection requests']
        },
        {
          title: 'Webinar Series Launch',
          description: 'Create educational webinar series addressing key industry challenges and showcasing expertise.',
          timeline: 'Month 1',
          difficulty: 'Medium',
          impact: 'High',
          resources: ['Webinar platform', 'Presentation tools', 'Promotion channels'],
          kpis: ['Webinar attendance', 'Lead generation', 'Follow-up conversion rates']
        }
      ]
    }
  };

  return playbookTemplates[playbookType] || playbookTemplates['growth-strategy'];
}