import React, { useEffect, useRef, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'danger' | 'success' | 'warning';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  initialFocus?: React.RefObject<HTMLElement>;
  returnFocus?: React.RefObject<HTMLElement>;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  variant = 'default',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  initialFocus,
  returnFocus
}: AccessibleModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements && focusableElements.length > 0) {
      // Focus initial element or first focusable element
      const elementToFocus = initialFocus?.current || focusableElements[0] as HTMLElement;
      elementToFocus?.focus();
    }

    // Return focus when modal closes
    return () => {
      if (returnFocus?.current) {
        returnFocus.current.focus();
      } else if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, initialFocus, returnFocus]);

  // Trap focus within modal
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen || !modalRef.current) return;

    if (event.key === 'Escape' && closeOnEscape) {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === 'Tab') {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleKeyDown]);

  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === overlayRef.current) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-lg';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-full mx-4';
      default: return 'max-w-lg';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'danger': return 'border-red-200';
      case 'success': return 'border-green-200';
      case 'warning': return 'border-yellow-200';
      default: return 'border-slate-200';
    }
  };

  const getVariantIcon = () => {
    switch (variant) {
      case 'danger': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <Info className="w-5 h-5 text-slate-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
      >
        <div
          className={cn(
            "bg-white rounded-xl shadow-2xl border pointer-events-auto w-full",
            getSizeClasses(),
            getVariantClasses(),
            "max-h-[90vh] overflow-hidden flex flex-col",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              {variant !== 'default' && getVariantIcon()}
              <div>
                <h2 id="modal-title" className="text-xl font-semibold text-slate-900">
                  {title}
                </h2>
                {description && (
                  <p id="modal-description" className="text-sm text-slate-600 mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded-lg p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

// Hook for managing modal state with accessibility features
export function useAccessibleModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const triggerRef = useRef<HTMLElement>(null);

  const openModal = useCallback(() => {
    triggerRef.current = document.activeElement as HTMLElement;
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  }, [isOpen, openModal, closeModal]);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    triggerRef
  };
}