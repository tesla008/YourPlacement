import React from 'react';
import { PlacementStatus } from '../types.ts';
import { CheckCircle2, AlertCircle, GraduationCap, XCircle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: PlacementStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showDot = false }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1 font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2',
  }[size];

  switch (status) {
    case 'Placed':
      return (
        <span
          id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs tracking-tight ${sizeClasses}`}
        >
          {showDot ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          )}
          <span>Placed</span>
        </span>
      );
    case 'Not Placed':
      return (
        <span
          id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
          className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs tracking-tight ${sizeClasses}`}
        >
          {showDot ? (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          )}
          <span>Not Placed</span>
        </span>
      );
    case 'Higher Studies':
      return (
        <span
          id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
          className={`inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs tracking-tight ${sizeClasses}`}
        >
          {showDot ? (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          ) : (
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          )}
          <span>Higher Studies</span>
        </span>
      );
    case 'Not Interested':
      return (
        <span
          id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200/90 shadow-xs tracking-tight ${sizeClasses}`}
        >
          {showDot ? (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          )}
          <span>Not Interested</span>
        </span>
      );
    case 'Other':
    default:
      return (
        <span
          id={`status-badge-${String(status).toLowerCase().replace(/\s+/g, '-')}`}
          className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs tracking-tight ${sizeClasses}`}
        >
          {showDot ? (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          ) : (
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          )}
          <span>{status || 'Unknown'}</span>
        </span>
      );
  }
};

