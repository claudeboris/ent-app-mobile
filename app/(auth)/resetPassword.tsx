import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleBack = () => {
    router.back();
  };
  
  const handleConfirm = () => {
    if (password !== confirmPassword) {
      alert(t('resetPassword.passwordMismatch'));
      return;
    }
    
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || password.length < 8) {
      alert(t('resetPassword.invalidPassword'));
      return;
    }
    
    // Logic pour confirmer le nouveau mot de passe
    console.log('Reset password:', { password, confirmPassword });
    // Navigation vers l'écran de connexion ou success
    router.push('login');
  };
  
  // Vérification des critères du mot de passe
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLength = password.length >= 8;
  
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
            <Text style={styles.title}>{t('resetPassword.title')}</Text>
            <Text style={styles.subtitle}>{t('resetPassword.subtitle')}</Text>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            
            {/* New Password field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('resetPassword.password')}</Text>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="• • • • • • • • • •"
                placeholderTextColor="#999"
                secureTextEntry={true}
                autoCapitalize="none"
              />
            </View>
            
            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>{t('resetPassword.requirementsTitle')}</Text>
              
              <View style={styles.requirementItem}>
                <View style={[styles.bullet, hasUppercase && styles.bulletValid]} />
                <Text style={[styles.requirementText, hasUppercase && styles.requirementTextValid]}>
                  {t('resetPassword.requirementsUppercase')}
                </Text>
              </View>
              
              <View style={styles.requirementItem}>
                <View style={[styles.bullet, hasNumber && styles.bulletValid]} />
                <Text style={[styles.requirementText, hasNumber && styles.requirementTextValid]}>
                  {t('resetPassword.requirementsNumber')}
                </Text>
              </View>
              
              <View style={styles.requirementItem}>
                <View style={[styles.bullet, hasMinLength && styles.bulletValid]} />
                <Text style={[styles.requirementText, hasMinLength && styles.requirementTextValid]}>
                  {t('resetPassword.requirementsLength')}
                </Text>
              </View>
            </View>
            
            {/* Confirm Password field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('resetPassword.confirmPassword')}</Text>
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="• • • • • • • • • •"
                placeholderTextColor="#999"
                secureTextEntry={true}
                autoCapitalize="none"
              />
            </View>
            
            {/* Spacer */}
            <View style={styles.spacer} />
            
            {/* Confirm button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.9}
            >
              <Text style={styles.confirmButtonText}>{t('resetPassword.submit')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.copyrightText}>{t('footer.copyright')}</Text>
            <View style={styles.languageContainer}>
              <Text style={styles.languageIcon}>🌐</Text>
              <Text style={styles.languageText}>{t('footer.language')}</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </View>
          </View>
          
          {/* Bottom indicator */}
          <View style={styles.bottomIndicator}>
            <View style={styles.indicator} />
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
    marginBottom: 30,
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
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
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
  requirementsContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  requirementsTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
    marginRight: 12,
  },
  bulletValid: {
    backgroundColor: '#4CAF50',
  },
  requirementText: {
    fontSize: 13,
    color: '#666',
  },
  requirementTextValid: {
    color: '#4CAF50',
  },
  spacer: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#4285f4',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  languageText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginRight: 4,
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#666',
  },
  bottomIndicator: {
    alignItems: 'center',
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
});