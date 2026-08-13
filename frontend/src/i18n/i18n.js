import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import te from './locales/te.json';
import hi from './locales/hi.json';

const resources = {
  en: { translation: en },
  te: { translation: te },
  hi: { translation: hi }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'te', 'hi'],
    debug: false,

    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'harvestiq_language',
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false
    },

    // Safe missing key handler to ensure NO raw dots or keys like "app.title" or "nav.dashboard" ever display if missing
    parseMissingKeyHandler: (key) => {
      if (!key) return '';
      const parts = key.split('.');
      const lastPart = parts[parts.length - 1];
      // Convert camelCase or dots to clean Capitalized English words
      return lastPart
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }
  });

export default i18n;
