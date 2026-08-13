import React from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { reportApi } from '../api/reportApi';
import { useTranslation } from 'react-i18next';
import { Download, BarChart3, FileSpreadsheet, Layers, Package, ShoppingCart } from 'lucide-react';

export const ReportsPage = () => {
  const { t } = useTranslation();

  const handleDownload = async (type) => {
    try {
      await reportApi.downloadCsv(type);
    } catch (err) {
      alert(err.message || 'CSV Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reports.title')}
        description={t('reports.description')}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 w-fit mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{t('reports.inventoryValuation')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('dashboard.activeValuation')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleDownload('inventory')}>
            <Download className="w-4 h-4 mr-1.5" />
            {t('reports.exportCsv')}
          </Button>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 w-fit mb-3">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{t('reports.procurementAudit')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('procurement.poTitle')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleDownload('procurement')}>
            <Download className="w-4 h-4 mr-1.5" />
            {t('reports.exportCsv')}
          </Button>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 w-fit mb-3">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{t('dashboard.aiRecommendations')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('dashboard.pendingReview')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleDownload('recommendations')}>
            <Download className="w-4 h-4 mr-1.5" />
            {t('reports.exportCsv')}
          </Button>
        </div>
      </div>
    </div>
  );
};
