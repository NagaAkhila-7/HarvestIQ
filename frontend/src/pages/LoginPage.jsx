import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/shared/LanguageSelector';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { Eye, EyeOff, Sun, Moon, ArrowLeft } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password, rememberMe });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-slate-100 flex flex-col justify-between p-4">
      {/* Header Bar with Home link & Theme Toggle */}
      <div className="flex items-center justify-between max-w-md mx-auto w-full pt-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-emerald-600 text-white font-black text-lg">HIQ</div>
          <span className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">HarvestIQ</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector isCompact />
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            title={t('common.theme')}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-md mx-auto my-auto">
        <div className="flex flex-col items-center mb-6 text-center">
          <h1 className="text-2xl font-black text-white">{t('auth.loginTitle')}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('auth.loginSubtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.emailLabel')}
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-slate-300">{t('auth.passwordLabel')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3.5 py-2 text-sm rounded-lg border bg-slate-800 text-white border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800"
              />
              {t('auth.rememberMe')}
            </label>
            <Link to="/forgot-password" className="text-emerald-400 hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5 mt-2" isLoading={loading}>
            {t('auth.signInButton')}
          </Button>

          <div className="mt-4 text-center text-xs text-slate-400">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-emerald-400 font-bold hover:underline">
              {t('nav.register')}
            </Link>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700/60">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            {t('auth.quickDemo')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fillDemoAccount('admin@harvestiq.org', 'Admin')}
              className="px-2 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs text-left truncate"
            >
              👑 Admin
            </button>
            <button
              onClick={() => fillDemoAccount('procurement@harvestiq.org', 'Procurement')}
              className="px-2 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs text-left truncate"
            >
              🛒 Procurement Mgr
            </button>
            <button
              onClick={() => fillDemoAccount('planner@harvestiq.org', 'Planner')}
              className="px-2 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs text-left truncate"
            >
              📦 Inventory Planner
            </button>
            <button
              onClick={() => fillDemoAccount('warehouse@harvestiq.org', 'Warehouse')}
              className="px-2 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs text-left truncate"
            >
              🏭 Warehouse User
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-500 pb-2">
        <Link to="/" className="hover:underline flex items-center justify-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('nav.backToHome')}
        </Link>
      </div>
    </div>
  );
};
