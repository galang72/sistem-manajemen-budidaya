import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  variant?: 'emerald' | 'teal' | 'blue' | 'amber' | 'red' | 'indigo' | 'purple' | 'slate';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export default function StatCard({
  title,
  value,
  subtext,
  icon,
  variant = 'emerald',
  trend,
}: StatCardProps) {
  const iconVariants = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h4 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            {value}
          </h4>
          {subtext && (
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
              {trend && (
                <span
                  className={`font-medium ${
                    trend.isPositive ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {trend.value}
                </span>
              )}
              <span>{subtext}</span>
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-2xl border ${iconVariants[variant]} flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
