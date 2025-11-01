import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Check, ChevronDown, X, Globe } from 'lucide-react';
import clsx from 'clsx';

interface Client {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  status: string;
}

interface ClientSelectorProps {
  value?: string | null;
  onChange: (clientId: string | null, client: Client | null) => void;
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
  filterStatus?: string[];
}

export function ClientSelector({
  value,
  onChange,
  placeholder = 'Select a client...',
  className = '',
  allowClear = true,
  filterStatus = ['active']
}: ClientSelectorProps) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  useEffect(() => {
    if (value && clients.length > 0 && !selectedClient) {
      const client = clients.find(c => c.id === value);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [value, clients, selectedClient]);

  useEffect(() => {
    const filtered = clients.filter(client => {
      const matchesSearch = !searchTerm || (
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchesSearch;
    });
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadClients = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('clients')
        .select('id, name, domain, industry, status')
        .eq('user_id', user!.id);

      if (filterStatus.length > 0) {
        query = query.in('status', filterStatus);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
      setFilteredClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (client: Client) => {
    setSelectedClient(client);
    onChange(client.id, client);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClient(null);
    onChange(null, null);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!isOpen && clients.length === 0 && !loading) {
      loadClients();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={handleToggle}
        className={clsx(
          'w-full flex items-center justify-between px-4 py-3 bg-white border rounded-lg',
          'hover:border-dark_moss_green-400 focus:ring-2 focus:ring-dark_moss_green-500 focus:border-transparent',
          'transition-colors',
          isOpen ? 'border-dark_moss_green-500 ring-2 ring-dark_moss_green-500' : 'border-slate-300'
        )}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {selectedClient ? (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-dark_moss_green-500 to-pakistan_green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium text-slate-900 truncate">{selectedClient.name}</div>
                <div className="text-xs text-slate-500 truncate">{selectedClient.domain}</div>
              </div>
            </>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {allowClear && selectedClient && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <ChevronDown
            className={clsx(
              'w-5 h-5 text-slate-400 transition-transform',
              isOpen && 'transform rotate-180'
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 flex flex-col">
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-dark_moss_green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-slate-500">
                <div className="animate-spin w-6 h-6 border-2 border-dark_moss_green-500 border-t-transparent rounded-full mx-auto mb-2" />
                Loading clients...
              </div>
            ) : filteredClients.length > 0 ? (
              <div className="py-1">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleSelect(client)}
                    className={clsx(
                      'w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left',
                      selectedClient?.id === client.id && 'bg-dark_moss_green-50'
                    )}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-dark_moss_green-500 to-pakistan_green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{client.name}</div>
                      <div className="text-xs text-slate-500 truncate">{client.domain}</div>
                      {client.industry && (
                        <div className="text-xs text-slate-400 truncate mt-0.5">{client.industry}</div>
                      )}
                    </div>
                    {selectedClient?.id === client.id && (
                      <Check className="w-5 h-5 text-dark_moss_green-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-1">
                  {searchTerm ? 'No clients found' : 'No clients available'}
                </p>
                {searchTerm && (
                  <p className="text-sm text-slate-400">
                    Try a different search term
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
