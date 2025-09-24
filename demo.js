import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function PresenceScreen() {
  const { user, profileType } = useAuth();
  const [presenceData, setPresenceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2023-2024');
  const [selectedPeriod, setSelectedPeriod] = useState('1er trimestre');

  // Charger les données de présence
  const loadPresenceData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await api.get(`/absences/stats/eleve/${user.id}`);
      setPresenceData(response.data);
      
      // Mettre à jour les sélections avec les données reçues
      if (response.data.anneeScolaire) {
        setSelectedYear(response.data.anneeScolaire);
      }
      if (response.data.periode) {
        setSelectedPeriod(response.data.periode);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de présence:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de présence');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPresenceData();
  }, [user]);

  // Rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    await loadPresenceData();
    setRefreshing(false);
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Formater l'heure
  const formatTime = (timeString) => {
    return timeString;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Présence</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="bookmark-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Sélecteurs d'année et de période */}
        <View style={styles.selectorsContainer}>
          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>Année scolaire</Text>
            <TouchableOpacity style={styles.selectorButton}>
              <Text style={styles.selectorValue}>{selectedYear}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>Période</Text>
            <TouchableOpacity style={styles.selectorButton}>
              <Text style={styles.selectorValue}>{selectedPeriod}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Stats Cards */}
        {presenceData && presenceData.data && (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.presenceCard}>
                <Text style={styles.cardLabel}>Présences</Text>
                <Text style={styles.cardNumber}>{presenceData.data.stats.presence}</Text>
              </View>
              
              <View style={styles.absenceCard}>
                <Text style={styles.cardLabel}>Absences</Text>
                <Text style={styles.cardNumber}>{presenceData.data.stats.absence}</Text>
              </View>
              
              {/* <View style={styles.retardCard}>
                <Text style={styles.cardLabel}>Retards</Text>
                <Text style={styles.cardNumber}>{presenceData.data.stats.retard}</Text>
              </View> */}
            </View>
            
            {/* Taux de présence */}
            <View style={styles.tauxPresenceContainer}>
              <Text style={styles.tauxPresenceLabel}>Taux de présence</Text>
              <Text style={styles.tauxPresenceValue}>{presenceData.data.stats.tauxPresence}%</Text>
              
              {/* Barre de progression */}
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${presenceData.data.stats.tauxPresence}%` }
                  ]} 
                />
              </View>
              
              {/* <View style={styles.statsDetails}>
                <View style={styles.statDetail}>
                  <Text style={styles.statDetailNumber}>{presenceData.data.stats.totalCours}</Text>
                  <Text style={styles.statDetailLabel}>Cours totaux</Text>
                </View>
                 <View style={styles.statDetail}>
                  <Text style={styles.statDetailNumber}>{presenceData.data.stats.departAnticipe}</Text>
                  <Text style={styles.statDetailLabel}>Départs anticipés</Text>
                </View> 
              </View> */}
            </View>
            
            {/* Absences List */}
            <View style={styles.absencesSection}>
              <Text style={styles.sectionTitle}>Liste des absences</Text>
              
              {presenceData.data.stats.absences.length > 0 ? (
                presenceData.data.stats.absences.map((absence) => (
                  <View key={absence.id} style={styles.absenceItem}>
                    <View style={styles.absenceMain}>
                      <View style={styles.absenceHeader}>
                        <Text style={styles.absenceDate}>
                          {formatDate(absence.date)} {' '}
                          <Text style={styles.absenceTime}>
                            ({formatTime(absence.heureDebut)}-{formatTime(absence.heureFin)})
                          </Text>
                        </Text>
                        <TouchableOpacity style={styles.moreButton}>
                          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                      
                      <Text style={styles.absenceCourse}>{absence.cours.titre}</Text>
                      <Text style={styles.absenceMatiere}>{absence.matiere.nom}</Text>
                      
                      <View style={styles.absenceFooter}>
                        <View style={[
                          styles.statusBadge, 
                          { 
                            backgroundColor: absence.estJustifiee ? '#4CAF50' : '#FF5252' 
                          }
                        ]}>
                          <Text style={styles.statusText}>
                            {absence.estJustifiee ? 'Justifiée' : 'Non justifiée'}
                          </Text>
                        </View>
                        
                        {absence.motif && (
                          <Text style={styles.absenceMotif}>
                            Motif: {absence.motif}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="checkmark-circle-outline" size={48} color="#4CAF50" />
                  <Text style={styles.noDataText}>Aucune absence enregistrée</Text>
                </View>
              )}
            </View>
          </>
        )}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  selectorsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  selector: {
    flex: 1,
    marginRight: 10,
  },
  selectorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectorValue: {
    fontSize: 14,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  presenceCard: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 12,
    marginRight: 10,
  },
  absenceCard: {
    flex: 1,
    backgroundColor: '#F44336',
    padding: 20,
    borderRadius: 12,
    marginRight: 10,
  },
  retardCard: {
    flex: 1,
    backgroundColor: '#FF9800',
    padding: 20,
    borderRadius: 12,
    marginLeft: 10,
  },
  cardLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardNumber: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  tauxPresenceContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tauxPresenceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  tauxPresenceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  statsDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statDetail: {
    alignItems: 'center',
  },
  statDetailNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  absencesSection: {
    flex: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  absenceItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  absenceMain: {
    flex: 1,
  },
  absenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  absenceDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  absenceTime: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
  moreButton: {
    padding: 5,
  },
  absenceCourse: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  absenceMatiere: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  absenceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  absenceMotif: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});


Fait de même pour ça 

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const PaiementsScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'tranches', 'montant', 'moyens', 'numero'
  const [selectedTranche, setSelectedTranche] = useState(null);
  const [selectedMoyen, setSelectedMoyen] = useState(null);
  const [numeroTelephone, setNumeroTelephone] = useState('');
  const [montantPaye, setMontantPaye] = useState(350000);
  const [montantRestant, setMontantRestant] = useState(150000);
  const [activeTab, setActiveTab] = useState('Montants payés');
  
  // Données des tranches de scolarité
  const tranchesScolarite = [
    { id: 1, libelle: "Aujourd'hui", montant: 125000 },
    { id: 2, libelle: "Dans 30 jours", montant: 125000 },
    { id: 3, libelle: "Dans 60 jours", montant: 125000 },
    { id: 4, libelle: "Dans 90 jours", montant: 125000 },
  ];

  // Moyens de paiement
  const moyensPaiement = [
    { id: 'wave', nom: 'Wave', icon: '📱', couleur: '#00D4FF' },
    { id: 'orange', nom: 'Orange Money', icon: '📱', couleur: '#FF7900' },
    { id: 'mtn', nom: 'MTN Money', icon: '📱', couleur: '#FFCC00' },
    { id: 'moov', nom: 'Moov Money', icon: '📱', couleur: '#0099CC' },
  ];

  // Historique des paiements
  const historiquePaiements = [
    {
      id: 1,
      date: '04 Novembre 2024',
      heure: '11h22',
      montant: 51500,
      devise: 'F CFA',
      statut: 'Effectué'
    },
    {
      id: 2,
      date: '25 Septembre 2024',
      heure: '14h30',
      montant: 50000,
      devise: 'F CFA',
      statut: 'Effectué'
    },
    {
      id: 3,
      date: '19 Juillet 2023',
      heure: '10h00',
      montant: 100000,
      devise: 'F CFA',
      statut: 'Effectué'
    },
    {
      id: 4,
      date: '15 Mai 2023',
      heure: '15h45',
      montant: 75000,
      devise: 'F CFA',
      statut: 'Effectué'
    },
  ];

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType('');
  };

  const handleSelectTranche = (tranche) => {
    setSelectedTranche(tranche);
    closeModal();
    setTimeout(() => openModal('montant'), 300);
  };

  const handleSelectMoyen = (moyen) => {
    setSelectedMoyen(moyen);
    closeModal();
    setTimeout(() => openModal('numero'), 300);
  };

  const handleContinuerMontant = () => {
    closeModal();
    setTimeout(() => openModal('moyens'), 300);
  };

  const handleConfirmerPaiement = () => {
    if (!numeroTelephone.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro de téléphone');
      return;
    }
    
    // Simuler le paiement
    Alert.alert(
      'Paiement initié',
      `Un code de confirmation va être envoyé au ${numeroTelephone}`,
      [
        {
          text: 'OK',
          onPress: () => {
            closeModal();
            // Mettre à jour les montants après paiement
            setMontantPaye(prev => prev + 50000);
            setMontantRestant(prev => prev - 50000);
            setNumeroTelephone('');
          }
        }
      ]
    );
  };

  const navigateToTransactionDetails = (transaction) => {
    // Ici on naviguerait vers l'écran des détails
    //Alert.alert('Navigation', `Détails de la transaction ${transaction.id}`);
    router.push('transaction_detail')
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'tranches':
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>Payez en 4 tranches la scolarité</Text>
            <Text style={styles.modalSubtitle}>
              Vous n'êtes pas obligés de payer selon ces échéances
            </Text>
            
            <View style={styles.tranchesContainer}>
              {tranchesScolarite.map((tranche) => (
                <TouchableOpacity
                  key={tranche.id}
                  style={styles.trancheItem}
                  onPress={() => handleSelectTranche(tranche)}
                >
                  <View style={styles.trancheInfo}>
                    <View style={styles.trancheIcon}>
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                    </View>
                    <Text style={styles.trancheLibelle}>{tranche.libelle}</Text>
                  </View>
                  <Text style={styles.trancheMontant}>{tranche.montant.toLocaleString()} F</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalMontant}>500000 F</Text>
            </View>
            
            <TouchableOpacity style={styles.continuerButton}>
              <Text style={styles.continuerButtonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        );

      case 'montant':
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>Quel montant voulez-vous payer?</Text>
            
            <View style={styles.montantContainer}>
              <Text style={styles.montantPrincipal}>50500F</Text>
              <Text style={styles.montantEcole}>L'école recevra 50000F</Text>
            </View>
            
            <View style={styles.paiementDetails}>
              <View style={styles.paiementRow}>
                <Text style={styles.paiementLabel}>Paiement</Text>
                <TouchableOpacity>
                  <Text style={styles.modifierText}>Modifier</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.moyenPaiementInfo}>
                <View style={styles.moyenIcon}>
                  <Text style={styles.iconText}>📱</Text>
                </View>
                <View>
                  <Text style={styles.moyenNom}>Mobile Money (Wave)</Text>
                  <Text style={styles.moyenNumero}>+225 5 55 55 55 55</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.payerButton} onPress={handleContinuerMontant}>
              <Text style={styles.payerButtonText}>Payer 50500 F</Text>
            </TouchableOpacity>
          </View>
        );

      case 'moyens':
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Ajouter un moyen de paiement</Text>
            </View>
            
            <View style={styles.moyensContainer}>
              {moyensPaiement.map((moyen) => (
                <TouchableOpacity
                  key={moyen.id}
                  style={styles.moyenItem}
                  onPress={() => handleSelectMoyen(moyen)}
                >
                  <View style={styles.moyenInfo}>
                    <View style={[styles.moyenIconContainer, { backgroundColor: moyen.couleur }]}>
                      <Text style={styles.moyenIconText}>{moyen.icon}</Text>
                    </View>
                    <Text style={styles.moyenItemNom}>{moyen.nom}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'numero':
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Saisir le numéro</Text>
            </View>
            
            <View style={styles.numeroContainer}>
              <Text style={styles.numeroLabel}>Numéro de téléphone</Text>
              <TextInput
                style={styles.numeroInput}
                value={numeroTelephone}
                onChangeText={setNumeroTelephone}
                placeholder="+225 XX XX XX XX XX"
                keyboardType="phone-pad"
              />
              
              <Text style={styles.montantInfo}>Montant à payer: 50500 F CFA</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.confirmerButton, !numeroTelephone.trim() && styles.buttonDisabled]}
              onPress={handleConfirmerPaiement}
              disabled={!numeroTelephone.trim()}
            >
              <Text style={styles.confirmerButtonText}>Confirmer le paiement</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paiements</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Montants */}
        <View style={styles.montantsContainer}>
          <View style={styles.montantCard}>
            <View style={styles.montantHeader}>
              <Ionicons name="trending-up" size={20} color="#FF6B6B" />
              <Text style={styles.montantLabel}>MONTANT PAYÉ</Text>
            </View>
            <Text style={styles.montantValue}>{montantPaye.toLocaleString()}</Text>
          </View>
          
          <View style={styles.montantCard}>
            <View style={styles.montantHeader}>
              <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
              <Text style={styles.montantLabel}>MONTANT RESTANT</Text>
            </View>
            <Text style={[styles.montantValue, styles.montantRestantValue]}>
              {montantRestant.toLocaleString()}K
            </Text>
          </View>
        </View>

        {/* Onglets */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Montants payés' && styles.activeTab]}
            onPress={() => setActiveTab('Montants payés')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'Montants payés' && styles.activeTabText
            ]}>
              Montants payés
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Échéances restantes' && styles.activeTab]}
            onPress={() => setActiveTab('Échéances restantes')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'Échéances restantes' && styles.activeTabText
            ]}>
              Échéances restantes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenu des onglets */}
        {activeTab === 'Montants payés' && historiquePaiements.length > 0 ? (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Aujourd'hui</Text>
            {historiquePaiements.map((paiement) => (
              <TouchableOpacity
                key={paiement.id}
                style={styles.historyItem}
                onPress={() => navigateToTransactionDetails(paiement)}
              >
                <View style={styles.historyIcon}>
                  <Ionicons name="arrow-up" size={20} color="#666" />
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyType}>Paiement</Text>
                  <Text style={styles.historyDateTime}>
                    Envoyé à {paiement.heure}
                  </Text>
                  <Text style={styles.historyDate}>{paiement.date}</Text>
                </View>
                <Text style={styles.historyAmount}>
                  -{paiement.montant.toLocaleString()} {paiement.devise}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : activeTab === 'Montants payés' ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="wallet-outline" size={60} color="#ccc" />
            </View>
            <Text style={styles.emptyText}>Aucune transaction pour le moment.</Text>
            <Text style={styles.emptySubtext}>Faites un paiement.</Text>
          </View>
        ) : (
          <View style={styles.echeancesContainer}>
            <Text style={styles.echeancesText}>Aucune échéance restante</Text>
          </View>
        )}

        {/* Bouton Nouveau paiement */}
        <TouchableOpacity
          style={styles.nouveauPaiementButton}
          onPress={() => openModal('tranches')}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.nouveauPaiementText}>Nouveau paiement</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {renderModalContent()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 25
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  montantsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 30,
  },
  montantCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
  },
  montantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  montantLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  montantValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  montantRestantValue: {
    color: '#4ECDC4',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  historyContainer: {
    paddingHorizontal: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  historyDetails: {
    flex: 1,
  },
  historyType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  historyDateTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  echeancesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  echeancesText: {
    fontSize: 16,
    color: '#666',
  },
  nouveauPaiementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 15,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  nouveauPaiementText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: 20,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  activeNavItem: {},
  navText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  tranchesContainer: {
    marginBottom: 20,
  },
  trancheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  trancheInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trancheIcon: {
    marginRight: 15,
  },
  trancheLibelle: {
    fontSize: 16,
    color: '#333',
  },
  trancheMontant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderTopWidth: 2,
    borderTopColor: '#333',
    marginBottom: 30,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalMontant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  continuerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  continuerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  montantContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  montantPrincipal: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  montantEcole: {
    fontSize: 14,
    color: '#666',
  },
  paiementDetails: {
    marginBottom: 40,
  },
  paiementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  paiementLabel: {
    fontSize: 16,
    color: '#333',
  },
  modifierText: {
    color: '#007AFF',
    fontSize: 16,
  },
  moyenPaiementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moyenIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 20,
  },
  moyenNom: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  moyenNumero: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  payerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  payerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  moyensContainer: {
    marginTop: 20,
  },
  moyenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  moyenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moyenIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  moyenIconText: {
    fontSize: 20,
  },
  moyenItemNom: {
    fontSize: 16,
    color: '#333',
  },
  numeroContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  numeroLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  numeroInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  montantInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  confirmerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaiementsScreen;

