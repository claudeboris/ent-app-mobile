import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, StatusBar, Dimensions, Alert, Modal, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth();
  const { profileType } = useLocalSearchParams();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  
  // Charger les identifiants sauvegardés au montage du composant
  useEffect(() => {
    loadSavedCredentials();
  }, []);
  
  const loadSavedCredentials = async () => {
    try {
      const savedIdentifier = await AsyncStorage.getItem('savedIdentifier');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      const rememberMeStatus = await AsyncStorage.getItem('rememberMe');
      
      if (savedIdentifier && rememberMeStatus === 'true') {
        setIdentifier(savedIdentifier);
        setRememberMe(true);
      }
      if (savedPassword && rememberMeStatus === 'true') {
        setPassword(savedPassword);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des identifiants sauvegardés:', error);
    }
  };
  
  const handleClose = () => {
    router.back();
  };
  
  const validateInputs = () => {
    // Vérifier si les champs sont vides
    if (!identifier || !password) {
      Alert.alert(t('error.title'), t('error.fillAllFields'));
      return false;
    }
    
    // Validation spécifique selon le type de profil
    if (profileType === 'parent') {
      // Validation du numéro de téléphone (format international)
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(identifier)) {
        Alert.alert(t('error.title'), t('error.invalidPhone'));
        return false;
      }
    } else {
      // Validation du numéro matricule (format: 2 lettres suivies de chiffres)
      /* const studentIdRegex = /^[A-Za-z]{2}[0-9]+$/;
      if (!studentIdRegex.test(identifier)) {
        Alert.alert(t('error.title'), t('error.invalidStudentId'));
        return false;
      } */
    }
    
    return true;
  };
  
  const handleLogin = async () => {
    // Validation des champs
    if (!validateInputs()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Préparer les credentials selon le type de profil
      const credentials = profileType === 'parent' 
        ? { telephone: identifier.trim(), motDePasse: password.trim() }
        : { numeroMatricule: identifier.trim(), motDePasse: password.trim() };
        console.log('data', {credentials, password})
      
      const result = await login(credentials, profileType);
      console.log('result', result)
      
      if (result && result.success) {
        // Sauvegarder les identifiants si "Se souvenir de moi" est coché
        if (rememberMe) {
          await AsyncStorage.setItem('savedIdentifier', identifier);
          await AsyncStorage.setItem('savedPassword', password);
          await AsyncStorage.setItem('rememberMe', 'true');
        } else {
          // Supprimer les identifiants sauvegardés si "Se souvenir de moi" n'est pas coché
          await AsyncStorage.removeItem('savedIdentifier');
          await AsyncStorage.removeItem('savedPassword');
          await AsyncStorage.removeItem('rememberMe');
        }
        
        router.push('/(tabs)/(home)/home');
      } else {
        Alert.alert(t('error.title'), result?.message || t('error.loginFailed'));
      }
    } catch (error) {
      Alert.alert(t('error.title'), t('error.connectionError'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = () => {
    setForgotPasswordModalVisible(true);
  };
  
  // Déterminer le placeholder et le label en fonction du type de profil
  const getIdentifierLabel = () => {
    if (profileType === 'parent') {
      return t('login.parentIdentifier');
    } else {
      return t('login.studentIdentifier');
    }
  };
  
  const getIdentifierPlaceholder = () => {
    if (profileType === 'parent') {
      return t('login.parentPlaceholder');
    } else {
      return t('login.studentPlaceholder');
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.container}>
            
            {/* Header avec bouton fermer */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.closeIcon}>✕</Text>
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
                <Text style={styles.title}>{t('login.title')}</Text>
                <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
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
                    keyboardType={profileType === 'parent' ? 'phone-pad' : 'default'}
                    autoCapitalize="none"
                  />
                </View>
                
                {/* Password field */}
                <View style={styles.inputGroup}>
                  <View style={styles.passwordHeader}>
                    <Text style={styles.inputLabel}>{t('login.password')}</Text>
                    <TouchableOpacity onPress={handleForgotPassword}>
                      <Text style={styles.forgotLink}>{t('login.forgot')}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="• • • • • • • • • •"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity 
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Remember me */}
                <TouchableOpacity 
                  style={styles.rememberContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberText}>{t('login.remember')}</Text>
                </TouchableOpacity>
                
                {/* Login button */}
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? t('login.loading') : t('login.submit')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Modal Mot de passe oublié */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={forgotPasswordModalVisible}
            onRequestClose={() => setForgotPasswordModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={() => setForgotPasswordModalVisible(false)}
                  >
                    <Text style={styles.modalCloseIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{t('forgotPassword.modalTitle')}</Text>
                  <Text style={styles.modalMessage}>
                    {t('forgotPassword.modalMessage')}
                  </Text>
                  
                  <View style={styles.contactInfoContainer}>
                    <Text style={styles.contactInfoTitle}>{t('forgotPassword.contactInfoTitle')}</Text>
                    
                    <View style={styles.contactItem}>
                      <Ionicons name="call-outline" size={20} color="#4285f4" />
                      <Text style={styles.contactText}>{t('forgotPassword.contactPhone')}</Text>
                    </View>
                    
                    <View style={styles.contactItem}>
                      <Ionicons name="mail-outline" size={20} color="#4285f4" />
                      <Text style={styles.contactText}>{t('forgotPassword.contactEmail')}</Text>
                    </View>
                    
                    <View style={styles.contactItem}>
                      <Ionicons name="time-outline" size={20} color="#4285f4" />
                      <Text style={styles.contactText}>{t('forgotPassword.contactHours')}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => setForgotPasswordModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>{t('forgotPassword.closeButton')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  header: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  closeIcon: {
    fontSize: 18,
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
    marginBottom: 8,
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
    marginBottom: 24,
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotLink: {
    fontSize: 14,
    color: '#4285f4',
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 3,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4285f4',
    borderColor: '#4285f4',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 14,
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#4285f4',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#a0c3ff',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Styles pour la modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseIcon: {
    fontSize: 18,
    color: '#333',
    fontWeight: '300',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  contactInfoContainer: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  contactInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  modalButton: {
    backgroundColor: '#4285f4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});