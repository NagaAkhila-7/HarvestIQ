import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSelector = ({ className = '', isCompact = false }) => {
  const { i18n } = useTranslation();

  const currentLang = i18n.language ? i18n.language.split('-')[0] : 'en';

  const languages = [
    { code: 'en', label: 'English', nativeName: 'English' },
    { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' }
  ];

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('harvestiq_language', newLang);
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 pointer-events-none" />
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        aria-label="Select Language"
        className={`bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors ${
          isCompact ? 'py-1 px-2 text-xs' : 'py-1.5 px-2.5 text-xs'
        }`}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            {lang.nativeName} ({lang.code.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
};
