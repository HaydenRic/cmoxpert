import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeCallback<T = any> = (payload: T) => void;

export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  subscribeToMetrics(callback: RealtimeCallback): () => void {
    const channelName = `metrics:${this.userId}`;

    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketing_channel_metrics',
          filter: `user_id=eq.${this.userId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  subscribeToCompetitorAlerts(callback: RealtimeCallback): () => void {
    const channelName = `alerts:${this.userId}`;

    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'competitor_alerts',
          filter: `user_id=eq.${this.userId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  subscribeToCampaignUpdates(callback: RealtimeCallback): () => void {
    const channelName = `campaigns:${this.userId}`;

    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketing_campaigns',
          filter: `user_id=eq.${this.userId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  subscribeToIntegrationSyncs(callback: RealtimeCallback): () => void {
    const channelName = `integrations:${this.userId}`;

    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'integrations',
          filter: `user_id=eq.${this.userId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }
}

export function useRealtimeMetrics(userId: string, callback: RealtimeCallback) {
  const manager = new RealtimeManager(userId);
  return manager.subscribeToMetrics(callback);
}

export function useRealtimeAlerts(userId: string, callback: RealtimeCallback) {
  const manager = new RealtimeManager(userId);
  return manager.subscribeToCompetitorAlerts(callback);
}
