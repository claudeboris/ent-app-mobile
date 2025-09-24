import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profileType } = useLocalSearchParams<{ profileType: 'parent' | 'student' }>();
  
  const [identifier, setIdentifier] = useState('');
  
  const handleBack = () => {
    router.back();
  };
  
  const handleContinue = () => {
   /*  if (!identifier.trim()) {
      alert(t('forgotPassword.error'));
      return;
    } */
    
    // Logic pour envoyer le code de vérification
    console.log('Send verification code to:', identifier);
    
    // Navigation vers l'écran OTP avec les paramètres
    router.push({
      pathname: 'otp',
      params: { 
        profileType,
        identifier 
      }
    });
  };
  
  // Déterminer le label et le placeholder en fonction du type de profil
  const getIdentifierLabel = () => {
    if (profileType === 'parent') {
      return t('forgotPassword.parentIdentifier');
    } else {
      return t('forgotPassword.studentIdentifier');
    }
  };
  
  const getIdentifierPlaceholder = () => {
    if (profileType === 'parent') {
      return t('forgotPassword.parentPlaceholder');
    } else {
      return t('forgotPassword.studentPlaceholder');
    }
  };
  
  const getKeyboardType = () => {
    return profileType === 'parent' ? 'phone-pad' : 'default';
  };
  
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.container}>
        
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          
          {/* User Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.userIconBg}>
              <Text style={styles.userIcon}>👤</Text>
            </View>
          </View>
          
          {/* Title and subtitle */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('forgotPassword.title')}</Text>
            <Text style={styles.subtitle}>
              {t('forgotPassword.subtitle')}
            </Text>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            
            {/* Identifier field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{getIdentifierLabel()}</Text>
              <TextInput
                style={styles.textInput}
                value={identifier}
                onChangeText={setIdentifier}
                placeholder={getIdentifierPlaceholder()}
                placeholderTextColor="#999"
                keyboardType={getKeyboardType()}
                autoCapitalize="none"
              />
            </View>
            
            {/* Instructions spécifiques au type de profil */}
            <Text style={styles.instructions}>
              {profileType === 'parent' 
                ? t('forgotPassword.parentInstructions') 
                : t('forgotPassword.studentInstructions')}
            </Text>
            
            {/* Spacer pour pousser le bouton vers le bas */}
            <View style={styles.spacer} />
            
            {/* Continue button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.9}
            >
              <Text style={styles.continueButtonText}>{t('forgotPassword.submit')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backArrow: {
    fontSize: 28,
    color: '#333',
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  userIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIcon: {
    fontSize: 32,
    color: '#666',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: 'white',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  spacer: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#4285f4',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 70,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});