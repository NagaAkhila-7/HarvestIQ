import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, LogOut, Cpu, Menu } from 'lucide-react';
import { notificationApi } from '../../api/notificationApi';
import { Link } from 'react-router-dom';

export const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      notificationApi.getNotifications()
        .then(res => {
          const unread = (res.notifications || []).filter(n => !n.isRead).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-emerald-600 text-white font-bold text-base tracking-wider">
            HIQ
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg group-hover:text-emerald-500 transition-colors">
              HarvestIQ
            </span>
            <span className="hidden lg:inline-block ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              FPO AI Engine
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          to="/copilot"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          <Cpu className="w-4 h-4" />
          <span className="hidden sm:inline">AI Copilot</span>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        <Link
          to="/notifications"
          className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{user?.role}</div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
