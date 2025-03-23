import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your translation files
const resources = {
  en: {
    translation: require('./locales/en.json')
  },
  hi: {
    translation: require('./locales/hi.json')
  }
};

// Get saved language preference or use browser language
const savedLanguage = localStorage.getItem('language') || 
  (navigator.language.startsWith('hi') ? 'hi' : 'en');

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;