import React from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { reportApi } from '../api/reportApi';
import { Download, BarChart3, FileSpreadsheet, Layers, Package, ShoppingCart } from 'lucide-react';

export const ReportsPage = () => {
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
        title="Reports & Supply Chain Analytics"
        description="Export operational reports, inventory valuation ledgers, purchase histories, and forecast accuracy metrics."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 w-fit mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Inventory & Stock Balance Report</h3>
            <p className="text-xs text-slate-500 mt-1">Full valuation breakdown of current SKUs, safety stock levels, and batch lot expiries.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleDownload('inventory')}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV Report
          </Button>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 w-fit mb-3">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Procurement & PO Activity Report</h3>
            <p className="text-xs text-slate-500 mt-1">Detailed log of purchase orders, vendor lead times, and goods receiving notes (GRN).</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleDownload('procurement')}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV Report
          </Button>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 w-fit mb-3">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">AI Recommendation Outcomes</h3>
            <p className="text-xs text-slate-500 mt-1">Audit log of approved vs overridden AI recommendations and financial savings.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleDownload('recommendations')}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV Report
          </Button>
        </div>
      </div>
    </div>
  );
};
