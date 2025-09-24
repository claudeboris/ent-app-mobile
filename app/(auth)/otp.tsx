import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

export default function OtpScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profileType, identifier } = useLocalSearchParams<{ profileType: 'parent' | 'student', identifier: string }>();
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  
  // Timer pour le renvoi du code
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Empêcher plus d'un caractère
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus sur le prochain input si un chiffre est entré
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };
  
  const handleKeyPress = (e: any, index: number) => {
    // Si backspace et le champ est vide, revenir au champ précédent
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };
  
  const handleVerify = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 4) {
      console.log('Verify OTP:', otpCode);
      // Navigation vers l'écran de réinitialisation de mot de passe
      router.push('resetPassword');
    }
  };
  
  const handleResend = () => {
    // Logic pour renvoyer le code
    console.log('Resend OTP to:', identifier);
    setResendTimer(60); // Démarrer un timer de 60 secondes
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
            <Text style={styles.title}>{t('otp.title')}</Text>
            <Text style={styles.subtitle}>
              {profileType === 'parent' 
                ? t('otp.parentDescription') 
                : t('otp.studentDescription')}
            </Text>
          </View>
          
          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus={true}
              />
            ))}
          </View>
          
          {/* Resend section */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>{t('otp.resend')}</Text>
            <TouchableOpacity 
              onPress={handleResend}
              disabled={resendTimer > 0}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.resendLink,
                resendTimer > 0 && styles.resendLinkDisabled
              ]}>
                {resendTimer > 0 
                  ? `${t('otp.resendLink')} (${resendTimer}s)` 
                  : t('otp.resendLink')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Spacer */}
          <View style={styles.spacer} />
          
          {/* Verify button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              otp.join('').length === 4 ? styles.verifyButtonActive : styles.verifyButtonInactive
            ]}
            onPress={handleVerify}
            activeOpacity={0.9}
            disabled={otp.join('').length !== 4}
          >
            <Text style={[
              styles.verifyButtonText,
              otp.join('').length === 4 ? styles.verifyButtonTextActive : styles.verifyButtonTextInactive
            ]}>
              {t('otp.submit')}
            </Text>
          </TouchableOpacity>
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 8,
    backgroundColor: 'white',
  },
  otpInputFilled: {
    borderColor: '#4285f4',
    backgroundColor: '#f8f9ff',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resendLink: {
    fontSize: 14,
    color: '#4285f4',
    fontWeight: '500',
  },
  resendLinkDisabled: {
    color: '#999',
  },
  spacer: {
    flex: 1,
  },
  verifyButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonActive: {
    backgroundColor: '#4285f4',
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonInactive: {
    backgroundColor: '#e0e0e0',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButtonTextActive: {
    color: 'white',
  },
  verifyButtonTextInactive: {
    color: '#999',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    opacity: 0
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