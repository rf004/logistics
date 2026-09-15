import React from 'react';

export function Select({
  label,
  error,
  helperText,
  options = [],
  children,
  className = '',
  id,
  required,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-zinc-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <select
        id={selectId}
        required={required}
        className={`w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white transition-all duration-150 focus:border-zinc-500 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-950 text-white">
            {opt.label}
          </option>
        ))}
        {children}
      </select>

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-zinc-500 mt-1">{helperText}</p>}
    </div>
  );
}

export default Select;
