import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { authApi } from '../api/authApi';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/shared/LanguageSelector';
import { Sun, Moon, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[ForgotPassword] Submit started for email:', email);

    try {
      console.log('[ForgotPassword] Dispatching POST /auth/forgot-password');
      const res = await authApi.forgotPassword(email);
      console.log('[ForgotPassword] POST response received:', res);
      setResultData(res);
    } catch (err) {
      console.error('[ForgotPassword] API Error:', err.message || err);
      setError(err.message || 'Failed to connect to backend server. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-slate-100 flex flex-col justify-between p-4">
      {/* Header Bar */}
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
        <h2 className="text-2xl font-bold text-white mb-1">{t('auth.forgotTitle')}</h2>
        <p className="text-xs text-slate-400 mb-6">{t('auth.forgotSubtitle')}</p>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {resultData ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold leading-relaxed">
              {resultData.message}
            </div>

            {/* Development-safe reset link mechanism */}
            {resultData.devResetUrl && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-2 text-xs">
                <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Development Reset Link:</div>
                <p className="text-slate-300">Click below to reset password directly:</p>
                <Link
                  to={`/reset-password?token=${resultData.devResetToken}`}
                  className="inline-block px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {t('auth.resetTitle')} →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.emailLabel')}
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" className="w-full py-2.5" isLoading={loading}>
              {t('auth.sendResetLink')}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('nav.signIn')}
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-500 pb-2">
        <Link to="/" className="hover:underline">{t('nav.backToHome')}</Link>
      </div>
    </div>
  );
};
