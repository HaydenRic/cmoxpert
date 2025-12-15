import { createClient } from 'npm:@supabase/supabase-js@2';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CompetitorData {
  name: string;
  domain: string;
  fundingRound?: string;
  fundingAmount?: number;
  pricingChange?: boolean;
  productLaunch?: string;
  jobPostings?: number;
}

async function scrapeCrunchbase(companyName: string): Promise<Partial<CompetitorData>> {
  try {
    const apiKey = Deno.env.get('CRUNCHBASE_API_KEY');
    if (!apiKey) {
      console.warn('Crunchbase API key not configured');
      return {};
    }

    const response = await fetch(
      `https://api.crunchbase.com/api/v4/searches/organizations?query=${encodeURIComponent(companyName)}`,
      {
        headers: {
          'X-cb-user-key': apiKey,
        }
      }
    );

    if (!response.ok) {
      throw new Error('Crunchbase API request failed');
    }

    const data = await response.json();
    const company = data.entities?.[0]?.properties;

    if (!company) {
      return {};
    }

    return {
      fundingRound: company.last_funding_type,
      fundingAmount: company.funding_total?.value_usd,
    };
  } catch (error) {
    console.error('Crunchbase scraping error:', error);
    return {};
  }
}

async function scrapeLinkedInJobs(companyName: string): Promise<number> {
  try {
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      return 0;
    }

    const response = await fetch(
      `https://linkedin-data-api.p.rapidapi.com/search-jobs?keywords=${encodeURIComponent(companyName)}&locationId=92000000&sort=mostRelevant`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'linkedin-data-api.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.data?.length || 0;
  } catch (error) {
    console.error('LinkedIn jobs scraping error:', error);
    return 0;
  }
}

async function checkPricingChanges(domain: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${domain}/pricing`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; cmoxpert/1.0; +https://cmoxpert.com)'
      }
    });

    if (!response.ok) {
      return false;
    }

    const html = await response.text();

    const pricePatterns = [
      /\$\d+(?:,\d{3})*(?:\.\d{2})?/g,
      /€\d+(?:,\d{3})*(?:\.\d{2})?/g,
      /£\d+(?:,\d{3})*(?:\.\d{2})?/g,
    ];

    let foundPrices = 0;
    for (const pattern of pricePatterns) {
      const matches = html.match(pattern);
      if (matches) {
        foundPrices += matches.length;
      }
    }

    return foundPrices > 0;
  } catch (error) {
    console.error('Pricing check error:', error);
    return false;
  }
}

async function detectProductLaunches(domain: string): Promise<string | null> {
  try {
    const response = await fetch(`https://${domain}/blog`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; cmoxpert/1.0; +https://cmoxpert.com)'
      }
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    const launchKeywords = [
      'announcing',
      'launch',
      'new feature',
      'introducing',
      'now available',
      'product update'
    ];

    for (const keyword of launchKeywords) {
      if (html.toLowerCase().includes(keyword)) {
        const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i) ||
                          html.match(/<h2[^>]*>(.*?)<\/h2>/i);
        if (titleMatch) {
          return titleMatch[1].replace(/<[^>]*>/g, '').slice(0, 200);
        }
        return keyword;
      }
    }

    return null;
  } catch (error) {
    console.error('Product launch detection error:', error);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  // Extract user's JWT from Authorization header for RLS
  const authHeader = req.headers.get('Authorization')!;
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { global: { headers: { Authorization: authHeader } } });

    const { data: competitors, error: competitorsError } = await supabase
      .from('competitors')
      .select('*')
      .eq('monitoring_enabled', true);

    if (competitorsError) {
      throw competitorsError;
    }

    const results = [];

    for (const competitor of competitors || []) {
      console.log(`Scanning competitor: ${competitor.name}`);

      const crunchbaseData = await scrapeCrunchbase(competitor.name);
      const jobPostings = await scrapeLinkedInJobs(competitor.name);
      const pricingChanged = await checkPricingChanges(competitor.domain);
      const productLaunch = await detectProductLaunches(competitor.domain);

      const hasNewFunding = crunchbaseData.fundingRound &&
        crunchbaseData.fundingRound !== competitor.last_funding_round;

      const significantHiring = jobPostings > (competitor.last_job_count || 0) + 10;

      if (hasNewFunding || pricingChanged || productLaunch || significantHiring) {
        await supabase.from('competitor_alerts').insert({
          competitor_id: competitor.id,
          user_id: competitor.user_id,
          alert_type: hasNewFunding ? 'funding' :
                     pricingChanged ? 'pricing_change' :
                     productLaunch ? 'product_launch' : 'hiring_surge',
          title: hasNewFunding ? `${competitor.name} raised ${crunchbaseData.fundingRound}` :
                pricingChanged ? `${competitor.name} updated pricing` :
                productLaunch ? `${competitor.name} launched: ${productLaunch}` :
                `${competitor.name} is hiring (${jobPostings} open roles)`,
          description: JSON.stringify({
            fundingRound: crunchbaseData.fundingRound,
            fundingAmount: crunchbaseData.fundingAmount,
            jobPostings,
            pricingChanged,
            productLaunch
          }),
          severity: hasNewFunding ? 'high' : 'medium'
        });

        await supabase
          .from('competitors')
          .update({
            last_funding_round: crunchbaseData.fundingRound || competitor.last_funding_round,
            last_funding_amount: crunchbaseData.fundingAmount || competitor.last_funding_amount,
            last_job_count: jobPostings,
            last_check_at: new Date().toISOString()
          })
          .eq('id', competitor.id);

        results.push({
          competitor: competitor.name,
          alerts: ['New activity detected']
        });
      } else {
        await supabase
          .from('competitors')
          .update({
            last_check_at: new Date().toISOString(),
            last_job_count: jobPostings
          })
          .eq('id', competitor.id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      scanned: competitors?.length || 0,
      alerts_created: results.length,
      results
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200
    });
  } catch (error) {
    console.error('Competitive intelligence error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to scan competitors'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 400
    });
  }
});
