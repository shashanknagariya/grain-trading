import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: enTranslations
  },
  hi: {
    translation: hiTranslations
  }
};

const savedLanguage = localStorage.getItem('language');
const defaultLanguage = savedLanguage || (navigator.language.startsWith('hi') ? 'hi' : 'en');

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage']
    },
    react: {
      useSuspense: false
    }
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'hi' ? 'ltr' : 'ltr';
});

export default i18n;