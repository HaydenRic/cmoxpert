// Network monitoring utility
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private isOnline = navigator.onLine;
  private listeners: ((isOnline: boolean) => void)[] = [];

  static init(): NetworkMonitor {
    if (!this.instance) {
      this.instance = new NetworkMonitor();
    }
    return this.instance;
  }

  private constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  static get isOnline(): boolean {
    return this.init().isOnline;
  }

  static addListener(callback: (isOnline: boolean) => void): void {
    this.init().listeners.push(callback);
  }

  static removeListener(callback: (isOnline: boolean) => void): void {
    const instance = this.init();
    instance.listeners = instance.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isOnline));
  }
}

// Offline storage utilities
export class OfflineStorage {
  private static readonly STORAGE_KEY = 'cmoxpert_offline_data';
  private static readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

  static save(key: string, data: any): boolean {
    try {
      const storage = this.getStorage();
      storage[key] = {
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      const serialized = JSON.stringify(storage);
      
      // Check storage size
      if (serialized.length > this.MAX_STORAGE_SIZE) {
        console.warn('Offline storage limit exceeded, cleaning old data');
        this.cleanup();
        return false;
      }
      
      localStorage.setItem(this.STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  }

  static load(key: string): any | null {
    try {
      const storage = this.getStorage();
      const item = storage[key];
      
      if (!item) return null;
      
      // Check if data is too old (7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - item.timestamp > maxAge) {
        delete storage[key];
        this.saveStorage(storage);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      const storage = this.getStorage();
      delete storage[key];
      this.saveStorage(storage);
    } catch (error) {
      console.error('Failed to remove offline data:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear offline storage:', error);
    }
  }

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

  private static cleanup(): void {
    try {
      const storage = this.getStorage();
      const entries = Object.entries(storage);
      
      // Sort by timestamp and keep only the 10 most recent items
      entries.sort((a, b) => (b[1] as any).timestamp - (a[1] as any).timestamp);
      const cleaned = Object.fromEntries(entries.slice(0, 10));
      
      this.saveStorage(cleaned);
    } catch (error) {
      console.error('Failed to cleanup storage:', error);
    }
  }
}