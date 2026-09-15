import React from 'react';

export function Card({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  ...props
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-900 bg-zinc-950/80 ${
        hoverEffect ? 'transition-all duration-200 hover:border-zinc-800 hover:bg-zinc-900/40' : ''
      } ${glass ? 'backdrop-blur-md' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-5 pb-3 border-b border-zinc-900/80 flex items-center justify-between gap-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-2 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-zinc-400 mt-0.5 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-4 px-5 border-t border-zinc-900/80 bg-zinc-950/40 rounded-b-xl flex items-center justify-between gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
