import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";
import ga from "./locales/ga.json";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ga: { translation: ga },
    es: { translation: es }
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
