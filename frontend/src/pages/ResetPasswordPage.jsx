import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { authApi } from '../api/authApi';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, Check, X, Sun, Moon, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDark, toggleTheme } = useTheme();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9!@#$%^&*]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token.trim()) {
      setError('Password reset token is required.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet strength requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({ token, newPassword });
      setSuccess(res.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may be expired.');
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
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-md mx-auto my-auto">
        <h2 className="text-2xl font-bold text-white mb-1">Set New Password</h2>
        <p className="text-xs text-slate-400 mb-6">Enter your security token and choose a new password for your account.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!searchParams.get('token') && (
            <Input
              label="Reset Token"
              type="text"
              placeholder="Paste security reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          )}

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-slate-300">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3.5 py-2 text-sm rounded-lg border bg-slate-800 text-white border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

            {newPassword.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 mt-2 p-2.5 rounded-lg bg-slate-900/80 text-[11px]">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Number/Special symbol</span>
                </div>
              </div>
            )}
          </div>

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined}
            required
          />

          <Button type="submit" variant="primary" className="w-full py-2.5 mt-2" isLoading={loading}>
            Save New Password
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-500 pb-2">
        <Link to="/" className="hover:underline">← Back to Landing Page</Link>
      </div>
    </div>
  );
};
