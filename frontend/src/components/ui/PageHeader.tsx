import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badgeText?: string;
  badgeType?: 'info' | 'success' | 'warning' | 'accent';
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  badgeText,
  badgeType = 'accent',
  actions,
}: PageHeaderProps) {
  const badgeColorMap = {
    info: 'bg-info/10 text-info border-info/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    accent: 'bg-accent/10 text-accent-hover border-accent/20',
  };

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-border/70">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-md bg-surface-secondary border border-border flex items-center justify-center text-text-secondary shrink-0 mt-0.5">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>
            {badgeText && (
              <span className={`px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider rounded border ${badgeColorMap[badgeType]}`}>
                {badgeText}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-text-secondary mt-0.5 max-w-2xl font-normal leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
