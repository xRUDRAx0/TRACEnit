import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="w-full solid-card p-12 text-center flex flex-col items-center justify-center my-6 border border-border rounded-lg bg-surface/50">
      <div className="w-10 h-10 rounded-md bg-surface-secondary border border-border flex items-center justify-center text-text-muted mb-4">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary max-w-md font-normal leading-relaxed mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

