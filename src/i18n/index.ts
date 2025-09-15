// i18n configuration for Dinner Theater Reservation System
// Supports Dutch (nl) and English (en) with Dutch as default for UI

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import nlTranslations from './locales/nl.json';
import enTranslations from './locales/en.json';

const resources = {
  nl: {
    translation: nlTranslations
  },
  en: {
    translation: enTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'nl', // Default language is Dutch for UI
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // React suspense support
    react: {
      useSuspense: false
    }
  });

export default i18n;
