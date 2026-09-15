import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'brand' | 'ghost' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg' | 'icon'
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-black';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    icon: 'p-2 aspect-square',
  };

  const variantStyles = {
    // Primary CTA: Solid white with black text (Recovera signature aesthetic)
    primary: 'bg-white text-black hover:bg-zinc-200 active:bg-zinc-300 font-semibold shadow-sm',
    // Secondary: Dark background with subtle border
    secondary: 'bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-zinc-100 border border-zinc-800 hover:border-zinc-700',
    // Outline: Transparent with border
    outline: 'bg-transparent hover:bg-zinc-900 active:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800',
    // Brand Accent: Subtle green tint or solid green CTA
    brand: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    brandSubtle: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    // Danger
    danger: 'bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/35 text-red-400 border border-red-500/30',
    // Ghost
    ghost: 'bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}

export default Button;
