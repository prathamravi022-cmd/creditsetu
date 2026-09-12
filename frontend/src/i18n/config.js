import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import bn from './locales/bn.json';
import mr from './locales/mr.json';
import kn from './locales/kn.json';

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('creditsetu_lang') : null;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ta: { translation: ta },
    te: { translation: te },
    bn: { translation: bn },
    mr: { translation: mr },
    kn: { translation: kn },
  },
  lng: saved || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('creditsetu_lang', lng);
  // Update the HTML lang attribute for screen readers
  document.documentElement.lang = lng;
});

// Set initial lang attribute
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || 'en';
}

export default i18n;
