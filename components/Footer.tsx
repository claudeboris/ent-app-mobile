import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import useTranslation from '../hooks/useLanguage';

export default function Footer() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.copyright}>© 2024 ENT</Text>
      <TouchableOpacity onPress={toggleLanguage}>
        <Text style={styles.language}>{language.toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 20,
    paddingBottom: 10,
  },
  copyright: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  language: {
    fontSize: 12,
    color: '#3949AB',
    fontWeight: 'bold',
  },
});