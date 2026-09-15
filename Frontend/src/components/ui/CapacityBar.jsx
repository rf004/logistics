import React from 'react';

export function CapacityBar({
  used = 0,
  total = 100,
  showLabel = true,
  height = 'h-2',
  className = '',
}) {
  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.min(100, Math.max(0, (used / safeTotal) * 100));

  // Determine bar color based on utilization
  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-400';

  if (percentage >= 90) {
    barColor = 'bg-red-500';
    textColor = 'text-red-400';
  } else if (percentage >= 75) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-400';
  }

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Capacity Usage</span>
          <span className={`font-semibold ${textColor}`}>{percentage.toFixed(1)}%</span>
        </div>
      )}

      <div className={`w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80 p-0.5 ${height}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default CapacityBar;
