import React, { useState, useMemo, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, Download, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  description?: string;
  align?: 'left' | 'center' | 'right';
}

interface AccessibleDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  caption?: string;
  sortBy?: keyof T;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  searchable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selectedRows: Set<string>) => void;
  getRowId?: (row: T, index: number) => string;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  stickyHeader?: boolean;
  zebra?: boolean;
  compact?: boolean;
  responsive?: boolean;
}

export function AccessibleDataTable<T extends Record<string, any>>({
  data,
  columns,
  caption,
  sortBy,
  sortDirection = 'asc',
  onSort,
  searchable = false,
  filterable = false,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  getRowId = (_, index) => index.toString(),
  className,
  emptyMessage = "No data available",
  loading = false,
  stickyHeader = false,
  zebra = true,
  compact = false,
  responsive = true
}: AccessibleDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<keyof T>>(new Set());
  const [announcement, setAnnouncement] = useState('');
  
  const tableRef = useRef<HTMLTableElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter(row =>
        columns.some(column => {
          const value = row[column.key];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue) {
        result = result.filter(row => {
          const value = row[key];
          return value?.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    return result;
  }, [data, searchTerm, filters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortBy, sortDirection]);

  const handleSort = useCallback((key: keyof T) => {
    if (!onSort) return;
    
    const newDirection = sortBy === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
    
    // Announce sort change
    const column = columns.find(col => col.key === key);
    setAnnouncement(`Table sorted by ${column?.header} ${newDirection}ending`);
  }, [sortBy, sortDirection, onSort, columns]);

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    
    const allRowIds = new Set(sortedData.map((row, index) => getRowId(row, index)));
    const isAllSelected = allRowIds.size > 0 && [...allRowIds].every(id => selectedRows.has(id));
    
    if (isAllSelected) {
      onSelectionChange(new Set());
      setAnnouncement('All rows deselected');
    } else {
      onSelectionChange(allRowIds);
      setAnnouncement(`All ${allRowIds.size} rows selected`);
    }
  }, [sortedData, selectedRows, onSelectionChange, getRowId]);

  const handleRowSelect = useCallback((rowId: string, selected: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelection = new Set(selectedRows);
    if (selected) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    
    onSelectionChange(newSelection);
    setAnnouncement(`Row ${selected ? 'selected' : 'deselected'}`);
  }, [selectedRows, onSelectionChange]);

  const toggleColumnVisibility = useCallback((columnKey: keyof T) => {
    setHiddenColumns(prev => {
      const newHidden = new Set(prev);
      if (newHidden.has(columnKey)) {
        newHidden.delete(columnKey);
      } else {
        newHidden.add(columnKey);
      }
      return newHidden;
    });
  }, []);

  const visibleColumns = columns.filter(column => !hiddenColumns.has(column.key));
  const isAllSelected = sortedData.length > 0 && 
    sortedData.every((row, index) => selectedRows.has(getRowId(row, index)));
  const isSomeSelected = selectedRows.size > 0 && !isAllSelected;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              placeholder="Search table..."
              aria-label="Search table data"
            />
          </div>
        )}

        {/* Column visibility toggle */}
        {responsive && (
          <details className="relative">
            <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded px-2 py-1">
              <EyeOff className="w-4 h-4 inline mr-1" />
              Columns ({visibleColumns.length}/{columns.length})
            </summary>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10 p-2">
              {columns.map(column => (
                <label key={String(column.key)} className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hiddenColumns.has(column.key)}
                    onChange={() => toggleColumnVisibility(column.key)}
                    className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                  />
                  <span className="text-sm text-slate-700">{column.header}</span>
                </label>
              ))}
            </div>
          </details>
        )}

        {/* Selection info */}
        {selectable && selectedRows.size > 0 && (
          <div className="text-sm text-slate-600">
            {selectedRows.size} of {sortedData.length} selected
          </div>
        )}
      </div>

      {/* Table container with horizontal scroll */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table
          ref={tableRef}
          className="w-full divide-y divide-slate-200"
          role="table"
          aria-label={caption || "Data table"}
        >
          {caption && (
            <caption className="sr-only">
              {caption}. {sortedData.length} rows. 
              {sortBy && `Sorted by ${columns.find(col => col.key === sortBy)?.header} ${sortDirection}ending.`}
            </caption>
          )}

          <thead className={cn("bg-slate-50", stickyHeader && "sticky top-0 z-10")}>
            <tr>
              {/* Select all checkbox */}
              {selectable && (
                <th className="w-12 px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={isSomeSelected ? (el) => { if (el) el.indeterminate = true; } : undefined}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                    aria-label="Select all rows"
                  />
                </th>
              )}

              {/* Column headers */}
              {visibleColumns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider",
                    column.width,
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right"
                  )}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="group inline-flex items-center space-x-1 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded"
                      aria-label={`Sort by ${column.header}`}
                      aria-describedby={column.description ? `desc-${String(column.key)}` : undefined}
                    >
                      <span>{column.header}</span>
                      <span className="flex flex-col">
                        <ChevronUp 
                          className={cn(
                            "w-3 h-3 -mb-1",
                            sortBy === column.key && sortDirection === 'asc'
                              ? "text-slate-900"
                              : "text-slate-400 group-hover:text-slate-600"
                          )} 
                        />
                        <ChevronDown 
                          className={cn(
                            "w-3 h-3",
                            sortBy === column.key && sortDirection === 'desc'
                              ? "text-slate-900"
                              : "text-slate-400 group-hover:text-slate-600"
                          )} 
                        />
                      </span>
                    </button>
                  ) : (
                    <span>{column.header}</span>
                  )}
                  
                  {column.description && (
                    <div id={`desc-${String(column.key)}`} className="sr-only">
                      {column.description}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td 
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                  className="px-3 py-8 text-center text-slate-500"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                  className="px-3 py-8 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => {
                const rowId = getRowId(row, index);
                const isSelected = selectedRows.has(rowId);

                return (
                  <tr
                    key={rowId}
                    className={cn(
                      "transition-colors",
                      zebra && index % 2 === 0 && "bg-slate-50",
                      isSelected && "bg-blue-50",
                      "hover:bg-slate-100 focus-within:bg-slate-100"
                    )}
                  >
                    {/* Row selection */}
                    {selectable && (
                      <td className="w-12 px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                          className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {visibleColumns.map((column, colIndex) => {
                      const value = row[column.key];
                      const cellContent = column.render ? column.render(value, row, index) : value;

                      return (
                        <td
                          key={String(column.key)}
                          className={cn(
                            "px-3 py-3 text-sm text-slate-900",
                            compact ? "py-2" : "py-3",
                            column.align === 'center' && "text-center",
                            column.align === 'right' && "text-right"
                          )}
                          style={{ width: column.width }}
                        >
                          {/* Make first cell focusable for keyboard navigation */}
                          {colIndex === 0 ? (
                            <div 
                              tabIndex={0}
                              className="focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded"
                              aria-label={`Row ${index + 1}, ${column.header}: ${value}`}
                            >
                              {cellContent}
                            </div>
                          ) : (
                            cellContent
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table summary for screen readers */}
      <div className="sr-only" aria-live="polite">
        Table showing {sortedData.length} of {data.length} rows.
        {selectedRows.size > 0 && ` ${selectedRows.size} rows selected.`}
        {sortBy && ` Sorted by ${columns.find(col => col.key === sortBy)?.header}.`}
      </div>

      {/* Responsive card view for mobile */}
      {responsive && (
        <div className="sm:hidden space-y-4">
          {sortedData.map((row, index) => {
            const rowId = getRowId(row, index);
            const isSelected = selectedRows.has(rowId);

            return (
              <div
                key={`card-${rowId}`}
                className={cn(
                  "bg-white border border-slate-200 rounded-lg p-4 space-y-2",
                  isSelected && "border-blue-300 bg-blue-50"
                )}
              >
                {selectable && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                      className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                    />
                    <span className="text-sm font-medium">Select this item</span>
                  </label>
                )}
                
                {visibleColumns.map((column) => {
                  const value = row[column.key];
                  const cellContent = column.render ? column.render(value, row, index) : value;

                  return (
                    <div key={String(column.key)} className="flex justify-between items-start">
                      <dt className="text-sm font-medium text-slate-500 min-w-0 flex-1">
                        {column.header}:
                      </dt>
                      <dd className="text-sm text-slate-900 ml-2 text-right">
                        {cellContent}
                      </dd>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Table actions */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <div>
          Showing {sortedData.length} of {data.length} {sortedData.length === 1 ? 'item' : 'items'}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
        
        {selectedRows.size > 0 && (
          <div className="flex items-center space-x-2">
            <span>{selectedRows.size} selected</span>
            <button
              onClick={() => onSelectionChange?.(new Set())}
              className="text-slate-500 hover:text-slate-700 underline focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}