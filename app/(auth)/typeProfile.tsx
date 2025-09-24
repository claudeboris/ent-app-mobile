import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleProfileSelect = (profileType: 'parent' | 'student') => {
    // Sauvegarder le type de profil sélectionné
    // Navigation vers l'écran de connexion
    console.log('ok')
    router.push({
      pathname: 'login',
      params: { profileType }
    });
    console.log('okkk', profileType)
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require('../../assets/images/image12.jpg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Content overlay */}
        <View style={styles.overlay}>
          
          {/* Top spacer to push content to bottom */}
          <View style={styles.topSpacer} />
          
          {/* Back button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          
          {/* Bottom content */}
          <View style={styles.bottomContent}>
            
            {/* Title */}
            <Text style={styles.title}>
              {t('profile.title')}
            </Text>
            
            {/* Options */}
            <View style={styles.optionsContainer}>
              
              {/* Parent option */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleProfileSelect('parent')}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.parentIcon}>👥</Text>
                  </View>
                  <Text style={styles.optionText}>{t('profile.parent')}</Text>
                </View>
              </TouchableOpacity>
              
              {/* Student option */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleProfileSelect('student')}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.studentIcon}>👤</Text>
                  </View>
                  <Text style={styles.optionText}>{t('profile.student')}</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Bottom indicator */}
            <View style={styles.bottomIndicator}>
              <View style={styles.indicator} />
            </View>
            
          </View>
        </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topSpacer: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 60,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backArrow: {
    fontSize: 28,
    color: 'white',
    fontWeight: '300',
  },
  bottomContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 30,
    paddingHorizontal: 24,
    paddingBottom: 40,
    minHeight: height * 0.4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
    marginBottom: 30,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginRight: 15,
  },
  parentIcon: {
    fontSize: 20,
    color: '#666',
  },
  studentIcon: {
    fontSize: 20,
    color: '#666',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  bottomIndicator: {
    alignItems: 'center',
    paddingTop: 20,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
});