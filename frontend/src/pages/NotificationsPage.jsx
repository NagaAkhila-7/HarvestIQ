import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { StatusBadge } from '../components/shared/StatusBadge';
import { notificationApi } from '../api/notificationApi';
import { Bell, CheckCheck, AlertCircle, ShieldAlert } from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifRes, alertRes] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getAlerts()
      ]);
      setNotifications(notifRes.notifications || []);
      setAlerts(alertRes.alerts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Operational Alerts"
        description="System alerts, stockout warnings, AI recommendation notifications, and purchase order approvals."
        actions={
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4 mr-1" />
            Mark All Read
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Notifications */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <span>Assigned System Notifications</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-xs text-slate-500 py-8 text-center">No notifications.</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={`p-4 rounded-xl border transition-colors ${
                    n.isRead
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-slate-100 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Operational Alerts */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <span>Active Supply Chain Exceptions</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-xs text-slate-500 py-8 text-center">No active alerts.</div>
            ) : (
              alerts.map(a => (
                <div key={a._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{a.title}</span>
                    <StatusBadge status={a.severity} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{a.message}</p>
                  {a.recommendedAction && (
                    <div className="mt-2 p-2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                      Recommended Fix: {a.recommendedAction}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
