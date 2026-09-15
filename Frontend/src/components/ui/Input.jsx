import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  required,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-zinc-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          required={required}
          className={`w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-150 focus:border-zinc-500 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-zinc-500 mt-1">{helperText}</p>}
    </div>
  );
}

export default Input;
