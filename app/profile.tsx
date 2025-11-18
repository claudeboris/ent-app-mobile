import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext'; // Import du contexte de langue
import api from '../services/api';

export default function ProfileScreen() {
  const { 
    user, 
    profileType, 
    logout, 
    updateUser,
    showSuccessToast,
    showErrorToast
  } = useAuth();
  
  const { t } = useLanguage(); // Hook pour les traductions
  const [activeTab, setActiveTab] = useState('infos');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // États pour les données modifiables
  const [editedInfo, setEditedInfo] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
  });

  // États pour le formulaire de mot de passe
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Charger les données du profil
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Récupérer les données complètes du profil en fonction du rôle
        let endpoint;
        if (profileType === 'parent') {
          endpoint = `/parent/${user.id}`;
        } else {
          endpoint = `/eleve/${user.id}`;
        }
        
        const response = await api.get(endpoint);
        setProfileData(response.data.data);
        
        // Initialiser les données modifiables
        setEditedInfo({
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
          telephone: user.telephone || '',
          adresse: user.adresse || t('profile.addLocation'),
        });
      } catch (error) {
        console.error('Erreur lors du chargement du profil', error);
        showErrorToast(t('error.title'), t('profile.loadingError'));
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user, profileType]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Mettre à jour les informations de l'utilisateur
      const response = await api.patch(`/utilisateurs/${user.id}`, editedInfo);
      
      // Créer l'objet utilisateur mis à jour
      const updatedUser = {
        ...user,
        ...editedInfo
      };
      
      // Mettre à jour l'état local
      setProfileData(prev => ({
        ...prev,
        utilisateur: {
          ...prev.utilisateur,
          ...editedInfo
        }
      }));
      
      // Mettre à jour le contexte Auth pour une synchronisation immédiate
      await updateUser(updatedUser);
      
      setIsEditMode(false);
      showSuccessToast(t('common.success'), t('profile.updateSuccess'));
    } catch (error) {
      console.error('Erreur lors de la mise à jour', error);
      showErrorToast(t('error.title'), t('profile.updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Réinitialiser les données modifiables
    setEditedInfo({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      adresse: user.adresse || t('profile.addLocation'),
    });
    setIsEditMode(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Fonctions pour le formulaire de mot de passe
  const handlePasswordChange = (field, value) => {
    setPasswordData({
      ...passwordData,
      [field]: value
    });
    
    // Effacer l'erreur pour ce champ
    if (passwordErrors[field]) {
      setPasswordErrors({
        ...passwordErrors,
        [field]: null
      });
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = t('profile.passwordErrors.currentRequired');
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = t('profile.passwordErrors.newRequired');
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = t('profile.passwordErrors.tooShort');
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = t('profile.passwordErrors.confirmRequired');
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = t('profile.passwordErrors.mismatch');
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    try {
      let endpoint;
      if (profileType === 'parent') {
        endpoint = `/parents/${user.id}/password`;
      } else {
        endpoint = `/utilisateurs/${user.id}/password`;
      }
      
      await api.put(endpoint, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      showSuccessToast(t('common.success'), t('profile.passwordUpdateSuccess'));
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe', error);
      const errorMessage = error.response?.data?.message || t('profile.passwordUpdateError');
      showErrorToast(t('error.title'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordForm = () => (
    <View style={styles.passwordFormContainer}>
      <Text style={styles.passwordFormTitle}>{t('profile.changePassword')}</Text>
      
      {/* Current Password */}
      <View style={styles.passwordInputContainer}>
        <Text style={styles.passwordInputLabel}>{t('profile.currentPassword')}</Text>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.passwordInput}
            value={passwordData.currentPassword}
            onChangeText={(value) => handlePasswordChange('currentPassword', value)}
            placeholder={t('profile.enterCurrentPassword')}
            secureTextEntry={!showPasswords.current}
          />
          <TouchableOpacity 
            style={styles.passwordToggle}
            onPress={() => toggleShowPassword('current')}
          >
            <Ionicons 
              name={showPasswords.current ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
        {passwordErrors.currentPassword && (
          <Text style={styles.errorText}>{passwordErrors.currentPassword}</Text>
        )}
      </View>
      
      {/* New Password */}
      <View style={styles.passwordInputContainer}>
        <Text style={styles.passwordInputLabel}>{t('profile.newPassword')}</Text>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.passwordInput}
            value={passwordData.newPassword}
            onChangeText={(value) => handlePasswordChange('newPassword', value)}
            placeholder={t('profile.enterNewPassword')}
            secureTextEntry={!showPasswords.new}
          />
          <TouchableOpacity 
            style={styles.passwordToggle}
            onPress={() => toggleShowPassword('new')}
          >
            <Ionicons 
              name={showPasswords.new ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
        {passwordErrors.newPassword && (
          <Text style={styles.errorText}>{passwordErrors.newPassword}</Text>
        )}
        <Text style={styles.passwordHint}>{t('profile.passwordHint')}</Text>
      </View>
      
      {/* Confirm Password */}
      <View style={styles.passwordInputContainer}>
        <Text style={styles.passwordInputLabel}>{t('profile.confirmPassword')}</Text>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.passwordInput}
            value={passwordData.confirmPassword}
            onChangeText={(value) => handlePasswordChange('confirmPassword', value)}
            placeholder={t('profile.confirmNewPassword')}
            secureTextEntry={!showPasswords.confirm}
          />
          <TouchableOpacity 
            style={styles.passwordToggle}
            onPress={() => toggleShowPassword('confirm')}
          >
            <Ionicons 
              name={showPasswords.confirm ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
        {passwordErrors.confirmPassword && (
          <Text style={styles.errorText}>{passwordErrors.confirmPassword}</Text>
        )}
      </View>
      
      {/* Password Requirements */}
      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementsTitle}>{t('profile.securityRequirements')}</Text>
        <Text style={styles.requirementItem}>• {t('profile.requirements.minLength')}</Text>
        <Text style={styles.requirementItem}>• {t('profile.requirements.mixRecommended')}</Text>
        <Text style={styles.requirementItem}>• {t('profile.requirements.avoidObvious')}</Text>
      </View>
      
      {/* Form Actions */}
      <View style={styles.passwordFormActions}>
        <TouchableOpacity 
          style={styles.cancelPasswordButton} 
          onPress={() => {
            setShowPasswordForm(false);
            setPasswordData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
            setPasswordErrors({});
          }}
        >
          <Text style={styles.cancelPasswordButtonText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.submitPasswordButton} 
          onPress={handlePasswordSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitPasswordButtonText}>{t('common.update')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInfoContent = () => (
    <View style={styles.tabContent}>
      {/* Name */}
      <View style={styles.infoItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="person-outline" size={20} color="#666" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{t('profile.name')}</Text>
          {isEditMode ? (
            <TextInput
              style={styles.textInput}
              value={editedInfo.nom}
              onChangeText={(text) => setEditedInfo({...editedInfo, nom: text})}
              placeholder={t('profile.yourName')}
            />
          ) : (
            <Text style={styles.infoValue}>{user?.nom}</Text>
          )}
        </View>
      </View>

      {/* First Name */}
      <View style={styles.infoItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="person-outline" size={20} color="#666" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{t('profile.firstName')}</Text>
          {isEditMode ? (
            <TextInput
              style={styles.textInput}
              value={editedInfo.prenom}
              onChangeText={(text) => setEditedInfo({...editedInfo, prenom: text})}
              placeholder={t('profile.yourFirstName')}
            />
          ) : (
            <Text style={styles.infoValue}>{user?.prenom}</Text>
          )}
        </View>
      </View>
      
      {/* Email */}
      <View style={styles.infoItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{t('profile.email')}</Text>
          {isEditMode ? (
            <TextInput
              style={styles.textInput}
              value={editedInfo.email}
              onChangeText={(text) => setEditedInfo({...editedInfo, email: text})}
              placeholder={t('profile.yourEmail')}
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.infoValue}>{user?.email}</Text>
          )}
        </View>
      </View>
      
      {/* Phone */}
      <View style={styles.infoItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="call-outline" size={20} color="#666" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{t('profile.phone')}</Text>
          {isEditMode ? (
            <TextInput
              style={styles.textInput}
              value={editedInfo.telephone}
              onChangeText={(text) => setEditedInfo({...editedInfo, telephone: text})}
              placeholder={t('profile.yourPhone')}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.infoValue}>{user?.telephone}</Text>
          )}
        </View>
      </View>
      
      {/* Address */}
      <View style={styles.infoItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="location-outline" size={20} color="#666" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{t('profile.address')}</Text>
          {isEditMode ? (
            <TextInput
              style={styles.textInput}
              value={editedInfo.adresse}
              onChangeText={(text) => setEditedInfo({...editedInfo, adresse: text})}
              placeholder={t('profile.yourAddress')}
              multiline
            />
          ) : (
            <Text style={[styles.infoValue, !user?.adresse && styles.placeholderText]}>
              {user?.adresse || t('profile.addLocation')}
            </Text>
          )}
        </View>
      </View>
      
      {/* Password */}
      {!isEditMode && !showPasswordForm && (
        <TouchableOpacity 
          style={styles.infoItem} 
          onPress={() => setShowPasswordForm(true)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t('profile.password')}</Text>
            <Text style={[styles.infoValue, styles.linkText]}>{t('profile.changePassword')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      )}
      
      {/* Password Form */}
      {showPasswordForm && (
        <View style={styles.passwordFormSection}>
          {renderPasswordForm()}
        </View>
      )}
      
      {/* Edit Mode Actions */}
      {isEditMode && (
        <View style={styles.editActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderChildrenContent = () => {
    if (!profileData || !profileData.enfants || profileData.enfants.length === 0) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noDataText}>{t('profile.noChildren')}</Text>
          <TouchableOpacity style={styles.addChildButton}>
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.addChildText}>{t('profile.addChild')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {profileData.enfants.map((child) => (
          <View key={child.utilisateur?._id || Math.random().toString()} style={styles.childItem}>
            <Image
              source={{ 
                uri: child.utilisateur?.photo 
                  ? `https://ent-back.maraboot.tech/api/images/${child.utilisateur.photo}` 
                  : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face' 
              }}
              style={styles.childImage}
            />
            <View style={styles.childInfo}>
              <Text style={styles.childName}>{child.utilisateur?.nomComplet || t('profile.nameNotAvailable')}</Text>
              <Text style={styles.childRole}>{t('profile.student')}</Text>
              <Text style={styles.childClass}>
                {t('profile.class')}: {child.utilisateur?.informationsSpecifiques?.classeActuelle?.nom || t('profile.toBeDetermined')}
              </Text>
            </View>
            <TouchableOpacity style={styles.childMenuButton}>
              <Ionicons name="ellipsis-vertical" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
        
        {/* Add Child Button */}
        <TouchableOpacity style={styles.addChildButton}>
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.addChildText}>{t('profile.addChild')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStudentSpecificInfo = () => {
    if (!profileData || !profileData.eleve) return null;
    
    const { eleve } = profileData;
    const utilisateur = profileData.utilisateur;
    
    return (
      <View style={styles.tabContent}>
        {/* Medical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.medicalInfo')}</Text>
          
          {eleve.informationsMedicales?.allergies && eleve.informationsMedicales.allergies.length > 0 && (
            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="medical-outline" size={20} color="#666" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('profile.allergies')}</Text>
                <Text style={styles.infoValue}>
                  {eleve.informationsMedicales.allergies.join(', ')}
                </Text>
              </View>
            </View>
          )}
          
          {eleve.informationsMedicales?.maladiesChroniques && eleve.informationsMedicales.maladiesChroniques.length > 0 && (
            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="heart-outline" size={20} color="#666" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('profile.chronicDiseases')}</Text>
                <Text style={styles.infoValue}>
                  {eleve.informationsMedicales.maladiesChroniques.join(', ')}
                </Text>
              </View>
            </View>
          )}
        </View>
        
        {/* School Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.schoolInfo')}</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="school-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.currentClass')}</Text>
              <Text style={styles.infoValue}>
                {utilisateur?.informationsSpecifiques?.classeActuelle?.nom || t('profile.notDefined')}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="card-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.studentId')}</Text>
              <Text style={styles.infoValue}>
                {utilisateur?.informationsSpecifiques?.numeroMatricule || t('profile.notDefined')}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="repeat-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.repeating')}</Text>
              <Text style={styles.infoValue}>
                {utilisateur?.informationsSpecifiques?.redoublant ? t('common.yes') : t('common.no')}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.services')}</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="bus-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.schoolTransport')}</Text>
              <Text style={styles.infoValue}>
                {eleve.utiliseTransport ? t('common.yes') : t('common.no')}
              </Text>
            </View>
          </View>
          
          {eleve.utiliseTransport && (
            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={20} color="#666" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('profile.stop')}</Text>
                <Text style={styles.infoValue}>{eleve.arret || t('profile.notDefined')}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="restaurant-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.canteen')}</Text>
              <Text style={styles.infoValue}>
                {eleve.utiliseCantine ? t('common.yes') : t('common.no')}
              </Text>
            </View>
          </View>
          
          {eleve.utiliseCantine && eleve.regimeAlimentaire && eleve.regimeAlimentaire.length > 0 && (
            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="nutrition-outline" size={20} color="#666" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('profile.diet')}</Text>
                <Text style={styles.infoValue}>
                  {eleve.regimeAlimentaire.join(', ')}
                </Text>
              </View>
            </View>
          )}
          
          {eleve.boursier && (
            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="cash-outline" size={20} color="#666" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('profile.scholarship')}</Text>
                <Text style={styles.infoValue}>
                  {eleve.pourcentageBourse}% {t('profile.scholarship')}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('profile.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" /> 
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('home')}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.myProfile')}</Text>
        <TouchableOpacity onPress={isEditMode ? handleCancel : handleEdit}>
          <Text style={[styles.modifyButton, isEditMode && styles.cancelHeaderButton]}>
            {isEditMode ? t('common.cancel') : t('common.edit')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ 
                uri: user?.photo 
                  ? `https://ent-back.maraboot.tech/api/images/${user.photo}` 
                  : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' 
              }}
              style={styles.profileImage}
            />
            {isEditMode && (
              <TouchableOpacity style={styles.editImageButton}>
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.nomComplet}</Text>
            <Text style={styles.userRole}>
              {profileType === 'parent' ? t('profile.parent') : t('profile.student')}
            </Text>
          </View>
        </View>
        
        {/* Tabs avec style amélioré */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'infos' && styles.activeTab]}
              onPress={() => setActiveTab('infos')}
            >
              <Ionicons 
                name="person-outline" 
                size={16} 
                color={activeTab === 'infos' ? '#007AFF' : '#666'} 
              />
              <Text style={[
                styles.tabText, 
                activeTab === 'infos' && styles.activeTabText
              ]}>
                {t('profile.personalInfo')}
              </Text>
            </TouchableOpacity>
            
            {profileType === 'parent' && (
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'enfants' && styles.activeTab]}
                onPress={() => setActiveTab('enfants')}
              >
                <Ionicons 
                  name="people-outline" 
                  size={16} 
                  color={activeTab === 'enfants' ? '#007AFF' : '#666'} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'enfants' && styles.activeTabText
                ]}>
                  {t('profile.children')}
                </Text>
              </TouchableOpacity>
            )}
            
            {profileType === 'eleve' && (
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'scolaire' && styles.activeTab]}
                onPress={() => setActiveTab('scolaire')}
              >
                <Ionicons 
                  name="school-outline" 
                  size={16} 
                  color={activeTab === 'scolaire' ? '#007AFF' : '#666'} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'scolaire' && styles.activeTabText
                ]}>
                  {t('profile.school')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Tab Content */}
        {activeTab === 'infos' && renderInfoContent()}
        {activeTab === 'enfants' && profileType === 'parent' && renderChildrenContent()}
        {activeTab === 'scolaire' && profileType === 'eleve' && renderStudentSpecificInfo()}
      </ScrollView>
      
      {/* Logout Button - Caché en mode édition */}
      {!isEditMode && !showPasswordForm && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Logout Confirmation Modal */}
      <Modal
        transparent={true}
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="log-out-outline" size={40} color="#FF5252" />
              <Text style={styles.modalTitle}>{t('profile.logout')}</Text>
            </View>
            <Text style={styles.modalMessage}>
              {t('profile.logoutConfirmation')}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={cancelLogout}
              >
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton} 
                onPress={confirmLogout}
              >
                <Text style={styles.modalConfirmText}>{t('profile.logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginTop: 25
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modifyButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  cancelHeaderButton: {
    color: '#FF5252',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999',
    fontStyle: 'italic',
  },
  linkText: {
    color: '#007AFF',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 5,
    paddingHorizontal: 0,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  childImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  childRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  childClass: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  childMenuButton: {
    padding: 8,
  },
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  addChildText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 45
  },
  logoutButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Password Form Styles
  passwordFormSection: {
    marginVertical: 20,
  },
  passwordFormContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  passwordInputContainer: {
    marginBottom: 20,
  },
  passwordInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  passwordToggle: {
    padding: 8,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 5,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  passwordRequirements: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  passwordFormActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelPasswordButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelPasswordButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitPasswordButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  submitPasswordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#FF5252',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 10,
  },
  modalConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});