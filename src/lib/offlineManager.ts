```typescript
import { AppError, ErrorType } from './errorTypes';

// Offline data management and synchronization
export class OfflineManager {
  private static readonly STORAGE_KEY = 'cmoxpert_offline_data';
  private static readonly QUEUE_KEY = 'cmoxpert_sync_queue';
  private static readonly MAX_STORAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly MAX_QUEUE_SIZE = 100;
  
  private static isOnline = navigator.onLine;
  private static syncInProgress = false;
  private static listeners: Array<(online: boolean) => void> = [];

  static init(): void {
    // Monitor network status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });

    // Attempt sync on page load if online
    if (this.isOnline) {
      setTimeout(() => this.syncWhenOnline(), 1000);
    }
  }

  static addNetworkListener(callback: (online: boolean) => void): void {
    this.listeners.push(callback);
  }

  static removeNetworkListener(callback: (online: boolean) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private static notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(online);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  // Cache data for offline access
  static cacheData(key: string, data: any, options?: { ttl?: number }): boolean {
    try {
      const storage = this.getStorage();
      const ttl = options?.ttl || 24 * 60 * 60 * 1000; // 24 hours default
      
      storage[key] = {
        data,
        timestamp: Date.now(),
        ttl,
        version: '1.0'
      };
      
      const serialized = JSON.stringify(storage);
      
      // Check storage size
      if (serialized.length > this.MAX_STORAGE_SIZE) {
        console.warn('Offline storage limit exceeded, cleaning old data');
        this.cleanupStorage();
        return false;
      }
      
      localStorage.setItem(this.STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      console.error('Failed to cache data:', error);
      return false;
    }
  }

  // Retrieve cached data
  static getCachedData<T>(key: string): T | null {
    try {
      const storage = this.getStorage();
      const item = storage[key];
      
      if (!item) return null;
      
      // Check if data has expired
      if (Date.now() - item.timestamp > item.ttl) {
        delete storage[key];
        this.saveStorage(storage);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
      return null;
    }
  }

  // Queue operations for when back online
  static queueOperation(operation: {
    id: string;
    type: string;
    data: any;
    endpoint: string;
    method: string;
    priority?: number;
  }): boolean {
    try {
      const queue = this.getSyncQueue();
      
      // Check if operation already exists
      const existingIndex = queue.findIndex(op => op.id === operation.id);
      if (existingIndex !== -1) {
        queue[existingIndex] = { ...operation, timestamp: Date.now() };
      } else {
        queue.push({ ...operation, timestamp: Date.now() });
      }
      
      // Limit queue size
      if (queue.length > this.MAX_QUEUE_SIZE) {
        queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        queue.splice(this.MAX_QUEUE_SIZE);
      }
      
      this.saveSyncQueue(queue);
      return true;
    } catch (error) {
      console.error('Failed to queue operation:', error);
      return false;
    }
  }

  // Sync queued operations when online
  static async syncWhenOnline(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;
    
    const queue = this.getSyncQueue();
    if (queue.length === 0) return;
    
    this.syncInProgress = true;
    console.log(\`Syncing ${queue.length} queued operations...`);
    
    try {
      const results = await Promise.allSettled(
        queue.map(operation => this.executeQueuedOperation(operation))
      );
      
      // Remove successful operations from queue
      const failedOperations = queue.filter((_, index) => 
        results[index].status === 'rejected'
      );
      
      this.saveSyncQueue(failedOperations);
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;
      
      console.log(\`Sync completed: ${successCount} successful, ${failureCount} failed`);
      
      if (successCount > 0) {
        // Notify user of successful sync
        this.notifySync(successCount, failureCount);
      }
    } catch (error) {
      console.error('Sync operation failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private static async executeQueuedOperation(operation: any): Promise<void> {
    // This would execute the actual API call
    // For now, we'll simulate the operation
    console.log('Executing queued operation:', operation.type);
    
    // In a real implementation, you would:
    // 1. Reconstruct the API call
    // 2. Execute it with proper authentication
    // 3. Handle the response
    
    return Promise.resolve();
  }

  private static notifySync(successCount: number, failureCount: number): void {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Synced ${successCount} operations</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  // Storage utilities
  private static getStorage(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private static saveStorage(storage: Record<string, any>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
      console.error('Failed to save storage:', error);
    }
  }

  private static getSyncQueue(): any[] {
    try {
      const stored = localStorage.getItem(this.QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static saveSyncQueue(queue: any[]): void {
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private static cleanupStorage(): void {
    try {
      const storage = this.getStorage();
      const entries = Object.entries(storage);
      
      // Sort by timestamp and keep only the 50 most recent items
      entries.sort((a, b) => (b[1] as any).timestamp - (a[1] as any).timestamp);
      const cleaned = Object.fromEntries(entries.slice(0, 50));
      
      this.saveStorage(cleaned);
    } catch (error) {
      console.error('Failed to cleanup storage:', error);
    }
  }

  // Public API
  static get online(): boolean {
    return this.isOnline;
  }

  static getPendingOperationsCount(): number {
    return this.getSyncQueue().length;
  }

  static clearPendingOperations(): void {
    this.saveSyncQueue([]);
  }

  static getStorageUsage(): { used: number; total: number; percentage: number } {
    try {
      const storage = this.getStorage();
      const used = JSON.stringify(storage).length;
      const percentage = (used / this.MAX_STORAGE_SIZE) * 100;
      
      return {
        used,
        total: this.MAX_STORAGE_SIZE,
        percentage
      };
    } catch {
      return { used: 0, total: this.MAX_STORAGE_SIZE, percentage: 0 };
    }
  }
}

// Graceful degradation utilities
export class GracefulDegradation {
  private static featureFlags = new Map<string, boolean>();
  private static fallbackData = new Map<string, any>();

  static setFeatureFlag(feature: string, enabled: boolean): void {
    this.featureFlags.set(feature, enabled);
  }

  static isFeatureEnabled(feature: string): boolean {
    return this.featureFlags.get(feature) ?? true;
  }

  static setFallbackData(key: string, data: any): void {
    this.fallbackData.set(key, data);
  }

  static getFallbackData<T>(key: string): T | null {
    return this.fallbackData.get(key) || null;
  }

  static async withFallback<T>(
    operation: () => Promise<T>,
    fallback: T | (() => T),
    options?: {
      feature?: string;
      cacheKey?: string;
      timeout?: number;
    }
  ): Promise<T> {
    // Check feature flag
    if (options?.feature && !this.isFeatureEnabled(options.feature)) {
      return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
    }

    try {
      // Try to get cached data first if offline
      if (!OfflineManager.online && options?.cacheKey) {
        const cached = OfflineManager.getCachedData<T>(options.cacheKey);
        if (cached) return cached;
      }

      // Execute operation with timeout
      const timeoutPromise = options?.timeout 
        ? new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Operation timeout')), options.timeout)
          )
        : null;

      const result = timeoutPromise 
        ? await Promise.race([operation(), timeoutPromise])
        : await operation();

      // Cache successful result
      if (options?.cacheKey) {
        OfflineManager.cacheData(options.cacheKey, result);
      }

      return result;
    } catch (error) {
      console.warn(\`Operation failed, using fallback:`, error);
      
      // Try cached data first
      if (options?.cacheKey) {
        const cached = OfflineManager.getCachedData<T>(options.cacheKey);
        if (cached) return cached;
      }
      
      // Use fallback
      return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
    }
  }

  // Feature availability checker
  static checkFeatureAvailability(): {
    supabase: boolean;
    ai: boolean;
    storage: boolean;
    analytics: boolean;
  } {
    return {
      supabase: this.isFeatureEnabled('supabase'),
      ai: this.isFeatureEnabled('ai_services'),
      storage: this.isFeatureEnabled('file_storage'),
      analytics: this.isFeatureEnabled('analytics')
    };
  }
}
```