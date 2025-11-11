import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Comprehensive validation of environment variables
function validateSupabaseConfig() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if variables exist
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is not set');
  }
  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is not set');
  }

  // Validate URL format if it exists
  if (supabaseUrl) {
    if (!supabaseUrl.startsWith('https://')) {
      errors.push('Supabase URL must start with https://');
    }
    if (!supabaseUrl.includes('.supabase.co')) {
      errors.push('Supabase URL must be a valid *.supabase.co domain');
    }
    if (supabaseUrl.includes('placeholder')) {
      errors.push('Supabase URL is still set to placeholder value');
    }
    if (supabaseUrl.includes('your-project')) {
      errors.push('Supabase URL contains template text - update with your actual project URL');
    }
  }

  // Validate anon key format if it exists
  if (supabaseAnonKey) {
    if (!supabaseAnonKey.startsWith('eyJ')) {
      warnings.push('Supabase Anon Key format looks suspicious - verify it is correct');
    }
    if (supabaseAnonKey.length < 100) {
      warnings.push('Supabase Anon Key seems too short - verify it is correct');
    }
  }

  // Log errors and warnings
  if (errors.length > 0) {
    console.error('='.repeat(80));
    console.error('CRITICAL: Supabase Configuration Errors');
    console.error('='.repeat(80));
    errors.forEach((error, i) => {
      console.error(`${i + 1}. ${error}`);
    });
    console.error('');
    console.error('To fix this:');
    console.error('1. Check your .env file in the project root');
    console.error('2. For local development: Ensure .env has valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    console.error('3. For production (Netlify): Set environment variables in Netlify dashboard:');
    console.error('   - Go to Site settings > Environment variables');
    console.error('   - Add VITE_SUPABASE_URL with your Supabase project URL');
    console.error('   - Add VITE_SUPABASE_ANON_KEY with your anon/public key');
    console.error('   - Trigger a new deploy after adding variables');
    console.error('='.repeat(80));

    // Show user-friendly error in the UI instead of crashing
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #1a1a1a; color: #fff; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; z-index: 9999;';
    errorDiv.innerHTML = `
      <div style="max-width: 600px; padding: 40px; background: #2a2a2a; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        <h1 style="color: #ff6b6b; font-size: 24px; margin-bottom: 20px;">⚠️ Configuration Error</h1>
        <p style="margin-bottom: 20px; line-height: 1.6;">The site cannot load because Supabase environment variables are not configured.</p>
        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #ffd93d; font-size: 16px; margin-bottom: 10px;">Missing Variables:</h3>
          <ul style="list-style: none; padding: 0; color: #ff6b6b;">
            ${errors.map(err => `<li style="margin: 5px 0;">• ${err}</li>`).join('')}
          </ul>
        </div>
        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #6bcf7f; font-size: 16px; margin-bottom: 10px;">To Fix (Netlify):</h3>
          <ol style="line-height: 1.8; padding-left: 20px;">
            <li>Go to Netlify Dashboard → Site settings → Environment variables</li>
            <li>Add <code style="background: #3a3a3a; padding: 2px 6px; border-radius: 4px;">VITE_SUPABASE_URL</code></li>
            <li>Add <code style="background: #3a3a3a; padding: 2px 6px; border-radius: 4px;">VITE_SUPABASE_ANON_KEY</code></li>
            <li>Trigger a new deploy</li>
          </ol>
        </div>
        <button onclick="window.location.reload()" style="background: #6bcf7f; color: #1a1a1a; border: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px;">
          Reload After Fix
        </button>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">Check browser console (F12) for detailed logs</p>
      </div>
    `;
    document.body.appendChild(errorDiv);

    throw new Error('Supabase configuration is invalid. Check console for details.');
  }

  if (warnings.length > 0) {
    console.warn('='.repeat(80));
    console.warn('Supabase Configuration Warnings');
    console.warn('='.repeat(80));
    warnings.forEach((warning, i) => {
      console.warn(`${i + 1}. ${warning}`);
    });
    console.warn('='.repeat(80));
  }

  console.log('[SUPABASE] Configuration validated successfully');
  console.log('[SUPABASE] URL:', supabaseUrl?.substring(0, 30) + '...');
  console.log('[SUPABASE] Anon Key:', supabaseAnonKey?.substring(0, 20) + '...');
}

