import React from 'react';

export function PageHeader({
  title,
  subtitle,
  actions,
  badge,
  children,
  className = '',
}) {
  return (
    <div className={`mb-6 pb-4 border-b border-zinc-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{title}</h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      {children}
    </div>
  );
}

export default PageHeader;
