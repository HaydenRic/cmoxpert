import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  }
  
  static async getAnalysisStatus(reportId: string) {
    const { data, error } = await supabase
      .from('reports')
      .select('status, ai_analysis, semrush_data, trends_data')
      .eq('id', reportId)
      .single();
    
    if (error) throw error;
    return data;
  }
}