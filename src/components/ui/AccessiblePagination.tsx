import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  siblingCount?: number;
  className?: string;
  disabled?: boolean;
  itemsPerPage?: number;
  totalItems?: number;
  itemName?: string;
}

export function AccessiblePagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  siblingCount = 1,
  className,
  disabled = false,
  itemsPerPage,
  totalItems,
  itemName = "items"
}: PaginationProps) {
  // Calculate page range to display
  const pageRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5; // First, Last, Current, 2 siblings, 2 dots

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, 'dots', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, 'dots', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, 'dots', ...middleRange, 'dots', totalPages];
    }

    return [];
  }, [currentPage, totalPages, siblingCount]);

  const handlePageClick = (page: number) => {
    if (disabled || page === currentPage || page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  const getItemRange = () => {
    if (!itemsPerPage || !totalItems) return null;
    
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    return { start, end };
  };

  const itemRange = getItemRange();

  if (totalPages <= 1) {
    return itemRange ? (
      <div className="text-sm text-slate-600">
        Showing {itemRange.start} to {itemRange.end} of {totalItems} {itemName}
      </div>
    ) : null;
  }

  return (
    <nav 
      role="navigation" 
      aria-label="Pagination"
      className={cn("flex items-center justify-between", className)}
    >
      {/* Items info */}
      {itemRange && (
        <div className="text-sm text-slate-600">
          Showing <span className="font-medium">{itemRange.start}</span> to{' '}
          <span className="font-medium">{itemRange.end}</span> of{' '}
          <span className="font-medium">{totalItems}</span> {itemName}
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* First page */}
        {showFirstLast && currentPage > 1 && (
          <button
            onClick={() => handlePageClick(1)}
            disabled={disabled}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
              disabled
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-700 hover:bg-slate-100"
            )}
            aria-label="Go to first page"
          >
            First
          </button>
        )}

        {/* Previous page */}
        {showPrevNext && (
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            className={cn(
              "p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
              disabled || currentPage === 1
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-700 hover:bg-slate-100"
            )}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageRange.map((page, index) => {
            if (page === 'dots') {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-3 py-2 text-slate-400"
                  aria-hidden="true"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const pageNumber = page as number;
            const isCurrent = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageClick(pageNumber)}
                disabled={disabled}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
                  isCurrent
                    ? "bg-slate-900 text-white"
                    : disabled
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                aria-label={isCurrent ? `Current page, page ${pageNumber}` : `Go to page ${pageNumber}`}
                aria-current={isCurrent ? "page" : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next page */}
        {showPrevNext && (
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            className={cn(
              "p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
              disabled || currentPage === totalPages
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-700 hover:bg-slate-100"
            )}
            aria-label="Go to next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Last page */}
        {showFirstLast && currentPage < totalPages && (
          <button
            onClick={() => handlePageClick(totalPages)}
            disabled={disabled}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
              disabled
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-700 hover:bg-slate-100"
            )}
            aria-label="Go to last page"
          >
            Last
          </button>
        )}
      </div>

      {/* Alternative: Simple page input for direct navigation */}
      <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
        <span>Go to page:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= totalPages) {
              handlePageClick(page);
            }
          }}
          className="w-16 px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          aria-label="Page number input"
        />
        <span>of {totalPages}</span>
      </div>
    </nav>
  );
}