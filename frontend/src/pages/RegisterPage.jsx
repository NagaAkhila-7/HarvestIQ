import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Input } from '../components/shared/Input';
import { Select } from '../components/shared/Select';
import { Button } from '../components/shared/Button';
import { Eye, EyeOff, Check, X, Sun, Moon, ArrowLeft } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Farmer',
    phone: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const password = formData.password;
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9!@#$%^&*]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet strength requirements.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone
      });

      setSuccess('Account created successfully! Redirecting to operational dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
        <div className="flex flex-col items-center mb-6 text-center">
          <h1 className="text-2xl font-black text-white">Create HarvestIQ Account</h1>
          <p className="text-xs text-slate-400 mt-1">Register for FPO Agricultural Demand & Inventory Portal</p>
        </div>

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
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g. Mary Wanjiku"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="mary@harvestiq.org"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formData.email && !isEmailValid ? 'Invalid email format' : undefined}
            required
          />

          <Select
            label="Self-Service Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { label: 'Farmer (Member Farmer)', value: 'Farmer' },
              { label: 'Supplier (Vendor Partner)', value: 'Supplier' },
              { label: 'Viewer (Read-Only Portal)', value: 'Viewer' }
            ]}
          />
          <p className="text-[11px] text-slate-400 -mt-2">
            * Privileged roles (Admin, Procurement Manager, Inventory Planner) require administrator assignment.
          </p>

          <Input
            label="Phone Number (Optional)"
            type="text"
            placeholder="+254 700 000 000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3.5 py-2 text-sm rounded-lg border bg-slate-800 text-white border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            {password.length > 0 && (
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
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={
              formData.confirmPassword && formData.password !== formData.confirmPassword
                ? 'Passwords do not match'
                : undefined
            }
            required
          />

          <Button type="submit" variant="primary" className="w-full py-2.5 mt-2" isLoading={loading}>
            Create HarvestIQ Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-500 pb-2">
        <Link to="/" className="hover:underline flex items-center justify-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Landing Page
        </Link>
      </div>
    </div>
  );
};
