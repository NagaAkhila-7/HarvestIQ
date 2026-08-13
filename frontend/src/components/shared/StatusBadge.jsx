import React from 'react';
import { useTranslation } from 'react-i18next';

export const StatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const getBadgeStyle = (val) => {
    const s = String(val || '').toLowerCase();
    if (s.includes('approved') || s.includes('normal') || s.includes('active') || s.includes('completed') || s.includes('passed') || s.includes('good') || s.includes('in stock') || s.includes('low')) {
      return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80';
    }
    if (s.includes('pending') || s.includes('submitted') || s.includes('warning') || s.includes('review') || s.includes('under') || s.includes('low stock') || s.includes('reorder') || s.includes('medium')) {
      return 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80';
    }
    if (s.includes('reject') || s.includes('critical') || s.includes('out of stock') || s.includes('cancelled') || s.includes('suspended') || s.includes('expired') || s.includes('failed') || s.includes('high')) {
      return 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  const formatTranslatedStatus = (val) => {
    if (!val) return 'Unknown';
    const s = String(val).toLowerCase().trim();
    if (s === 'active') return t('status.active');
    if (s === 'inactive') return t('status.inactive');
    if (s === 'pending' || s === 'pending review') return t('status.pending');
    if (s === 'approved') return t('status.approved');
    if (s === 'rejected') return t('status.rejected');
    if (s === 'received') return t('status.received');
    if (s === 'critical') return t('status.critical');
    if (s === 'warning') return t('status.warning');
    if (s === 'in stock' || s === 'normal') return t('status.inStock');
    if (s === 'low stock' || s === 'reorder point') return t('status.lowStock');
    if (s === 'out of stock') return t('status.outOfStock');
    if (s === 'passed') return t('status.passed');
    if (s === 'failed') return t('status.failed');
    if (s === 'low' || s === 'low risk') return t('status.low');
    if (s === 'medium' || s === 'medium risk') return t('status.medium');
    if (s === 'high' || s === 'high risk') return t('status.high');
    if (s === 'under review') return t('status.underReview');
    if (s === 'suspended') return t('status.suspended');
    if (s === 'vegetative') return t('status.vegetative');
    if (s === 'flowering') return t('status.flowering');
    if (s === 'harvesting') return t('status.harvesting');
    return val;
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap ${getBadgeStyle(status)}`}>
      {formatTranslatedStatus(status)}
    </span>
  );
};
