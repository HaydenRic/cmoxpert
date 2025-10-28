import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Touchpoint {
  id: string;
  deal_id: string;
  touchpoint_date: string;
  touchpoint_type: string;
  channel: string;
  source: string;
  campaign_name?: string;
}

interface Deal {
  id: string;
  amount: number;
  stage: string;
  created_date: string;
  closed_date?: string;
}

interface AttributionWeight {
  touchpoint_id: string;
  channel: string;
  source: string;
  weight: number;
  revenue_credit: number;
}

function calculateShapleyValue(
  touchpoints: Touchpoint[],
  dealValue: number
): Record<string, number> {
  if (touchpoints.length === 0) return {};
  if (touchpoints.length === 1) {
    return { [touchpoints[0].channel]: 1.0 };
  }

  const channels = [...new Set(touchpoints.map(t => t.channel))];
  const shapleyValues: Record<string, number> = {};

  channels.forEach(channel => shapleyValues[channel] = 0);

  const totalPermutations = factorial(channels.length);

  for (const channel of channels) {
    let marginalContribution = 0;

    const otherChannels = channels.filter(c => c !== channel);
    const coalitionSizes = Array.from({ length: otherChannels.length + 1 }, (_, i) => i);

    for (const size of coalitionSizes) {
      const coalitions = getCombinations(otherChannels, size);

      for (const coalition of coalitions) {
        const withChannel = [...coalition, channel];
        const valueWith = calculateCoalitionValue(withChannel, touchpoints, dealValue);
        const valueWithout = calculateCoalitionValue(coalition, touchpoints, dealValue);

        const weight = (factorial(size) * factorial(channels.length - size - 1)) / totalPermutations;
        marginalContribution += weight * (valueWith - valueWithout);
      }
    }

    shapleyValues[channel] = marginalContribution / dealValue;
  }

  const total = Object.values(shapleyValues).reduce((sum, v) => sum + v, 0);
  Object.keys(shapleyValues).forEach(channel => {
    shapleyValues[channel] = shapleyValues[channel] / total;
  });

  return shapleyValues;
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

function getCombinations<T>(arr: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (arr.length === 0) return [];

  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, size - 1).map(combo => [first, ...combo]);
  const withoutFirst = getCombinations(rest, size);

  return [...withFirst, ...withoutFirst];
}

function calculateCoalitionValue(
  coalition: string[],
  touchpoints: Touchpoint[],
  dealValue: number
): number {
  const relevantTouchpoints = touchpoints.filter(t => coalition.includes(t.channel));

  if (relevantTouchpoints.length === 0) return 0;

  const timeDecayFactor = relevantTouchpoints.map((t, index) => {
    const position = index / touchpoints.length;
    return Math.exp(-0.5 * (1 - position));
  }).reduce((sum, factor) => sum + factor, 0);

  return dealValue * (timeDecayFactor / touchpoints.length);
}

function calculateMarkovChainAttribution(
  touchpoints: Touchpoint[],
  dealValue: number
): Record<string, number> {
  const channels = [...new Set(touchpoints.map(t => t.channel))];
  const transitions: Record<string, Record<string, number>> = {};
  const conversionProbability: Record<string, number> = {};

  channels.forEach(channel => {
    transitions[channel] = {};
    channels.forEach(nextChannel => {
      transitions[channel][nextChannel] = 0;
    });
    transitions[channel]['conversion'] = 0;
    conversionProbability[channel] = 0;
  });

  for (let i = 0; i < touchpoints.length - 1; i++) {
    const current = touchpoints[i].channel;
    const next = touchpoints[i + 1].channel;
    transitions[current][next]++;
  }

  if (touchpoints.length > 0) {
    const lastChannel = touchpoints[touchpoints.length - 1].channel;
    transitions[lastChannel]['conversion'] = 1;
  }

  channels.forEach(channel => {
    const totalTransitions = Object.values(transitions[channel])
      .reduce((sum, count) => sum + count, 0);

    if (totalTransitions > 0) {
      Object.keys(transitions[channel]).forEach(nextState => {
        transitions[channel][nextState] /= totalTransitions;
      });
    }
  });

  const removalEffects: Record<string, number> = {};

  channels.forEach(channelToRemove => {
    const modifiedTransitions = JSON.parse(JSON.stringify(transitions));
    delete modifiedTransitions[channelToRemove];

    Object.keys(modifiedTransitions).forEach(channel => {
      if (modifiedTransitions[channel][channelToRemove]) {
        delete modifiedTransitions[channel][channelToRemove];

        const remaining = Object.values(modifiedTransitions[channel])
          .reduce((sum: number, val: any) => sum + val, 0) as number;

        if (remaining > 0) {
          Object.keys(modifiedTransitions[channel]).forEach(nextState => {
            modifiedTransitions[channel][nextState] /= remaining;
          });
        }
      }
    });

    let conversionProb = 0;
    if (touchpoints.length > 0) {
      const firstChannel = touchpoints[0].channel;
      if (firstChannel !== channelToRemove && modifiedTransitions[firstChannel]) {
        conversionProb = modifiedTransitions[firstChannel]['conversion'] || 0;
      }
    }

    removalEffects[channelToRemove] = 1 - conversionProb;
  });

  const totalEffect = Object.values(removalEffects).reduce((sum, effect) => sum + effect, 0);

  const attribution: Record<string, number> = {};
  channels.forEach(channel => {
    attribution[channel] = totalEffect > 0 ? removalEffects[channel] / totalEffect : 0;
  });

  return attribution;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { user_id, deal_id, method = 'shapley' } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', deal_id)
      .eq('user_id', user_id)
      .single();

    if (dealError || !deal) {
      throw new Error('Deal not found');
    }

    const { data: touchpoints, error: touchpointsError } = await supabase
      .from('deal_touchpoints')
      .select('*')
      .eq('deal_id', deal_id)
      .order('touchpoint_date', { ascending: true });

    if (touchpointsError) throw touchpointsError;

    if (!touchpoints || touchpoints.length === 0) {
      return new Response(JSON.stringify({
        error: 'No touchpoints found for this deal'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    let attribution: Record<string, number> = {};

    if (method === 'shapley') {
      attribution = calculateShapleyValue(touchpoints, deal.amount);
    } else if (method === 'markov') {
      attribution = calculateMarkovChainAttribution(touchpoints, deal.amount);
    } else {
      throw new Error('Invalid attribution method');
    }

    const attributionWeights: AttributionWeight[] = touchpoints.map(t => ({
      touchpoint_id: t.id,
      channel: t.channel,
      source: t.source || '',
      weight: attribution[t.channel] || 0,
      revenue_credit: (attribution[t.channel] || 0) * deal.amount
    }));

    for (const weight of attributionWeights) {
      await supabase
        .from('deal_touchpoints')
        .update({
          attribution_credit: weight.weight,
          revenue_credit: weight.revenue_credit
        })
        .eq('id', weight.touchpoint_id);
    }

    await supabase
      .from('deals')
      .update({
        marketing_influenced: Object.values(attribution).some(v => v > 0),
        marketing_sourced: attribution[touchpoints[0]?.channel] > 0.3
      })
      .eq('id', deal_id);

    return new Response(JSON.stringify({
      deal_id,
      method,
      attribution,
      touchpoints: attributionWeights,
      total_amount: deal.amount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('ML attribution error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Attribution calculation failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
