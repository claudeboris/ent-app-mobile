import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../constants/translations';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [isLoaded, setIsLoaded] = useState(false);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
  };

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const t = (key: string): string => {
    if (!isLoaded) return key; // Retourne la clé si le chargement n'est pas terminé
    
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Retourne la clé si la traduction n'existe pas
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  useEffect(() => {
    loadLanguage();
  }, []);

  // Ne pas rendre les enfants tant que la langue n'est pas chargée
  if (!isLoaded) {
    return null; // Ou un composant de chargement
  }

  return (
    
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}