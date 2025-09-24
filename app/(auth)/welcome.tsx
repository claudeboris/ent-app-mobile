import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../contexts/LanguageContext'; 
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { t } = useLanguage(); 
  const router = useRouter();

  const handleStartPress = () => {
    router.push('typeProfile'); 
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require('../../assets/images/image12.jpg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(238, 117, 28, 0.7)', 'rgba(238, 117, 28, 0.5)', 'rgba(238, 117, 28, 0.8)']}
          style={styles.overlay}
        >
          <View style={styles.container}>
            <View style={styles.spacer} />
            
            <View style={styles.textContainer}>
              <Text style={styles.mainText}>
                {t('welcome.title')}
              </Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartPress}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#165694', '#1976d2']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>{t('welcome.button')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: StatusBar.currentHeight || 44,
  },
  spacer: {
    flex: 1,
  },
  textContainer: {
    marginBottom: 60,
    paddingHorizontal: 10,
  },
  mainText: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'left',
    lineHeight: 42,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: -0.5,
  },
  buttonContainer: {
    paddingBottom: 70,
    alignItems: 'stretch',
  },
  startButton: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});