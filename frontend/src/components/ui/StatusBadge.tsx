import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Play, Sparkles, FileText } from 'lucide-react';

export type StatusType = 'draft' | 'pending' | 'approved' | 'running' | 'completed' | 'failed' | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export default function StatusBadge({ status, size = 'sm', showIcon = true }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase();

  let colorClasses = 'bg-surface-secondary text-text-secondary border-border';
  let label = status || 'Unknown';
  let Icon = FileText;

  if (normalized.includes('completed') || normalized.includes('success') || normalized === 'approved') {
    colorClasses = 'bg-success/15 text-success border-success/30';
    label = normalized === 'approved' ? 'Approved' : 'Completed';
    Icon = CheckCircle2;
  } else if (normalized.includes('running') || normalized.includes('in_progress')) {
    colorClasses = 'bg-info/15 text-info border-info/30';
    label = 'Running';
    Icon = Play;
  } else if (normalized.includes('pending') || normalized.includes('review')) {
    colorClasses = 'bg-warning/15 text-warning border-warning/30';
    label = 'Pending Review';
    Icon = Clock;
  } else if (normalized.includes('failed') || normalized.includes('error')) {
    colorClasses = 'bg-error/15 text-error border-error/30';
    label = 'Failed';
    Icon = AlertTriangle;
  } else if (normalized.includes('draft')) {
    colorClasses = 'bg-accent/15 text-accent border-accent/30';
    label = 'Draft Plan';
    Icon = Sparkles;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-sm border uppercase tracking-wider ${sizeClasses} ${colorClasses}`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
    </span>
  );
}

