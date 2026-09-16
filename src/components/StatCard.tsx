import React from 'react';

interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'rose' | 'amber' | 'indigo' | 'slate';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtext,
  icon,
  variant = 'blue',
  trend,
}) => {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-50/80 text-blue-600 border-blue-100',
      border: 'border-slate-200/90 hover:border-blue-300',
    },
    emerald: {
      bg: 'bg-emerald-50/80 text-emerald-600 border-emerald-100',
      border: 'border-slate-200/90 hover:border-emerald-300',
    },
    rose: {
      bg: 'bg-rose-50/80 text-rose-600 border-rose-100',
      border: 'border-slate-200/90 hover:border-rose-300',
    },
    amber: {
      bg: 'bg-amber-50/80 text-amber-600 border-amber-100',
      border: 'border-slate-200/90 hover:border-amber-300',
    },
    indigo: {
      bg: 'bg-indigo-50/80 text-indigo-600 border-indigo-100',
      border: 'border-slate-200/90 hover:border-indigo-300',
    },
    slate: {
      bg: 'bg-slate-100/80 text-slate-600 border-slate-200',
      border: 'border-slate-200/90 hover:border-slate-300',
    },
  }[variant];

  return (
    <div
      id={id}
      className={`bg-white rounded-xl p-5 border ${variantStyles.border} shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </p>
            {trend && (
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-slate-500 mt-1 truncate font-medium">
              {subtext}
            </p>
          )}
        </div>
        <div
          className={`p-2.5 rounded-xl border ${variantStyles.bg} shrink-0 transition-transform duration-200 group-hover:scale-105`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

