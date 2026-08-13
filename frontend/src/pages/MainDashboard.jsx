import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { StatusBadge } from '../components/shared/StatusBadge';
import { reportApi } from '../api/reportApi';
import { aiApi } from '../api/aiApi';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Sprout, 
  DollarSign, 
  ArrowUpRight,
  RefreshCw,
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const MainDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, alertRes, recRes] = await Promise.all([
        reportApi.getDashboardSummary(),
        notificationApi.getAlerts({ status: 'Active' }),
        aiApi.getRecommendations({ status: 'Pending Review' })
      ]);
      setSummary(sumRes);
      setAlerts(alertRes.alerts || []);
      setRecommendations(recRes.recommendations || []);
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const demandTrendData = [
    { month: 'Mar', demand: 180, supply: 210 },
    { month: 'Apr', demand: 220, supply: 200 },
    { month: 'May', demand: 310, supply: 280 },
    { month: 'Jun', demand: 290, supply: 300 },
    { month: 'Jul', demand: 350, supply: 320 },
    { month: 'Aug (Est)', demand: 410, supply: 380 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadDashboardData} isLoading={loading}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('dashboard.refreshMetrics')}</span>
            </Button>
            <Link to="/copilot">
              <Button variant="primary" size="sm">
                <Cpu className="w-3.5 h-3.5" />
                <span>{t('dashboard.launchCopilot')}</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Critical Operational Alerts Banner */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold">{alerts.length} {t('dashboard.activeAlerts')}:</span>
              <span className="ml-1 text-slate-700 dark:text-slate-300">{alerts[0]?.title} - {alerts[0]?.message}</span>
            </div>
          </div>
          <Link to="/notifications" className="font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0 flex items-center gap-1">
            {t('dashboard.reviewAlerts')} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t('dashboard.totalSkus')}</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {summary?.totalItems || 0}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <span>{summary?.lowStockCount || 0} {t('dashboard.itemsReorderPoint')}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t('dashboard.valuationLedger')}</span>
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            KES {(summary?.totalInventoryValue || 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">{t('dashboard.activeValuation')}</div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t('dashboard.procurementOrders')}</span>
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {summary?.activePOs || 0}
          </div>
          <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
            {summary?.pendingPRs || 0} {t('dashboard.prsPending')}
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t('dashboard.aiRecommendations')}</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {recommendations.length}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            {t('dashboard.pendingReview')}
          </div>
        </div>
      </div>

      {/* Demand Drivers Bar */}
      <div className="glass-card p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>{t('dashboard.seasonalDemandDrivers')}</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-[11px] text-slate-500">{t('dashboard.committedAcreage')}</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">50 Acres</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">{t('dashboard.registeredFarms')}</div>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-[11px] text-slate-500">{t('dashboard.activeFarmers')}</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">3 Farmers</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">{t('dashboard.contractedCooperatives')}</div>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-[11px] text-slate-500">{t('dashboard.cropStage')}</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">Vegetative</div>
            <div className="text-[10px] text-amber-600 font-medium mt-0.5">{t('dashboard.fertilizerPeak')}</div>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-[11px] text-slate-500">{t('dashboard.projectedYield')}</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">92,000 kg</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">{t('dashboard.gradeA')}</div>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 lg:col-span-2 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t('dashboard.demandTrajectory')}</h3>
              <p className="text-xs text-slate-500">{t('dashboard.demandTrajectorySubtitle')}</p>
            </div>
            <Link to="/forecasting" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              {t('dashboard.forecastAnalytics')} →
            </Link>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandTrendData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="demand" name="Demand (Bags)" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="supply" name="Replenished Stock" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations Quick Action List */}
        <div className="glass-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>{t('dashboard.aiRecommendations')}</span>
              </h3>
              <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">{recommendations.length} Pending</span>
            </div>

            <div className="space-y-3 mt-3">
              {recommendations.length === 0 ? (
                <div className="text-xs text-slate-500 py-8 text-center">{t('dashboard.noPendingRecs')}</div>
              ) : (
                recommendations.slice(0, 3).map((rec) => (
                  <div key={rec._id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{rec.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-2">{rec.summary}</div>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>Conf: {rec.confidenceScore}%</span>
                      <StatusBadge status={rec.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link to="/recommendations">
            <Button variant="outline" size="sm" className="w-full">
              {t('dashboard.decisionWorkbench')} →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
