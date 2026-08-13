import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/shared/LanguageSelector';
import { Sprout, TrendingUp, ShieldCheck, Cpu, ArrowRight, BarChart3, Layers, CheckCircle, Sparkles, Sun, Moon } from 'lucide-react';

export const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans scroll-smooth transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-40">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-600 text-white font-bold text-lg sm:text-xl">
            HIQ
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
            HarvestIQ
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <a href="#capabilities" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t('nav.capabilities')}</a>
          <a href="#decision-support" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t('nav.decisionSupport')}</a>
          <a href="#benefits" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t('nav.fpoBenefits')}</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector isCompact />

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('common.theme')}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          <Link
            to="/login"
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all"
          >
            {t('nav.signIn')}
          </Link>
          <Link
            to="/register"
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20 transition-all flex items-center gap-1.5"
          >
            <span>{t('nav.register')}</span>
            <ArrowRight className="w-4 h-4 hidden sm:inline" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 px-6 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('landing.heroTagline')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl leading-tight">
          {t('landing.heroTitleLine1')} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
            {t('landing.heroTitleLine2')}
          </span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          {t('landing.heroDescription')}
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            to="/login"
            className="px-6 py-3.5 text-sm sm:text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/20 transition-all flex items-center gap-2"
          >
            <span>{t('landing.launchPortal')}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/register"
            className="px-6 py-3.5 text-sm sm:text-base font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all"
          >
            {t('landing.createFreeAccount')}
          </Link>
        </div>

        {/* Hero Features Bar */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl text-left">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('landing.demandForecastingTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('landing.demandForecastingDesc')}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <Layers className="w-6 h-6 text-teal-600 dark:text-teal-400 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('landing.smartReplenishmentTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('landing.smartReplenishmentDesc')}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <Cpu className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('landing.geminiCopilotTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('landing.geminiCopilotDesc')}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('landing.humanControlTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('landing.humanControlDesc')}</p>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-20 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t('landing.endToEndPlatform')}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              {t('landing.coopRolesTitle')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              {t('landing.coopRolesDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 w-fit">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-emerald-400">{t('landing.procurementManagersRole')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('landing.procurementManagersDesc')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 w-fit">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-teal-400">{t('landing.inventoryPlannersRole')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('landing.inventoryPlannersDesc')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 w-fit">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-cyan-400">{t('landing.agronomistsRole')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('landing.agronomistsDesc')}</p>
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
                <span>{t('landing.aiArchitectureBadge')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('landing.aiProposesTitle')}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {t('landing.aiProposesDesc')}
              </p>
              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>{t('landing.conciseExplanations')}</strong> {t('landing.conciseExplanationsDesc')}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>{t('landing.mandatoryOverride')}</strong> {t('landing.mandatoryOverrideDesc')}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>{t('landing.auditTrail')}</strong> {t('landing.auditTrailDesc')}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{t('landing.sampleRecTitle')}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono">{t('landing.confidence')}: 95%</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">{t('landing.sampleRecHeader')}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('landing.sampleRecBody')}
              </p>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                <strong>{t('landing.financialImpact')}</strong> KES 900,000 | <strong>{t('landing.preferredVendor')}</strong> {t('landing.sampleVendorDetails')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FPO Benefits Section */}
      <section id="benefits" className="py-20 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">{t('landing.fpoImpactBadge')}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              {t('landing.transformingCoopsTitle')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              {t('landing.transformingCoopsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">98%</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">{t('landing.slaStatTitle')}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('landing.slaStatDesc')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-3xl font-black text-teal-600 dark:text-teal-400">-35%</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">{t('landing.holdingCostStatTitle')}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('landing.holdingCostStatDesc')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">100%</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">{t('landing.expiryStatTitle')}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('landing.expiryStatDesc')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400">Zero</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">{t('landing.overridesStatTitle')}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('landing.overridesStatDesc')}</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-base shadow-xl shadow-emerald-950/20 hover:opacity-95 transition-opacity"
            >
              <span>{t('landing.getStartedToday')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-xs text-slate-500 bg-white dark:bg-slate-900">
        <p>{t('landing.footerRights')}</p>
      </footer>
    </div>
  );
};