// Run validation
validateSupabaseConfig();

const isSupabaseConfigured = true;

// Create Supabase client with validated credentials
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      debug: false,
      storageKey: 'cmoxpert-auth'
    },
    global: {
      headers: {
        'X-Client-Info': 'cmoxpert-web'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    }
  }
);

// Export configuration status
export { isSupabaseConfigured };

// Health check function to test Supabase connection
export async function checkSupabaseConnection(): Promise<{
  success: boolean;
  error?: string;
  latency?: number;
}> {
  const startTime = Date.now();

  try {
    // Try a simple query to test connection
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      console.error('[SUPABASE] Health check failed:', error);
      return {
        success: false,
        error: error.message,
        latency
      };
    }

    console.log(`[SUPABASE] Health check passed (${latency}ms)`);
    return {
      success: true,
      latency
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error('[SUPABASE] Health check exception:', error);

    let errorMessage = 'Unable to connect to Supabase';

    if (error.message?.includes('fetch')) {
      errorMessage = 'Network error - please check your internet connection';
    } else if (error.message?.includes('DNS') || error.message?.includes('NAME_NOT_RESOLVED')) {
      errorMessage = 'DNS error - Supabase URL may be incorrect or unreachable';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Connection timeout - Supabase may be slow or unreachable';
    }

    return {
      success: false,
      error: errorMessage,
      latency
    };
  }
}


export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          title: string;
          description?: string;
          url: string;
          thumbnail_url?: string;
          duration?: number;
          views_count: number;
          is_featured: boolean;
          status: string;
          uploaded_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          url: string;
          thumbnail_url?: string;
          duration?: number;
          views_count?: number;
          is_featured?: boolean;
          status?: string;
          uploaded_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          url?: string;
          thumbnail_url?: string;
          duration?: number;
          views_count?: number;
          is_featured?: boolean;
          status?: string;
          uploaded_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      video_views: {
        Row: {
          id: string;
          video_id: string;
          user_id?: string;
          ip_address?: string;
          user_agent?: string;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          user_id?: string;
          ip_address?: string;
          user_agent?: string;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          user_id?: string;
          ip_address?: string;
          user_agent?: string;
          viewed_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          domain: string;
          industry?: string;
          status: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain: string;
          industry?: string;
          status?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string;
          industry?: string;
          status?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          client_id: string;
          domain: string;
          semrush_data?: any;
          trends_data?: any;
          ai_analysis?: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          domain: string;
          semrush_data?: any;
          trends_data?: any;
          ai_analysis?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          domain?: string;
          semrush_data?: any;
          trends_data?: any;
          ai_analysis?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      playbooks: {
        Row: {
          id: string;
          name: string;
          description?: string;
          tactics: any;
          category: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          tactics?: any;
          category?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          tactics?: any;
          category?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// AI Services Integration Helper
export class AIServicesManager {
  private static readonly EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1`;

  static async generateMarketAnalysis(payload: {
    reportId: string;
    clientId: string;
    domain: string;
    industry?: string;
  }) {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('User is not authenticated. Please log in.');
      }

      const response = await fetch(`${this.EDGE_FUNCTION_URL}/generate-market-analysis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`AI Analysis failed: ${errorData.error || response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('AI Services error:', error);
      throw error;
    }
  }

  static async generatePlaybook(payload: {
    clientId: string;
    userId: string;
    playbookType?: string;
    reportId?: string;
  }) {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('User is not authenticated. Please log in.');
      }

      const response = await fetch(`${this.EDGE_FUNCTION_URL}/generate-playbook`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`AI Playbook generation failed: ${errorData.error || response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('AI Playbook generation error:', error);
      throw error;
    }
  }
  
  static async getAnalysisStatus(reportId: string) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('status, ai_analysis, semrush_data, trends_data')
        .eq('id', reportId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get analysis status error:', error);
      throw error;
    }
  }
}