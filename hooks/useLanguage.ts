import { useLanguage } from '../contexts/LanguageContext';

export default function useTranslation() {
  const { t, language, setLanguage } = useLanguage();
  return { t, language, setLanguage };
}