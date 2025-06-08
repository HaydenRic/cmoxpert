import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase config:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing',
  urlValue: supabaseUrl,
  keyLength: supabaseAnonKey?.length
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'cmoxpert-web'
    }
  }
});

// Test the connection with better error handling
const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful:', { hasSession: !!data.session });
    }

    // Test database connection
    const { data: testData, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.error('Database connection error:', dbError);
    } else {
      console.log('Database connection successful');
    }
  } catch (err) {
    console.error('Connection test failed:', err);
  }
};

// Run connection test
testConnection();

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
      const response = await fetch(`${this.EDGE_FUNCTION_URL}/generate-market-analysis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`AI Analysis failed: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('AI Services error:', error);
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