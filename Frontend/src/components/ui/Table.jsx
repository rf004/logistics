import React from 'react';

export function Table({ children, className = '', ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950/60">
      <table className={`w-full text-left text-sm text-zinc-300 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '', ...props }) {
  return (
    <thead className={`bg-zinc-900/60 text-xs uppercase tracking-wider text-zinc-400 font-medium border-b border-zinc-850 ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '', ...props }) {
  return (
    <tbody className={`divide-y divide-zinc-900/60 ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', isClickable = false, ...props }) {
  return (
    <tr
      className={`transition-colors duration-150 ${
        isClickable ? 'cursor-pointer hover:bg-zinc-900/40' : 'hover:bg-zinc-900/20'
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '', ...props }) {
  return (
    <th className={`px-4 py-3.5 font-semibold text-zinc-400 ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-4 py-3.5 text-zinc-200 align-middle ${className}`} {...props}>
      {children}
    </td>
  );
}

export default Table;
