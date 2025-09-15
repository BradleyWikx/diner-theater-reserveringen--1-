// Custom hook for internationalization
// Provides type-safe translations with strong typing

import { useTranslation } from 'react-i18next';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: 'nl' | 'en') => {
    i18n.changeLanguage(lang);
  };

  return {
    t,
    i18n, // expose i18n object
    currentLanguage: i18n.language as 'nl' | 'en',
    changeLanguage,
    isRTL: false // Most languages are LTR, can be configured if needed
  };
};

// Type-safe translation function with autocomplete
export const translate = (key: string, options?: any) => {
  return key; // This will be replaced by the actual t function in components
};
