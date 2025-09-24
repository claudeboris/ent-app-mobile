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
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function ProfileScreen() {
  const { 
    user, 
    profileType, 
    logout, 
    updateUser,
    showSuccessToast,
    showErrorToast,
    showConfirmToast
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('infos');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
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
          adresse: user.adresse || 'Ajouter un lieu',
        });
      } catch (error) {
        console.error('Erreur lors du chargement du profil', error);
        showErrorToast('Erreur', 'Impossible de charger les données du profil');
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
      showSuccessToast('Succès', 'Vos informations ont été mises à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour', error);
      showErrorToast('Erreur', 'Impossible de mettre à jour vos informations');
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
      adresse: user.adresse || 'Ajouter un lieu',
    });
    setIsEditMode(false);
  };

  const handleLogout = () => {
    showConfirmToast(
      'Déconnexion', 
      'Êtes-vous sûr de vouloir vous déconnecter ?', 
      logout,
      () => Toast.hide()
    );
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
      errors.currentPassword = "Veuillez entrer votre mot de passe actuel";
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = "Veuillez entrer un nouveau mot de passe";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Veuillez confirmer votre nouveau mot de passe";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
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
      
      showSuccessToast('Succès', 'Votre mot de passe a été mis à jour avec succès');
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe', error);
      const errorMessage = error.response?.data?.message || 'Impossible de changer votre mot de passe';
      showErrorToast('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordForm = () => (
    <View style={styles.passwordFormContainer}>
      <Text style={styles.passwordFormTitle}>Changer votre mot de passe</Text>
      
      {/* Current Password */}
      <View style={styles.passwordInputContainer}>
        <Text style={styles.passwordInputLabel}>Mot de passe actuel</Text>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.passwordInput}
            value={passwordData.currentPassword}
            onChangeText={(value) => handlePasswordChange('currentPassword', value)}
            placeholder="Entrez votre mot de passe actuel"
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
        <Text style={styles.passwordInputLabel}>Nouveau mot de passe</Text>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.passwordInput}
            value={passwordData.newPassword}
            onChangeText={(value) => handlePasswordChange('newPassword', value)}
            placeholder="Entrez votre nouveau mot de passe"
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
        <Text style={styles.passwordHint}>Le mot de passe doit contenir au moins 8 caractères</Text>
      </View>
      
      {/* Confirm Password */}
      <View style={styles.passwordInputContainer}>
        <Text style={styles.passwordInputLabel}>Confirmer le nouveau mot de passe</Text>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.passwordInput}
            value={passwordData.confirmPassword}
            onChangeText={(value) => handlePasswordChange('confirmPassword', value)}
            placeholder="Confirmez votre nouveau mot de passe"
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
        <Text style={styles.requirementsTitle}>Exigences de sécurité:</Text>
        <Text style={styles.requirementItem}>• Au moins 8 caractères</Text>
        <Text style={styles.requirementItem}>• Mélange de lettres et de chiffres recommandé</Text>
        <Text style={styles.requirementItem}>• Éviter les mots de passe évidents</Text>
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
          <Text style={styles.cancelPasswordButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.submitPasswordButton} 
          onPress={handlePasswordSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitPasswordButtonText}>Mettre à jour</Text>
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
          <Text style={styles.infoLabel}>Nom</Text>
          {isEditMode ? (
            <TextInput
              style={styles.textInput}
              value={editedInfo.nom}
              onChangeText={(text) => setEditedInfo({...editedInfo, nom: text})}
              placeholder="Votre nom"
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
          <Text style={styles.infoLabel}>Prénom</Text>
          {isEditMode ? (
            <TextInput
              style={styles.textInput}
              value={editedInfo.prenom}
              onChangeText={(text) => setEditedInfo({...editedInfo, prenom: text})}
              placeholder="Votre prénom"
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
          <Text style={styles.infoLabel}>Email</Text>
          {isEditMode ? (
            <TextInput
              style={styles.textInput}
              value={editedInfo.email}
              onChangeText={(text) => setEditedInfo({...editedInfo, email: text})}
              placeholder="Votre email"
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
          <Text style={styles.infoLabel}>Numéro de téléphone</Text>
          {isEditMode ? (
            <TextInput
              style={styles.textInput}
              value={editedInfo.telephone}
              onChangeText={(text) => setEditedInfo({...editedInfo, telephone: text})}
              placeholder="Votre numéro de téléphone"
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
          <Text style={styles.infoLabel}>Adresse</Text>
          {isEditMode ? (
            <TextInput
              style={styles.textInput}
              value={editedInfo.adresse}
              onChangeText={(text) => setEditedInfo({...editedInfo, adresse: text})}
              placeholder="Votre adresse"
              multiline
            />
          ) : (
            <Text style={[styles.infoValue, !user?.adresse && styles.placeholderText]}>
              {user?.adresse || 'Ajouter un lieu'}
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
            <Text style={styles.infoLabel}>Mot de passe</Text>
            <Text style={[styles.infoValue, styles.linkText]}>Modifier le mot de passe</Text>
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
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Sauvegarder</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderChildrenContent = () => {
    if (!profileData || !profileData.enfants || profileData.enfants.length === 0) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noDataText}>Aucun enfant associé à ce compte</Text>
          <TouchableOpacity style={styles.addChildButton}>
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.addChildText}>Ajouter un enfant</Text>
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
              <Text style={styles.childName}>{child.utilisateur?.nomComplet || 'Nom non disponible'}</Text>
              <Text style={styles.childRole}>Élève</Text>
              <Text style={styles.childClass}>
                Classe: {child.utilisateur?.informationsSpecifiques?.classeActuelle?.nom || 'À déterminer'}
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
          <Text style={styles.addChildText}>Ajouter un enfant</Text>
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
          <Text style={styles.sectionTitle}>Informations médicales</Text>
          
          {eleve.informationsMedicales?.allergies && eleve.informationsMedicales.allergies.length > 0 && (
            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="medical-outline" size={20} color="#666" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Allergies</Text>
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
                <Text style={styles.infoLabel}>Maladies chroniques</Text>
                <Text style={styles.infoValue}>
                  {eleve.informationsMedicales.maladiesChroniques.join(', ')}
                </Text>
              </View>
            </View>
          )}
        </View>
        
        {/* School Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations scolaires</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="school-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Classe actuelle</Text>
              <Text style={styles.infoValue}>
                {utilisateur?.informationsSpecifiques?.classeActuelle?.nom || 'Non définie'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="card-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Numéro matricule</Text>
              <Text style={styles.infoValue}>
                {utilisateur?.informationsSpecifiques?.numeroMatricule || 'Non défini'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="repeat-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Redoublant</Text>
              <Text style={styles.infoValue}>
                {utilisateur?.informationsSpecifiques?.redoublant ? 'Oui' : 'Non'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="bus-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Transport scolaire</Text>
              <Text style={styles.infoValue}>
                {eleve.utiliseTransport ? 'Oui' : 'Non'}
              </Text>
            </View>
          </View>
          
          {eleve.utiliseTransport && (
            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={20} color="#666" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Arrêt</Text>
                <Text style={styles.infoValue}>{eleve.arret || 'Non défini'}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="restaurant-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Cantine</Text>
              <Text style={styles.infoValue}>
                {eleve.utiliseCantine ? 'Oui' : 'Non'}
              </Text>
            </View>
          </View>
          
          {eleve.utiliseCantine && eleve.regimeAlimentaire && eleve.regimeAlimentaire.length > 0 && (
            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="nutrition-outline" size={20} color="#666" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Régime alimentaire</Text>
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
                <Text style={styles.infoLabel}>Bourse</Text>
                <Text style={styles.infoValue}>
                  {eleve.pourcentageBourse}% de bourse
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
          <Text style={styles.loadingText}>Chargement du profil...</Text>
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
        <Text style={styles.headerTitle}>Mon profil</Text>
        <TouchableOpacity onPress={isEditMode ? handleCancel : handleEdit}>
          <Text style={[styles.modifyButton, isEditMode && styles.cancelHeaderButton]}>
            {isEditMode ? 'Annuler' : 'Modifier'}
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
              {profileType === 'parent' ? 'Parent' : 'Élève'}
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
                Infos personnelles
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
                  Enfants
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
                  Scolaire
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
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      )}
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
});