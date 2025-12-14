import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeCallback<T = unknown> = (payload: T) => void;

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

// DEPRECATED: Use hooks below with proper cleanup
export function useRealtimeMetrics(userId: string, callback: RealtimeCallback) {
  const manager = new RealtimeManager(userId);
  return manager.subscribeToMetrics(callback);
}

export function useRealtimeAlerts(userId: string, callback: RealtimeCallback) {
  const manager = new RealtimeManager(userId);
  return manager.subscribeToCompetitorAlerts(callback);
}

// Proper React hooks with cleanup
import { useEffect, useRef } from 'react';

export function useRealtimeMetricsWithCleanup(userId: string, callback: RealtimeCallback) {
  const managerRef = useRef<RealtimeManager | null>(null);

  useEffect(() => {
    if (!userId) return;

    managerRef.current = new RealtimeManager(userId);
    const unsubscribe = managerRef.current.subscribeToMetrics(callback);

    return () => {
      unsubscribe();
      managerRef.current?.unsubscribeAll();
      managerRef.current = null;
    };
  }, [userId, callback]);
}

export function useRealtimeAlertsWithCleanup(userId: string, callback: RealtimeCallback) {
  const managerRef = useRef<RealtimeManager | null>(null);

  useEffect(() => {
    if (!userId) return;

    managerRef.current = new RealtimeManager(userId);
    const unsubscribe = managerRef.current.subscribeToCompetitorAlerts(callback);

    return () => {
      unsubscribe();
      managerRef.current?.unsubscribeAll();
      managerRef.current = null;
    };
  }, [userId, callback]);
}

export function useRealtimeCampaignsWithCleanup(userId: string, callback: RealtimeCallback) {
  const managerRef = useRef<RealtimeManager | null>(null);

  useEffect(() => {
    if (!userId) return;

    managerRef.current = new RealtimeManager(userId);
    const unsubscribe = managerRef.current.subscribeToCampaignUpdates(callback);

    return () => {
      unsubscribe();
      managerRef.current?.unsubscribeAll();
      managerRef.current = null;
    };
  }, [userId, callback]);
}
