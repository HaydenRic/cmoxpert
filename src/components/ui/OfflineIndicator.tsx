import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock, Database, FolderSync as Sync, X } from 'lucide-react';
import { OfflineManager } from '../../lib/offlineManager';

interface OfflineIndicatorProps {
  onRetry?: () => void;
  showDetailedStatus?: boolean;
}

export function OfflineIndicator({ onRetry, showDetailedStatus = false }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [pendingOperations, setPendingOperations] = useState(0);
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0, percentage: 0 });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Initialize offline manager
    OfflineManager.init();
    
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online);
      
      if (!online) {
        setShowOfflineMessage(true);
        updateOfflineStats();
      } else {
        setShowOfflineMessage(false);
        handleSync();
      }
    };

    OfflineManager.addNetworkListener(handleNetworkChange);

    // Update stats periodically
    const interval = setInterval(updateOfflineStats, 5000);
    updateOfflineStats();

    return () => {
      OfflineManager.removeNetworkListener(handleNetworkChange);
      clearInterval(interval);
    };
  }, []);

  const updateOfflineStats = () => {
    try {
      setPendingOperations(OfflineManager.getPendingOperationsCount());
      setStorageUsage(OfflineManager.getStorageUsage());
    } catch (error) {
      console.error('Failed to update offline stats:', error);
    }
  };

  const handleSync = async () => {
    if (pendingOperations === 0) return;
    
    setSyncStatus('syncing');
    
    try {
      await OfflineManager.syncWhenOnline();
      setSyncStatus('success');
      updateOfflineStats();
      
      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      
      // Reset status after 5 seconds
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  const handleRetry = () => {
    if (isOnline) {
      onRetry?.();
      handleSync();
    } else {
      // Show message that connection is still offline
      alert('Please check your internet connection and try again.');
    }
  };

  const clearOfflineData = () => {
    if (confirm('Clear all offline data? This cannot be undone.')) {
      OfflineManager.clearPendingOperations();
      updateOfflineStats();
    }
  };

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && showOfflineMessage && (
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
                {pendingOperations > 0 && (
                  <span className="text-xs bg-red-700 px-2 py-1 rounded">
                    {pendingOperations} operations queued
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {showDetailedStatus && (
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                  >
                    Details
                  </button>
                )}
                
                <button
                  onClick={handleRetry}
                  className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
                
                <button
                  onClick={() => setShowOfflineMessage(false)}
                  className="text-red-200 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Detailed offline status */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-red-700 mt-3 pt-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4" />
                      <span>Storage: {storageUsage.percentage.toFixed(1)}% used</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Queued: {pendingOperations} operations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={clearOfflineData}
                        className="bg-red-700 hover:bg-red-800 px-2 py-1 rounded transition-colors"
                      >
                        Clear Data
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Restored Banner */}
      <AnimatePresence>
        {isOnline && syncStatus === 'syncing' && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
              <Sync className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">
                Connection restored! Syncing {pendingOperations} operations...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Success Banner */}
      <AnimatePresence>
        {syncStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                All operations synced successfully!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Error Banner */}
      <AnimatePresence>
        {syncStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-orange-600 text-white p-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Some operations failed to sync. They will retry automatically.
                </span>
              </div>
              <button
                onClick={handleSync}
                className="bg-orange-700 hover:bg-orange-800 text-white px-3 py-1 rounded text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Now</span>
              </button>
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
            {pendingOperations > 0 && (
              <span className="text-xs bg-red-700 px-1 py-0.5 rounded">
                {pendingOperations}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Storage Warning */}
      {storageUsage.percentage > 80 && (
        <div className="fixed bottom-4 right-4 bg-yellow-600 text-white p-2 rounded-lg shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span className="text-xs font-medium">
              Storage {storageUsage.percentage.toFixed(0)}% full
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// Offline-capable component wrapper
export function withOfflineSupport<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    fallbackData?: any;
    cacheKey?: string;
    feature?: string;
  }
) {
  return function OfflineCapableComponent(props: T) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [cachedData, setCachedData] = useState(null);

    useEffect(() => {
      const handleNetworkChange = (online: boolean) => {
        setIsOnline(online);
        
        if (!online && options?.cacheKey) {
          const cached = OfflineManager.getCachedData(options.cacheKey);
          setCachedData(cached);
        }
      };

      OfflineManager.addNetworkListener(handleNetworkChange);
      
      // Load cached data if offline
      if (!isOnline && options?.cacheKey) {
        const cached = OfflineManager.getCachedData(options.cacheKey);
        setCachedData(cached);
      }

      return () => {
        OfflineManager.removeNetworkListener(handleNetworkChange);
      };
    }, []);

    // If offline and we have cached data, pass it to the component
    const enhancedProps = {
      ...props,
      isOnline,
      cachedData: cachedData || options?.fallbackData,
      offlineMode: !isOnline
    } as T & {
      isOnline: boolean;
      cachedData: any;
      offlineMode: boolean;
    };

    return <Component {...enhancedProps} />;
  };
}