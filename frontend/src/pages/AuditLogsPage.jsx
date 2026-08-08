import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { auditApi } from '../api/auditApi';
import { ShieldCheck, Search, Filter } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await auditApi.getAuditLogs({ action: actionFilter });
      setLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Append-Only Audit Logs"
        description="Immutable audit trail recording all user logins, data updates, AI recommendation decisions, and configuration changes."
      />

      <div className="glass-card p-4 flex justify-between items-center">
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Action Types</option>
          <option value="LOGIN">LOGIN</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="APPROVAL">APPROVAL</option>
          <option value="REJECTION">REJECTION</option>
          <option value="OVERRIDE">OVERRIDE</option>
          <option value="AI_EXECUTION">AI_EXECUTION</option>
          <option value="CONFIG_CHANGE">CONFIG_CHANGE</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">User</th>
              <th className="p-4">Action</th>
              <th className="p-4">Entity Type</th>
              <th className="p-4">Details</th>
              <th className="p-4">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading audit ledger...</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 text-slate-500 font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-4">
                    <div className="font-bold">{log.userName || 'System'}</div>
                    <div className="text-[11px] text-slate-400">{log.userRole}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{log.action}</td>
                  <td className="p-4">{log.entityType}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">{log.details}</td>
                  <td className="p-4"><StatusBadge status={log.outcome} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
