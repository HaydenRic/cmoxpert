import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { NetworkMonitor, OfflineStorage } from '../lib/errorHandling';

interface OfflineIndicatorProps {
  onRetry?: () => void;
}

export function OfflineIndicator({ onRetry }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [offlineData, setOfflineData] = useState<any[]>([]);

  useEffect(() => {
    NetworkMonitor.init();
    
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online);
      
      if (!online) {
        setShowOfflineMessage(true);
        loadOfflineData();
      } else {
        setShowOfflineMessage(false);
        // Sync offline data when back online
        syncOfflineData();
      }
    };

    NetworkMonitor.addListener(handleNetworkChange);

    return () => {
      NetworkMonitor.removeListener(handleNetworkChange);
    };
  }, []);

  const loadOfflineData = () => {
    const data = OfflineStorage.load('pending_operations') || [];
    setOfflineData(data);
  };

  const syncOfflineData = async () => {
    const pendingOperations = OfflineStorage.load('pending_operations') || [];
    
    if (pendingOperations.length > 0) {
      console.log('Syncing offline data...', pendingOperations);
      
      // In a real implementation, you would process these operations
      // For now, we'll just clear them
      OfflineStorage.remove('pending_operations');
      setOfflineData([]);
      
      // Trigger a retry if callback provided
      onRetry?.();
    }
  };

  const handleRetry = () => {
    if (isOnline) {
      onRetry?.();
    } else {
      // Show message that connection is still offline
      alert('Please check your internet connection and try again.');
    }
  };

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">
                  You're currently offline. Some features may not work properly.
                </span>
                {offlineData.length > 0 && (
                  <span className="text-xs bg-red-700 px-2 py-1 rounded">
                    {offlineData.length} pending operations
                  </span>
                )}
              </div>
              
              <button
                onClick={handleRetry}
                className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Restored Banner */}
      <AnimatePresence>
        {isOnline && showOfflineMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            onAnimationComplete={() => {
              setTimeout(() => setShowOfflineMessage(false), 3000);
            }}
            className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">
                Connection restored! Syncing your data...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Offline Indicator */}
      {!isOnline && !showOfflineMessage && (
        <div className="fixed bottom-4 left-4 bg-red-600 text-white p-2 rounded-lg shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs font-medium">Offline</span>
          </div>
        </div>
      )}
    </>
  );
}

// Offline-capable data manager
export class OfflineDataManager {
  private static readonly CACHE_PREFIX = 'cmoxpert_cache_';
  
  static async getData<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: {
      maxAge?: number; // milliseconds
      fallbackToCache?: boolean;
    }
  ): Promise<T | null> {
    const cacheKey = this.CACHE_PREFIX + key;
    const maxAge = options?.maxAge || 5 * 60 * 1000; // 5 minutes default
    
    try {
      // Try to fetch fresh data if online
      if (NetworkMonitor.online) {
        const data = await fetchFn();
        
        // Cache the fresh data
        OfflineStorage.save(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.warn('Failed to fetch fresh data:', error);
    }
    
    // Fallback to cached data if offline or fetch failed
    if (options?.fallbackToCache !== false) {
      const cached = OfflineStorage.load(cacheKey);
      if (cached) {
        console.log('Using cached data for:', key);
        return cached;
      }
    }
    
    return null;
  }
  
  static saveForSync(operation: string, data: any): void {
    const pending = OfflineStorage.load('pending_operations') || [];
    pending.push({
      operation,
      data,
      timestamp: Date.now()
    });
    OfflineStorage.save('pending_operations', pending);
  }
  
  static getPendingOperations(): any[] {
    return OfflineStorage.load('pending_operations') || [];
  }
  
  static clearPendingOperations(): void {
    OfflineStorage.remove('pending_operations');
  }
}