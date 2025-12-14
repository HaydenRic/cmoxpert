import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
};

interface ComplianceCheckRequest {
  campaign_id: string;
  campaign_content: {
    headline: string;
    body_text: string;
    call_to_action: string;
    landing_page_url?: string;
  };
  target_jurisdictions: string[];
  product_type: string;
}

interface ViolationDetail {
  rule_code: string;
  rule_name: string;
  regulatory_body: string;
  severity: string;
  description: string;
  matched_content: string;
  potential_fine: number;
}

interface ComplianceCheckResult {
  campaign_id: string;
  overall_status: 'compliant' | 'needs_review' | 'violations_found' | 'blocked';
  risk_score: number;
  violations: ViolationDetail[];
  warnings: string[];
  recommendations: string[];
  checked_jurisdictions: string[];
  rules_checked: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
        // Extract user's JWT from Authorization header for RLS
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey,
      { global: { headers: { Authorization: authHeader } } }grep -L "req.headers.get('Authorization')" supabase/functions/*/index.ts
      );

    const {
      campaign_id,
      campaign_content,
      target_jurisdictions,
      product_type,
    }: ComplianceCheckRequest = await req.json();

    const { data: rules, error: rulesError } = await supabase
      .from('compliance_rules')
      .select('*')
      .eq('is_active', true)
      .in('jurisdiction', target_jurisdictions);

    if (rulesError) throw rulesError;

    const violations: ViolationDetail[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const full_content = `
      ${campaign_content.headline}
      ${campaign_content.body_text}
      ${campaign_content.call_to_action}
    `.toLowerCase();

    rules?.forEach((rule: any) => {
      const applies_to = rule.applies_to_products || [];
      if (applies_to.length > 0 && !applies_to.includes(product_type)) {
        return;
      }

      if (rule.keywords_prohibited && rule.keywords_prohibited.length > 0) {
        rule.keywords_prohibited.forEach((keyword: string) => {
          if (full_content.includes(keyword.toLowerCase())) {
            violations.push({
              rule_code: rule.rule_code,
              rule_name: rule.rule_name,
              regulatory_body: rule.regulatory_body,
              severity: rule.severity,
              description: rule.rule_description,
              matched_content: keyword,
              potential_fine: rule.potential_fine_amount || 0,
            });
          }
        });
      }

      if (rule.keywords_required && rule.keywords_required.length > 0) {
        rule.keywords_required.forEach((keyword: string) => {
          if (!full_content.includes(keyword.toLowerCase())) {
            if (rule.severity === 'critical' || rule.severity === 'high') {
              violations.push({
                rule_code: rule.rule_code,
                rule_name: rule.rule_name,
                regulatory_body: rule.regulatory_body,
                severity: rule.severity,
                description: `Missing required disclosure: ${keyword}`,
                matched_content: '',
                potential_fine: rule.potential_fine_amount || 0,
              });
            } else {
              warnings.push(
                `${rule.regulatory_body}: Consider adding "${keyword}" (${rule.rule_name})`
              );
            }
          }
        });
      }

      if (rule.pattern_regex) {
        try {
          const regex = new RegExp(rule.pattern_regex, 'gi');
          const matches = full_content.match(regex);
          if (matches) {
            violations.push({
              rule_code: rule.rule_code,
              rule_name: rule.rule_name,
              regulatory_body: rule.regulatory_body,
              severity: rule.severity,
              description: rule.rule_description,
              matched_content: matches[0],
              potential_fine: rule.potential_fine_amount || 0,
            });
          }
        } catch (e) {
          console.error('Invalid regex pattern:', rule.pattern_regex);
        }
      }
    });

    let risk_score = 0;
    violations.forEach(v => {
      switch (v.severity) {
        case 'critical': risk_score += 30; break;
        case 'high': risk_score += 20; break;
        case 'medium': risk_score += 10; break;
        case 'low': risk_score += 5; break;
      }
    });
    risk_score = Math.min(risk_score, 100);

    let overall_status: 'compliant' | 'needs_review' | 'violations_found' | 'blocked';
    if (violations.some(v => v.severity === 'critical')) {
      overall_status = 'blocked';
    } else if (violations.length > 0) {
      overall_status = 'violations_found';
    } else if (warnings.length > 0) {
      overall_status = 'needs_review';
    } else {
      overall_status = 'compliant';
    }

    if (overall_status === 'blocked') {
      recommendations.push(
        'CRITICAL: This campaign cannot launch until critical violations are resolved.'
      );
    }

    if (violations.some(v => v.regulatory_body === 'FCA')) {
      recommendations.push(
        'FCA violations detected. All UK financial promotions must be approved by an authorized person.'
      );
    }

    if (violations.some(v => v.regulatory_body === 'SEC')) {
      recommendations.push(
        'SEC violations detected. Consult with compliance team before launching to US investors.'
      );
    }

    if (product_type === 'investment' && !full_content.includes('risk')) {
      recommendations.push(
        'Investment products should include clear risk warnings even if not strictly required.'
      );
    }

    if (warnings.length > 0 && overall_status === 'needs_review') {
      recommendations.push(
        `${warnings.length} optional disclosures missing. Adding them improves consumer trust and reduces regulatory risk.`
      );
    }

    if (overall_status === 'compliant') {
      recommendations.push(
        'Campaign meets all regulatory requirements. Approved for launch.'
      );
    }

    const { data: checkData, error: checkError } = await supabase
      .from('campaign_compliance_checks')
      .insert({
        campaign_id,
        overall_status,
        risk_score,
        violations_found: violations.map(v => ({
          rule_code: v.rule_code,
          severity: v.severity,
          description: v.description,
        })),
        rules_triggered: violations.map(v => v.rule_code),
        jurisdictions_checked: target_jurisdictions,
        action_required: overall_status === 'blocked' ? 'cancel_campaign' :
                        overall_status === 'violations_found' ? 'modify_copy' :
                        overall_status === 'needs_review' ? 'add_disclosure' : 'none',
      })
      .select()
      .single();

    if (checkError) console.error('Error saving compliance check:', checkError);

    const result: ComplianceCheckResult = {
      campaign_id,
      overall_status,
      risk_score,
      violations,
      warnings,
      recommendations,
      checked_jurisdictions: target_jurisdictions,
      rules_checked: rules?.length || 0,
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error checking compliance:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
