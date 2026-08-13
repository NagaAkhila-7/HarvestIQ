import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Truck, 
  ShoppingCart, 
  PackageCheck, 
  Sparkles, 
  Sprout, 
  BarChart3, 
  Bell, 
  Users, 
  ShieldCheck, 
  Settings,
  Layers,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const role = user?.role || '';

  const isRoleAllowed = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(role);
  };

  const navItems = [
    { key: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard, roles: [] },
    { 
      key: 'nav.inventory', 
      path: '/inventory', 
      icon: Package, 
      roles: ['Administrator', 'Procurement Manager', 'Inventory Planner', 'Warehouse User', 'Finance Reviewer', 'Field Officer', 'Agronomist', 'Farmer', 'Viewer'] 
    },
    { 
      key: 'nav.replenishment', 
      path: '/replenishment', 
      icon: Layers, 
      roles: ['Administrator', 'Procurement Manager', 'Inventory Planner'] 
    },
    { 
      key: 'nav.forecasting', 
      path: '/forecasting', 
      icon: TrendingUp, 
      roles: ['Administrator', 'Procurement Manager', 'Inventory Planner', 'Agronomist', 'Viewer'] 
    },
    { 
      key: 'nav.recommendations', 
      path: '/recommendations', 
      icon: Sparkles, 
      roles: ['Administrator', 'Procurement Manager', 'Inventory Planner'] 
    },
    { 
      key: 'nav.suppliers', 
      path: '/suppliers', 
      icon: Truck, 
      roles: ['Administrator', 'Procurement Manager', 'Supplier', 'Finance Reviewer'] 
    },
    { 
      key: 'nav.purchaseRequests', 
      path: '/procurement/requests', 
      icon: ShoppingCart, 
      roles: ['Administrator', 'Procurement Manager', 'Inventory Planner'] 
    },
    { 
      key: 'nav.purchaseOrders', 
      path: '/procurement/orders', 
      icon: ShoppingCart, 
      roles: ['Administrator', 'Procurement Manager', 'Warehouse User', 'Supplier', 'Finance Reviewer'] 
    },
    { 
      key: 'nav.receiving', 
      path: '/receiving', 
      icon: PackageCheck, 
      roles: ['Administrator', 'Procurement Manager', 'Warehouse User'] 
    },
    { 
      key: 'nav.farmers', 
      path: '/farmers', 
      icon: Sprout, 
      roles: ['Administrator', 'Field Officer', 'Agronomist', 'Farmer'] 
    },
    { 
      key: 'nav.reports', 
      path: '/reports', 
      icon: BarChart3, 
      roles: ['Administrator', 'Procurement Manager', 'Inventory Planner', 'Finance Reviewer', 'Viewer'] 
    },
    { key: 'nav.notifications', path: '/notifications', icon: Bell, roles: [] },
  ];

  const adminItems = [
    { key: 'nav.users', path: '/users', icon: Users, roles: ['Administrator'] },
    { key: 'nav.auditLogs', path: '/audit-logs', icon: ShieldCheck, roles: ['Administrator', 'Finance Reviewer'] },
    { key: 'nav.settings', path: '/settings', icon: Settings, roles: ['Administrator'] },
  ];

  const visibleNavItems = navItems.filter(i => isRoleAllowed(i.roles));
  const visibleAdminItems = adminItems.filter(i => isRoleAllowed(i.roles));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-35 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 md:static md:z-20 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between p-4 shrink-0 overflow-y-auto h-full transform md:transform-none transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between md:hidden pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold text-sm">HIQ</div>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">HarvestIQ</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {t('nav.operations')}
            </div>
            <nav className="space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t(item.key)}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {visibleAdminItems.length > 0 && (
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {t('nav.administration')}
              </div>
              <nav className="space-y-1">
                {visibleAdminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{t(item.key)}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 mt-6">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('app.version')}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{t('app.tagline')}</div>
        </div>
      </aside>
    </>
  );
};
