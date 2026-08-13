import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { StatusBadge } from '../components/shared/StatusBadge';
import { inventoryApi } from '../api/inventoryApi';
import { aiApi } from '../api/aiApi';
import { procurementApi } from '../api/procurementApi';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Sparkles, Layers, AlertCircle, ShoppingCart, CheckCircle, ArrowRight } from 'lucide-react';

export const ReplenishmentWorkbench = () => {
  const { hasRole } = useAuth();
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const canCreatePR = hasRole('Administrator', 'Procurement Manager', 'Inventory Planner');

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, recRes] = await Promise.all([
        inventoryApi.getItems(),
        aiApi.getRecommendations()
      ]);
      setItems(itemsRes.items || []);
      setRecommendations(recRes.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePRFromItem = async (item) => {
    if (submittingId === item._id) return;
    setSubmittingId(item._id);

    const qty = Math.max(item.reorderPoint * 2 - item.currentStock, item.minOrderQuantity || 50);
    try {
      await procurementApi.createPurchaseRequest({
        items: [
          {
            itemId: item._id,
            quantity: qty,
            estimatedUnitCost: item.unitCost
          }
        ],
        reason: `Auto-replenishment triggered from workbench for SKU ${item.sku}`
      });
      alert(`Created Purchase Request for ${qty} ${item.unit} of ${item.name}!`);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create purchase request');
    } finally {
      setSubmittingId(null);
    }
  };

  const lowStockItems = items.filter(i => (i.currentStock || 0) <= i.reorderPoint);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('replenishment.title')}
        description={t('replenishment.description')}
        actions={
          <Button variant="primary" size="sm" onClick={loadData} isLoading={loading}>
            <Sparkles className="w-4 h-4 mr-1" />
            {t('dashboard.refreshMetrics')}
          </Button>
        }
      />

      {/* Critical Stockout Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{t('replenishment.recommendationsCount')} ({lowStockItems.length})</span>
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="text-xs text-slate-500 p-6 text-center">{t('inventory.noItems')}</div>
            ) : (
              lowStockItems.map(item => (
                <div key={item._id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {t('replenishment.onHand')}: <span className="font-bold text-rose-600 dark:text-rose-400">{item.currentStock} {item.unit}</span> | {t('replenishment.reorderThreshold')}: {item.reorderPoint} {item.unit}
                    </div>
                  </div>
                  {canCreatePR && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleCreatePRFromItem(item)}
                      isLoading={submittingId === item._id}
                    >
                      {t('replenishment.generatePr')}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Decision Support Directives */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>{t('dashboard.aiRecommendations')}</span>
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recommendations.length === 0 ? (
              <div className="text-xs text-slate-500 p-6 text-center">{t('dashboard.noPendingRecs')}</div>
            ) : (
              recommendations.map(rec => (
                <div key={rec._id} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                    <span>{rec.title}</span>
                    <StatusBadge status={rec.status} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{rec.conciseExplanation || rec.summary}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
