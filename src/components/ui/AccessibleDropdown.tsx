import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

interface AccessibleDropdownProps {
  options: DropdownOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  label?: string;
  required?: boolean;
  maxHeight?: string;
}

export function AccessibleDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchable = false,
  multiple = false,
  disabled = false,
  error,
  className,
  label,
  required = false,
  maxHeight = "max-h-60"
}: AccessibleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [announcement, setAnnouncement] = useState('');

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Filter options based on search
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Group options if they have groups
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || 'default';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, DropdownOption[]>);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  const handleToggle = useCallback(() => {
    if (disabled) return;
    
    setIsOpen(!isOpen);
    setFocusedIndex(-1);
    
    if (!isOpen) {
      // Opening - focus search input if searchable, otherwise focus listbox
      setTimeout(() => {
        if (searchable && searchRef.current) {
          searchRef.current.focus();
        } else if (listboxRef.current) {
          listboxRef.current.focus();
        }
      }, 0);
    }
  }, [isOpen, disabled, searchable]);

  const handleSelect = useCallback((optionValue: string) => {
    if (multiple) {
      const newValue = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValue);
      
      // Announce selection for screen readers
      const option = options.find(opt => opt.value === optionValue);
      const action = selectedValues.includes(optionValue) ? 'deselected' : 'selected';
      setAnnouncement(`${option?.label} ${action}`);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      triggerRef.current?.focus();
      
      // Announce selection
      const option = options.find(opt => opt.value === optionValue);
      setAnnouncement(`${option?.label} selected`);
    }
  }, [multiple, selectedValues, onChange, options]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          event.preventDefault();
          handleToggle();
        } else if (focusedIndex >= 0) {
          event.preventDefault();
          const option = filteredOptions[focusedIndex];
          if (option && !option.disabled) {
            handleSelect(option.value);
          }
        }
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          handleToggle();
        } else {
          const nextIndex = focusedIndex < filteredOptions.length - 1 ? focusedIndex + 1 : 0;
          setFocusedIndex(nextIndex);
          optionRefs.current[nextIndex]?.scrollIntoView({ block: 'nearest' });
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : filteredOptions.length - 1;
          setFocusedIndex(prevIndex);
          optionRefs.current[prevIndex]?.scrollIntoView({ block: 'nearest' });
        }
        break;
      case 'Home':
        if (isOpen) {
          event.preventDefault();
          setFocusedIndex(0);
          optionRefs.current[0]?.scrollIntoView({ block: 'nearest' });
        }
        break;
      case 'End':
        if (isOpen) {
          event.preventDefault();
          const lastIndex = filteredOptions.length - 1;
          setFocusedIndex(lastIndex);
          optionRefs.current[lastIndex]?.scrollIntoView({ block: 'nearest' });
        }
        break;
    }
  }, [isOpen, focusedIndex, filteredOptions, handleToggle, handleSelect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  const dropdownId = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
  const listboxId = `listbox-${dropdownId}`;

  return (
    <div className={cn("relative", className)}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={dropdownId}
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Trigger button */}
      <button
        ref={triggerRef}
        id={dropdownId}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "relative w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors",
          disabled && "bg-slate-50 text-slate-500 cursor-not-allowed",
          error && "border-red-300 focus:ring-red-500 focus:border-red-500",
          "sm:text-sm"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${dropdownId}-label` : undefined}
        aria-describedby={error ? `${dropdownId}-error` : undefined}
        aria-required={required}
      >
        <span className="block truncate">
          {getDisplayText()}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown 
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform",
              isOpen && "transform rotate-180"
            )} 
          />
        </span>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-slate-200 rounded-lg">
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Search options..."
                  aria-label="Search options"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options list */}
          <ul
            ref={listboxRef}
            className={cn("py-1 overflow-auto focus:outline-none", maxHeight)}
            role="listbox"
            id={listboxId}
            aria-multiselectable={multiple}
            tabIndex={searchable ? -1 : 0}
            onKeyDown={!searchable ? handleKeyDown : undefined}
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">
                {searchTerm ? 'No options found' : 'No options available'}
              </li>
            ) : (
              Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <React.Fragment key={groupName}>
                  {groupName !== 'default' && (
                    <li className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50">
                      {groupName}
                    </li>
                  )}
                  {groupOptions.map((option, index) => {
                    const globalIndex = filteredOptions.indexOf(option);
                    const isSelected = selectedValues.includes(option.value);
                    const isFocused = globalIndex === focusedIndex;

                    return (
                      <li
                        key={option.value}
                        ref={el => optionRefs.current[globalIndex] = el}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled}
                        className={cn(
                          "relative cursor-default select-none px-3 py-2 text-sm transition-colors",
                          option.disabled
                            ? "text-slate-400 cursor-not-allowed"
                            : isFocused
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-900 hover:bg-slate-50",
                          isSelected && "font-medium"
                        )}
                        onClick={() => !option.disabled && handleSelect(option.value)}
                        onMouseEnter={() => !option.disabled && setFocusedIndex(globalIndex)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{option.label}</div>
                            {option.description && (
                              <div className="text-xs text-slate-500 truncate">
                                {option.description}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-slate-600 ml-2 flex-shrink-0" />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p id={`${dropdownId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Selected items display for multiple selection */}
      {multiple && selectedValues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedValues.map(val => {
            const option = options.find(opt => opt.value === val);
            return (
              <span
                key={val}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
              >
                {option?.label || val}
                <button
                  onClick={() => handleSelect(val)}
                  className="ml-1 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500 rounded"
                  aria-label={`Remove ${option?.label || val}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Fallback: Native select for progressive enhancement */}
      <noscript>
        <select
          className="w-full mt-2 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          multiple={multiple}
          required={required}
          disabled={disabled}
        >
          {placeholder && !required && (
            <option value="">{placeholder}</option>
          )}
          {options.map(option => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </noscript>
    </div>
  );
}