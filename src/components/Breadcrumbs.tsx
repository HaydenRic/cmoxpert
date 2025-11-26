import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-sm ${className}`}>
      <Link
        to="/dashboard"
        className="flex items-center text-slate-500 hover:text-slate-700 transition-colors"
        aria-label="Go to Dashboard"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;

        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />

            {isLast ? (
              <span className="flex items-center font-medium text-slate-900">
                {Icon && <Icon className="w-4 h-4 mr-1.5" />}
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                className="flex items-center text-slate-500 hover:text-slate-700 transition-colors"
              >
                {Icon && <Icon className="w-4 h-4 mr-1.5" />}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center text-slate-500">
                {Icon && <Icon className="w-4 h-4 mr-1.5" />}
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
