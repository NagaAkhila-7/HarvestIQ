import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = (val) => {
    const s = String(val || '').toLowerCase();
    if (s.includes('approved') || s.includes('normal') || s.includes('active') || s.includes('completed') || s.includes('passed') || s.includes('good')) {
      return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80';
    }
    if (s.includes('pending') || s.includes('submitted') || s.includes('warning') || s.includes('review') || s.includes('under') || s.includes('low stock') || s.includes('reorder')) {
      return 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80';
    }
    if (s.includes('reject') || s.includes('critical') || s.includes('out of stock') || s.includes('cancelled') || s.includes('suspended') || s.includes('expired')) {
      return 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap ${getBadgeStyle(status)}`}>
      {status || 'Unknown'}
    </span>
  );
};
