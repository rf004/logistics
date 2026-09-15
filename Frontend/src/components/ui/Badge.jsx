import React from 'react';

export function Badge({
  children,
  variant = 'default', // 'default' | 'success' | 'warning' | 'danger' | 'info' | 'critical' | 'high' | 'medium' | 'low' | 'neutral'
  size = 'md', // 'sm' | 'md'
  dot = false,
  className = '',
  ...props
}) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    default: 'bg-zinc-900 text-zinc-300 border-zinc-800',
    neutral: 'bg-zinc-900/80 text-zinc-400 border-zinc-800/80',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    danger: 'bg-red-500/10 text-red-400 border-red-500/25',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    critical: 'bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };

  const dotColors = {
    default: 'bg-zinc-400',
    neutral: 'bg-zinc-500',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    info: 'bg-blue-400',
    critical: 'bg-red-400 animate-pulse',
    high: 'bg-orange-400',
    medium: 'bg-amber-400',
    low: 'bg-emerald-400',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border font-mono tracking-tight ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || dotColors.default}`} />
      )}
      {children}
    </span>
  );
}

export default Badge;
