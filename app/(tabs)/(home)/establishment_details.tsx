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
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';

export default function OlsonHartmannScreen() {
  const { user, showErrorToast, showSuccessToast } = useAuth();
  const [activeTab, setActiveTab] = useState('apropos');
  const [etablissementData, setEtablissementData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données de l'établissement
  const loadEtablissementData = async () => {
    if (!user || !user.etablissementActif) return;
    
    try {
      setIsLoading(true);
      const response = await api.get(`/etablissement/${user.etablissementActif}`);
      setEtablissementData(response.data.data.etablissement);
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'établissement:', error);
      showErrorToast('Erreur', 'Impossible de charger les informations de l\'établissement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEtablissementData();
  }, [user]);

  // Rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    await loadEtablissementData();
    setRefreshing(false);
  };

  // Formater l'adresse complète
  const formatAddress = () => {
    if (!etablissementData) return '';
    const { adresse } = etablissementData;
    return `${adresse.rue}, ${adresse.ville} ${adresse.codePostal}, ${adresse.pays}`;
  };

  // Ouvrir un document
  const openDocument = (document) => {
    if (document.route) {
      router.push(document.route);
    } else if (document.url) {
      Linking.openURL(document.url).catch(err => {
        showErrorToast('Erreur', 'Impossible d\'ouvrir le document');
        console.error('Erreur lors de l\'ouverture du document:', err);
      });
    } else {
      Alert.alert('Document', `Document: ${document.title}`);
    }
  };

  // Rendre la section des documents
  const renderDocuments = () => {
    // Vérifier si des documents sont disponibles
    const hasDocuments = etablissementData?.documents && etablissementData.documents.length > 0;

    if (!hasDocuments) {
      return (
        <View style={styles.noDocumentsContainer}>
          <Ionicons name="document-outline" size={60} color="#ccc" />
          <Text style={styles.noDocumentsTitle}>Aucun document disponible</Text>
          <Text style={styles.noDocumentsSubtitle}>
            Les documents de l'établissement seront bientôt disponibles.
          </Text>
        </View>
      );
    }

    // Mapper les documents de l'API
    const documents = etablissementData.documents.map((doc, index) => ({
      id: doc._id || index,
      title: doc.nom,
      icon: 'document-outline',
      type: doc.type,
      url: doc.url || null,
      route: doc.route || null,
    }));

    return (
      <View style={styles.documentsContainer}>
        <View style={styles.documentGrid}>
          {documents.map((document) => (
            <TouchableOpacity 
              key={document.id} 
              style={styles.documentItem} 
              onPress={() => openDocument(document)}
              activeOpacity={0.7}
            >
              <View style={styles.documentIcon}>
                <Ionicons name={document.icon} size={40} color="#007AFF" />
              </View>
              <Text style={styles.documentTitle}>{document.title}</Text>
              {document.type && (
                <Text style={styles.documentType}>{document.type}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Rendre la section "À propos"
  const renderAboutContent = () => {
    if (!etablissementData) return null;

    const { adresse, contacts, configuration, effectifMax, effectifActuel, nom, sigle, type, categorie, description } = etablissementData;

    return (
      <View style={styles.aboutContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{contacts.email}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{contacts.telephone}</Text>
        </View>
        
        {contacts.telephone2 && (
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{contacts.telephone2}</Text>
          </View>
        )}
        
        {contacts.siteWeb && (
          <View style={styles.infoItem}>
            <Ionicons name="link-outline" size={20} color="#666" />
            <Text 
              style={[styles.infoText, styles.linkText]}
              onPress={() => {
                Linking.openURL(contacts.siteWeb).catch(err => {
                  showErrorToast('Erreur', 'Impossible d\'ouvrir le site web');
                  console.error('Erreur lors de l\'ouverture du site web:', err);
                });
              }}
            >
              {contacts.siteWeb}
            </Text>
          </View>
        )}
        
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{formatAddress()}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="school-outline" size={20} color="#666" />
          <Text style={styles.infoText}>École {categorie} - {type}</Text>
        </View>
        
        {description && (
          <View style={styles.infoItem}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{description}</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des informations...</Text>
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
        <Text style={styles.headerTitle}>
          {etablissementData ? `${etablissementData.nom} ${etablissementData.sigle ? `(${etablissementData.sigle})` : ''}` : 'Établissement'}
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* School Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: etablissementData?.logo || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=200&fit=crop' 
            }}
            style={styles.schoolImage}
          />
          <View style={styles.logoOverlay}>
            <View style={styles.logoContainer}>
              <Ionicons name="globe-outline" size={20} color="#333" />
              <Text style={styles.logoText}>
                {etablissementData?.sigle || etablissementData?.nom || 'logo ipsum'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* School Info */}
        <View style={styles.schoolInfo}>
          <Text style={styles.schoolName}>
            {etablissementData?.nom || 'Nom de l\'établissement'}
          </Text>
          <Text style={styles.schoolAddress}>
            {etablissementData ? formatAddress() : 'Adresse de l\'établissement'}
          </Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => {
              if (etablissementData?.contacts?.telephone) {
                Linking.openURL(`tel:${etablissementData.contacts.telephone}`).catch(err => {
                  showErrorToast('Erreur', 'Impossible d\'effectuer l\'appel');
                  console.error('Erreur lors de l\'appel téléphonique:', err);
                });
              } else {
                showErrorToast('Information', 'Aucun numéro de téléphone disponible');
              }
            }}
          >
            <Ionicons name="call" size={18} color="white" />
            <Text style={styles.buttonText}>Appeler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={() => {
              if (etablissementData?.contacts?.email) {
                Linking.openURL(`mailto:${etablissementData.contacts.email}`).catch(err => {
                  showErrorToast('Erreur', 'Impossible d\'envoyer un email');
                  console.error('Erreur lors de l\'envoi d\'email:', err);
                });
              } else {
                showErrorToast('Information', 'Aucune adresse email disponible');
              }
            }}
          >
            <Ionicons name="mail-outline" size={18} color="#007AFF" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
          
        </View>
        
        {/* Tabs avec style amélioré */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'apropos' && styles.activeTab]}
              onPress={() => setActiveTab('apropos')}
            >
              <Ionicons 
                name="information-circle-outline" 
                size={16} 
                color={activeTab === 'apropos' ? '#007AFF' : '#666'} 
              />
              <Text style={[
                styles.tabText, 
                activeTab === 'apropos' && styles.activeTabText
              ]}>
                À propos
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'documents' && styles.activeTab]}
              onPress={() => setActiveTab('documents')}
            >
              <Ionicons 
                name="document-text-outline" 
                size={16} 
                color={activeTab === 'documents' ? '#007AFF' : '#666'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'documents' && styles.activeTabText
              ]}>
                Documents
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'apropos' ? renderAboutContent() : renderDocuments()}
        </View>
      </ScrollView>
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
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  schoolImage: {
    width: '100%',
    height: '100%',
  },
  logoOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  logoText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  schoolInfo: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  schoolName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  schoolAddress: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  messageButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
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
  aboutContainer: {
    paddingVertical: 0,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  linkText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  documentsContainer: {
    padding: 20,
  },
  documentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  documentItem: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  documentIcon: {
    marginBottom: 10,
  },
  documentTitle: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  documentType: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  noDocumentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDocumentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  noDocumentsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
  },
});