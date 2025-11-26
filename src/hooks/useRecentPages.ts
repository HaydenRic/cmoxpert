import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RecentPage {
  path: string;
  title: string;
  timestamp: number;
}

const MAX_RECENT_PAGES = 5;
const STORAGE_KEY = 'cmoxpert_recent_pages';

// Page titles mapping
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clients',
  '/reports': 'Reports',
  '/content': 'Content Hub',
  '/playbooks': 'Playbooks',
  '/competitive-intelligence': 'Research',
  '/performance': 'Performance',
  '/revenue-attribution': 'Attribution',
  '/forecasting': 'Forecasting',
  '/integrations': 'Integrations',
  '/workflows': 'Workflows',
  '/deliverables': 'Deliverables',
  '/client-portal': 'Client Portal',
  '/admin': 'Admin',
  '/settings': 'Settings'
};

export function useRecentPages() {
  const location = useLocation();

  useEffect(() => {
    // Skip auth and public pages
    if (location.pathname === '/' ||
        location.pathname === '/auth' ||
        location.pathname === '/login' ||
        location.pathname.startsWith('/oauth')) {
      return;
    }

    const title = getPageTitle(location.pathname);
    if (!title) return;

    const recent = getRecentPages();

    // Remove if already exists
    const filtered = recent.filter(page => page.path !== location.pathname);

    // Add to front
    const updated: RecentPage[] = [
      { path: location.pathname, title, timestamp: Date.now() },
      ...filtered
    ].slice(0, MAX_RECENT_PAGES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [location.pathname]);

  return { getRecentPages };
}

function getPageTitle(path: string): string | null {
  // Check exact matches first
  if (pageTitles[path]) {
    return pageTitles[path];
  }

  // Handle dynamic routes (e.g., /clients/123)
  if (path.startsWith('/clients/') && path.split('/').length === 3) {
    return 'Client Detail';
  }

  return null;
}

export function getRecentPages(): RecentPage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function clearRecentPages() {
  localStorage.removeItem(STORAGE_KEY);
}
