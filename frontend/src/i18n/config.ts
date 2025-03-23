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

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 