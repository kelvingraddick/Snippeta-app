import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageKeys } from '../constants/storageKeys';

import enCommon from '../locales/en/common.json';
import enSnippets from '../locales/en/snippets.json';
import enSettings from '../locales/en/settings.json';
import enAuth from '../locales/en/auth.json';
import enErrors from '../locales/en/errors.json';
import enTutorial from '../locales/en/tutorial.json';
import enKeyboard from '../locales/en/keyboard.json';
import enWidget from '../locales/en/widget.json';

import esCommon from '../locales/es/common.json';
import esSnippets from '../locales/es/snippets.json';
import esSettings from '../locales/es/settings.json';
import esAuth from '../locales/es/auth.json';
import esErrors from '../locales/es/errors.json';
import esTutorial from '../locales/es/tutorial.json';
import esKeyboard from '../locales/es/keyboard.json';
import esWidget from '../locales/es/widget.json';

const LANGUAGE_STORAGE_KEY = storageKeys.LANGUAGE;

const resources = {
  en: {
    common: enCommon,
    snippets: enSnippets,
    settings: enSettings,
    auth: enAuth,
    errors: enErrors,
    tutorial: enTutorial,
    keyboard: enKeyboard,
    widget: enWidget,
  },
  es: {
    common: esCommon,
    snippets: esSnippets,
    settings: esSettings,
    auth: esAuth,
    errors: esErrors,
    tutorial: esTutorial,
    keyboard: esKeyboard,
    widget: esWidget,
  },
};

export const getDeviceLanguage = () => {
  const locales = RNLocalize.getLocales();
  if (locales && locales.length > 0) {
    return locales[0].languageCode || 'en';
  }
  return 'en';
};

const initI18n = async () => {
  // Try to get saved language preference
  let savedLanguage;
  try {
    savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.error('i18n.js -> initI18n: Error getting saved language:', error);
  }

  // Use saved language or detect from device
  const language = savedLanguage || getDeviceLanguage();
  
  // Ensure we have resources for this language, fallback to 'en'
  const finalLanguage = resources[language] ? language : 'en';

  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3',
      resources,
      lng: finalLanguage,
      fallbackLng: 'en',
      defaultNS: 'common',
      ns: ['common', 'snippets', 'settings', 'auth', 'errors', 'tutorial', 'keyboard', 'widget'],
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false,
      },
    });

  return i18n;
};

export const changeLanguage = async (languageCode) => {
  try {
    if (languageCode === null || languageCode === undefined) {
      // Clear stored language to use device default
      await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
      const deviceLang = getDeviceLanguage();
      await i18n.changeLanguage(deviceLang);
    } else {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      await i18n.changeLanguage(languageCode);
    }
  } catch (error) {
    console.error('i18n.js -> changeLanguage: Error changing language:', error);
  }
};

export default initI18n;

