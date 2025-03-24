import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translation files
const resources = {
  en: {
    translation: enTranslations
  },
  hi: {
    translation: hiTranslations
  }
};

// Get saved language preference or use browser language
// const savedLanguage = localStorage.getItem('language') || 
//   (navigator.language.startsWith('hi') ? 'hi' : 'en');

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage']
    }
  });

// Save language preference when it changes
// i18n.on('languageChanged', (lng) => {
//   localStorage.setItem('language', lng);
// });

export default i18n;