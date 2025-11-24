import { useEffect, useRef, useState } from 'react';

interface UseAutoRefreshOptions {
  interval?: number;
  enabled?: boolean;
  onRefresh?: () => void | Promise<void>;
}

export function useAutoRefresh(
  refreshFn: () => void | Promise<void>,
  options: UseAutoRefreshOptions = {}
) {
  const {
    interval = 60000,
    enabled = true,
    onRefresh
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const intervalRef = useRef<number | null>(null);

  const refresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshFn();
      if (onRefresh) {
        await onRefresh();
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Auto-refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Only refresh when page is visible
    const handleVisibilityChange = () => {
      if (document.hidden && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else if (!document.hidden && !intervalRef.current) {
        intervalRef.current = window.setInterval(refresh, interval);
      }
    };

    // Start interval if page is visible
    if (!document.hidden) {
      intervalRef.current = window.setInterval(refresh, interval);
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, interval]);

  return {
    isRefreshing,
    lastRefresh,
    refresh
  };
}

export function useRealtimeData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: { refreshInterval?: number; enabled?: boolean } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, dependencies);

  const { isRefreshing, lastRefresh, refresh } = useAutoRefresh(
    loadData,
    {
      interval: options.refreshInterval || 60000,
      enabled: options.enabled !== false
    }
  );

  return {
    data,
    loading,
    error,
    isRefreshing,
    lastRefresh,
    refresh,
    reload: loadData
  };
}
