import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LanguageScreen() {
  const router = useRouter();
  const { setLanguage, t } = useLanguage(); // Utiliser le hook useLanguage

  const handleLanguageSelect = async (lang: 'fr' | 'en') => {
    console.log('ok')
    await setLanguage(lang);
    console.log('kkk')
    router.replace("welcome");
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#165694" />
      <LinearGradient
        colors={['#165694', '#1976d2', '#2196f3']}
        style={styles.container}
      >
        {/* Background decoration */}
        <View style={styles.backgroundDecoration}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>
        
        {/* Header avec logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Étoiles décoratives */}
          <View style={styles.starsContainer}>
            <View style={[styles.star, styles.star1]}>
              <Text style={styles.starText}>★</Text>
            </View>
            <View style={[styles.star, styles.star2]}>
              <Text style={styles.starText}>★</Text>
            </View>
            <View style={[styles.star, styles.star3]}>
              <Text style={styles.starText}>★</Text>
            </View>
          </View>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.welcomeText}>{t('language.welcome')}</Text>
          <Text style={styles.title}>
            {t('language.title')}
          </Text>
          
          <View style={styles.languageContainer}>
            {/* Bouton Français */}
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => handleLanguageSelect('fr')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ffffff', '#f8f9ff']}
                style={styles.buttonGradient}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.flagContainer}>
                    <Image
                      source={require('../assets/images/image2.jpg')}
                      style={styles.flag}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.languageText}>{t('language.french')}</Text>
                    <Text style={styles.languageSubText}>France</Text>
                  </View>
                  <View style={styles.arrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Bouton English */}
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => handleLanguageSelect('en')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ffffff', '#f8f9ff']}
                style={styles.buttonGradient}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.flagContainer}>
                    <Image
                      source={require('../assets/images/image1.jpg')}
                      style={styles.flag}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.languageText}>{t('language.english')}</Text>
                    <Text style={styles.languageSubText}>États-Unis</Text>
                  </View>
                  <View style={styles.arrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.colorIndicator}>
            <View style={styles.orangeDot} />
            <View style={styles.blueDot} />
          </View>
          <Text style={styles.footerText}>KALANSO+</Text>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -75,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.6,
    right: -50,
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: 30,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
  },
  starsContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ee751c',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ee751c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  star1: {
    top: 20,
    right: width * 0.25,
  },
  star2: {
    top: 40,
    right: width * 0.15,
    transform: [{ scale: 0.8 }],
  },
  star3: {
    top: 60,
    right: width * 0.3,
    transform: [{ scale: 0.6 }],
  },
  starText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  languageContainer: {
    width: '100%',
    maxWidth: 350,
  },
  languageButton: {
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    borderRadius: 20,
    padding: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  flagContainer: {
    width: 50,
    height: 35,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  flag: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    marginLeft: 20,
  },
  languageText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#165694',
    marginBottom: 2,
  },
  languageSubText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ee751c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  colorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orangeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ee751c',
    marginRight: 8,
  },
  blueDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#165694',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
  },
});