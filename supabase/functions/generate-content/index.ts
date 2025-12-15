/*
  # AI Content Generation Edge Function

  This function generates marketing content using OpenAI GPT-4.
  It creates various content types: blog posts, social media, emails, ads, etc.

  ## Services Used:
  - OpenAI GPT-4 for content generation
  - Client data from Supabase
  - Brand voice and style preferences

  ## Input:
  - user_id: UUID of the authenticated user
  - client_id: UUID of the client (optional)
  - content_type: Type of content to generate
  - title: Title/topic for the content
  - prompt: Additional requirements
  - tone: Desired tone (professional, friendly, etc.)
  - length: Content length (short, medium, long)
  - keywords: Keywords to include (optional)

  ## Output:
  - Creates new generated_content record in database
  - Returns content ID and generated text
*/

import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface RequestPayload {
  userId: string;
  clientId?: string;
  contentType: string;
  title: string;
  prompt: string;
  tone: string;
  length: string;
  keywords?: string;
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
      console.log(`Content generation attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError!;
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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Extract user's JWT from Authorization header for RLS
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey, { global: { headers: { Authorization: authHeader } } });

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

    const payload: RequestPayload = await req.json();
    const { userId, clientId, contentType, title, prompt, tone, length, keywords } = payload;

    if (!userId || !contentType || !title) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, contentType, and title' }),
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

    // Get client data if provided
    let clientData = null;
    if (clientId) {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('user_id', userId)
        .single();

      if (clientError) {
        return new Response(
          JSON.stringify({ error: 'Client not found or access denied' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      clientData = client;
    }

    // Generate content with retry
    const generatedContent = await retryWithBackoff(() =>
      generateAIContent(clientData, payload)
    );

    // Save to database
    const { data: insertedContent, error: insertError } = await supabase
      .from('generated_content')
      .insert([{
        user_id: userId,
        client_id: clientId || null,
        content_type: contentType,
        title: title,
        content: generatedContent,
        ai_prompt: prompt,
        status: 'draft'
      }])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save content: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Content generated successfully',
        contentId: insertedContent.id,
        content: generatedContent
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating content:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to generate content',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Generate AI content using OpenAI
async function generateAIContent(client: any, payload: RequestPayload): Promise<string> {
  try {
    if (!openAIApiKey) {
      console.log('OpenAI API key not configured, using template content');
      return generateTemplateContent(payload);
    }

    const wordCountMap = {
      'short': '300-500 words',
      'medium': '500-1000 words',
      'long': '1000-1500 words'
    };

    const contentTypeMap = {
      'blog_post': 'blog post',
      'social_media_post': 'social media post (LinkedIn or Twitter)',
      'email_copy': 'email marketing copy',
      'ad_copy': 'advertising copy',
      'landing_page': 'landing page copy',
      'press_release': 'press release'
    };

    const clientContext = client
      ? `\n\nClient Context:\n- Company: ${client.name}\n- Domain: ${client.domain}\n- Industry: ${client.industry || 'B2B SaaS'}\n- Status: ${client.status}`
      : '\n\nGeneral B2B SaaS context';

    const systemPrompt = `You are a professional B2B SaaS marketing copywriter with 15+ years of experience. You create compelling, conversion-focused content that drives engagement and results. Your writing is clear, persuasive, and tailored to the target audience.`;

    const userPrompt = `Create a ${contentTypeMap[payload.contentType] || payload.contentType} with the following requirements:

Title/Topic: ${payload.title}

Tone: ${payload.tone}
Length: ${wordCountMap[payload.length] || payload.length}
${payload.keywords ? `Keywords to include: ${payload.keywords}` : ''}
${clientContext}

Additional Requirements:
${payload.prompt}

Guidelines:
1. Write compelling, engaging content that captures attention
2. Use clear, concise language appropriate for B2B SaaS audience
3. Include relevant statistics or data points when applicable
4. End with a strong call-to-action
5. Format with proper headings, bullet points, and paragraphs
6. Optimize for readability and engagement
7. Match the specified tone throughout

Return only the content itself, no meta-commentary or explanations.`;

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    if (!result.choices || !Array.isArray(result.choices) || result.choices.length === 0) {
      throw new Error('Invalid OpenAI API response structure');
    }

    const content = result.choices[0]?.message?.content;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Empty or invalid content from OpenAI API');
    }

    return content.trim();
  } catch (error) {
    console.error('Error generating AI content:', error);

    // If it's a timeout or network error, throw to trigger retry
    if (error.name === 'TimeoutError' || error.name === 'TypeError') {
      throw error;
    }

    // For other errors, return template content
    return generateTemplateContent(payload);
  }
}

// Generate template-based content (fallback)
function generateTemplateContent(payload: RequestPayload): string {
  const templates = {
    blog_post: `# ${payload.title}

## Introduction

In today's competitive B2B SaaS landscape, companies are constantly seeking innovative solutions to streamline their operations and drive growth. This comprehensive guide explores the latest trends and strategies that can help your business stay ahead of the curve.

## Key Benefits

### 1. Enhanced Productivity
Our research shows that implementing the right tools can increase team productivity by up to 40%. This significant improvement comes from:
- Automated workflow processes
- Streamlined communication channels
- Real-time collaboration features

### 2. Cost Optimization
Smart businesses are reducing operational costs while maintaining quality through:
- Efficient resource allocation
- Automated reporting systems
- Data-driven decision making

### 3. Scalable Growth
Future-proof your business with solutions that grow with you:
- Flexible pricing models
- Enterprise-grade infrastructure
- Seamless integrations

## Best Practices

1. **Start with clear objectives** - Define what success looks like for your team
2. **Involve stakeholders early** - Get buy-in from key decision-makers
3. **Measure and optimize** - Track KPIs and continuously improve

## Conclusion

By following these strategies and leveraging modern tools, your business can achieve sustainable growth while maintaining operational efficiency. The key is to start small, measure results, and scale what works.

**Ready to transform your operations?** Contact us today to learn how we can help you achieve your business goals.`,

    social_media_post: `${payload.title}

In today's fast-paced B2B world, staying ahead means working smarter, not harder.

Here are 3 strategies that top performers use:

🎯 Focus on high-impact activities
⚡ Automate repetitive tasks
📊 Make data-driven decisions

The result? 40% more productivity with less stress.

What's your go-to productivity hack? Share below! 👇

#B2BSaaS #Productivity #BusinessGrowth`,

    email_copy: `Subject: ${payload.title}

Hi there,

Are you struggling with [specific pain point]? You're not alone.

Most B2B SaaS companies face this challenge, but the ones that succeed do three things differently:

1. They automate repetitive processes
2. They focus on data-driven decisions
3. They continuously optimize their workflows

The difference? These companies see 40% better results with less effort.

We've helped [number] companies achieve similar results, and we can help you too.

**Here's what we're offering:**

• Free consultation to assess your current processes
• Custom strategy tailored to your business goals
• Proven frameworks that deliver results

Ready to transform how your team works?

Click here to schedule a 15-minute call: [LINK]

Best regards,
[Your Name]

P.S. This offer is only available for the next 7 days. Don't miss out!`,

    ad_copy: `${payload.title}

Stop wasting time on manual processes. Start growing faster.

✓ Save 10+ hours per week
✓ Increase productivity by 40%
✓ Scale without adding headcount

Join 1,000+ B2B SaaS companies already seeing results.

👉 Start Your Free Trial Today

[CTA Button: Get Started Free]`,

    landing_page: `# ${payload.title}

## The Problem You Face Every Day

Managing a growing B2B SaaS business shouldn't mean drowning in spreadsheets and manual processes. Yet that's exactly where most teams find themselves.

## There's a Better Way

Imagine having all your critical workflows automated, your team aligned, and your data accessible in real-time. That's what [Product] delivers.

## How It Works

**1. Connect Your Tools**
Seamless integration with the tools you already use

**2. Automate Your Workflows**
Set it once, let it run forever

**3. Scale with Confidence**
Grow your business without growing your headcount

## What You Get

✓ **40% more productive teams** - Automate repetitive tasks
✓ **Real-time insights** - Make data-driven decisions faster
✓ **Seamless scaling** - Grow without operational headaches

## Trusted by Industry Leaders

"[Product] transformed how we operate. We've cut manual work by 60% and doubled our growth." - [Client Name], CEO at [Company]

## Ready to Transform Your Operations?

Join 1,000+ B2B SaaS companies already seeing results.

[CTA Button: Start Free Trial]

No credit card required. Setup in 5 minutes.`,

    press_release: `FOR IMMEDIATE RELEASE

${payload.title}

[CITY, DATE] - [Company Name] today announced [main announcement], marking a significant milestone in [industry/sector].

[Opening paragraph with key news and why it matters]

"[Quote from executive about the significance and impact]," said [Name], [Title] at [Company]. "[Additional context about vision or market opportunity]."

Key highlights include:
• [Benefit/feature 1]
• [Benefit/feature 2]
• [Benefit/feature 3]

[Second paragraph with additional details, background, or market context]

The [product/service/initiative] is designed to address [specific market need or challenge], helping [target audience] achieve [desired outcome].

[Optional third paragraph with availability, pricing, or next steps]

For more information, visit [website] or contact [contact information].

About [Company Name]
[Company Name] is a [description]. Founded in [year], the company [mission/vision]. Learn more at [website].

Media Contact:
[Name]
[Title]
[Email]
[Phone]

###`
  };

  return templates[payload.contentType] || templates.blog_post;
}
