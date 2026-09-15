import React from 'react';

export function Skeleton({ className = '', variant = 'rect' }) {
  const variantStyles = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4 w-full',
  };

  return (
    <div
      className={`animate-shimmer bg-zinc-900 border border-zinc-850 ${variantStyles[variant] || ''} ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="w-full space-y-3 p-4 rounded-xl border border-zinc-900 bg-zinc-950/60">
      <div className="flex gap-4 pb-3 border-b border-zinc-900">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/80 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
