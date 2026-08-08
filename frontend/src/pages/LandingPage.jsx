import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sprout, TrendingUp, ShieldCheck, Cpu, ArrowRight, BarChart3, Layers, CheckCircle, Sparkles, Sun, Moon } from 'lucide-react';

export const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans scroll-smooth transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-40">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xl">
            HIQ
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
            HarvestIQ
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <a href="#capabilities" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Capabilities</a>
          <a href="#decision-support" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">AI Decision Support</a>
          <a href="#benefits" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">FPO Benefits</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Dark/Light Theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2"
          >
            <span>Register Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>AI-Powered Agriculture Demand & Inventory Optimiser</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl leading-tight">
          Eliminate Static Reorder Rules. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
            Optimise Seed, Fertilizer & Crop Supply Chains.
          </span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          HarvestIQ bridges farmer acreage commitments, field observations, and seasonal crop cycles with AI-driven inventory replenishment for Farmer Producer Organisations (FPO).
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            to="/login"
            className="px-6 py-3.5 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/20 transition-all flex items-center gap-2"
          >
            <span>Launch Operations Portal</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/register"
            className="px-6 py-3.5 text-base font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all"
          >
            Create Free Account
          </Link>
        </div>

        {/* Hero Features Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl text-left">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Demand Forecasting</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Predict seed & fertilizer needs based on active acreage & growth stages.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <Layers className="w-6 h-6 text-teal-600 dark:text-teal-400 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Smart Replenishment</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dynamic safety stock formulas eliminating stockouts & cash flow pressure.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <Cpu className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Gemini Copilot</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Natural language operational assistant powered by Google Gemini API.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Human Control</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI decision support with mandatory human review & audit logging.</p>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-20 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">End-to-End Agriculture Platform</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Built for Every Role in Agricultural Cooperatives
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              HarvestIQ breaks down operational silos across procurement managers, warehouse staff, agronomists, and member farmers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 w-fit">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-emerald-400">Procurement Managers</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Automate Purchase Orders, track supplier lead-time accuracy, and evaluate vendor performance scorecards with empirical delivery metrics.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 w-fit">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-teal-400">Inventory Planners</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Monitor batch/lot expiry risks, manage multi-location warehouse bins, and calculate available-to-promise balances dynamically.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 w-fit">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-cyan-400">Agronomists & Field Officers</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Link field observations, crop growth stages, pest risks, and expected yield forecasts directly to input demand requirements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Decision Support Section */}
      <section id="decision-support" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-bold">
                <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>AI Decision Support Architecture</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                AI Proposes. Authorised Humans Decide.
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Unlike black-box automation systems, HarvestIQ uses Google Gemini API to calculate optimal reorder quantities, supplier allocations, and location transfers while keeping authorized managers in full operational control.
              </p>
              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Concise User-Facing Explanations:</strong> Every recommendation presents observable factors, confidence scores, and cash-flow impacts.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Mandatory Override Justification:</strong> Material overrides require documented business rationale recorded to MongoDB.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Append-Only Audit Trail:</strong> Every approval, rejection, and modification is permanently stored for executive review.</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Sample Recommendation</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono">Confidence: 95%</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Reorder 200 Bags of Hybrid Seed Maize H614</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Available stock (75 bags) is below reorder threshold (120 bags). Member farm field commitments require 215 bags over next 30 days.
              </p>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                <strong>Financial Impact:</strong> KES 900,000 | <strong>Preferred Vendor:</strong> Kenya Seed Company (7-Day Lead Time)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FPO Benefits Section */}
      <section id="benefits" className="py-20 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Measurable FPO Impact</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Transforming Cooperative Operations
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              Empowering agricultural cooperatives to maintain high service levels without over-leveraging working capital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">98%</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">Input SLA Fulfillment</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Eliminate seed & fertilizer stockouts during critical planting windows.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-3xl font-black text-teal-600 dark:text-teal-400">-35%</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">Holding Cost Pressure</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Prevent excess inventory accumulation through dynamic safety stock formulas.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">100%</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">Batch Expiry Traceability</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">First-expiry-first-out (FEFO) tracking for chemical & seed lot shelf life.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400">Zero</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">Unauthorized Overrides</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Complete audit accountability across all procurement approvals & changes.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-base shadow-xl shadow-emerald-950/20 hover:opacity-95 transition-opacity"
            >
              <span>Get Started with HarvestIQ Today</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-xs text-slate-500 bg-white dark:bg-slate-900">
        <p>© 2026 HarvestIQ Platform. All rights reserved. Decision Support Architecture for Agriculture FPOs.</p>
      </footer>
    </div>
  );
};
