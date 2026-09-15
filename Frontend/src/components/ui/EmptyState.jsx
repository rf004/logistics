import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

export function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are currently no items matching your criteria or no data has been registered yet.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4 shadow-inner">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>

      <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} icon={actionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
