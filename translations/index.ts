import { useEffect, useState } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';

export type Language = 'en' | 'pt';

export function useTranslation() {
  const { t } = useI18nextTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const language = i18n.language as Language;

  useEffect(() => {
    AsyncStorage.getItem('language').then(lang => {
      if (lang === 'pt' || lang === 'en') {
        i18n.changeLanguage(lang);
      }
      setIsLoaded(true);
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    await AsyncStorage.setItem('language', lang);
    await i18n.changeLanguage(lang);
  };

  return { t, language, setLanguage, isLoaded };
}
