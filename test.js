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
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const TransactionDetailsScreen = ({ route, navigation }) => {
  // Dans un vrai app, ces données viendraient des paramètres de navigation
  const transactionData = {
    montant: -51500,
    devise: 'F',
    methodePaiement: "Transfert d'argent",
    idTransaction: 'APX1242352',
    dateHeure: '28 sept. 2023 à 18:23',
    frais: 1500,
    montantEnvoye: 50000,
    totalPaye: 51500,
    statut: 'Effectué'
  };

  const handleGoBack = () => {
    // En mode réel, utiliser navigation.goBack()
    router.push('payment')
  };

  const handleSignalerProbleme = () => {
    Alert.alert(
      'Signaler un problème',
      'Voulez-vous signaler un problème avec cette transaction ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Signaler', onPress: () => Alert.alert('Problème signalé', 'Votre signalement a été envoyé.') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Montant principal */}
        <View style={styles.montantContainer}>
          <Text style={styles.montantPrincipal}>
            {transactionData.montant.toLocaleString()} {transactionData.devise}
          </Text>
        </View>

        {/* Détails de la transaction */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>DÉTAILS</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>MÉTHODE DE PAIEMENT</Text>
            <Text style={styles.detailValue}>{transactionData.methodePaiement}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>ID DE TRANSACTION</Text>
            <Text style={styles.detailValue}>{transactionData.idTransaction}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>DATE ET HEURE</Text>
            <Text style={styles.detailValue}>{transactionData.dateHeure}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>FRAIS</Text>
            <Text style={styles.detailValue}>{transactionData.frais.toLocaleString()} F</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>MONTANT ENVOYÉ</Text>
            <Text style={styles.detailValue}>{transactionData.montantEnvoye.toLocaleString()} F</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>TOTAL PAYÉ</Text>
            <Text style={styles.detailValue}>{transactionData.totalPaye.toLocaleString()} F</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>STATUT</Text>
            <Text style={[styles.detailValue, styles.statutEffectue]}>{transactionData.statut}</Text>
          </View>
        </View>

        {/* Bouton Signaler un problème */}
        <TouchableOpacity 
          style={styles.signalerButton}
          onPress={handleSignalerProbleme}
        >
          <Ionicons name="flag-outline" size={20} color="#FF6B6B" />
          <Text style={styles.signalerButtonText}>Signaler un problème</Text>
          <Ionicons name="chevron-forward" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44, // Pour équilibrer avec le bouton back
  },
  content: {
    flex: 1,
  },
  montantContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  montantPrincipal: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 30,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 20,
  },
  detailItem: {
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  statutEffectue: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  signalerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  signalerButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '500',
    marginLeft: 10,
  },
});

export default TransactionDetailsScreen;

GET annee-scolaire/etablissement/:etablissementId renvoie {
    "status": "succès",
    "résultats": 4,
    "data": {
        "anneesScolaires": [
            {
                "configuration": {
                    "systemeEvaluation": "trimestre",
                    "periodes": [
                        {
                            "nom": "Trimestre 1",
                            "dateDebut": "2023-09-01T00:00:00.000Z",
                            "dateFin": "2023-11-30T00:00:00.000Z",
                            "estActif": true,
                            "_id": "68a8960a0029e792ff237a51"
                        },
                        {
                            "nom": "Trimestre 2",
                            "dateDebut": "2023-12-01T00:00:00.000Z",
                            "dateFin": "2024-03-31T00:00:00.000Z",
                            "estActif": false,
                            "_id": "68a8960a0029e792ff237a52"
                        },
                        {
                            "nom": "Trimestre 3",
                            "dateDebut": "2024-04-01T00:00:00.000Z",
                            "dateFin": "2024-06-30T00:00:00.000Z",
                            "estActif": false,
                            "_id": "68a8960a0029e792ff237a53"
                        }
                    ],
                    "vacances": [
                        {
                            "nom": "Vacances de Noël",
                            "dateDebut": "2023-12-20T00:00:00.000Z",
                            "dateFin": "2024-01-05T00:00:00.000Z",
                            "_id": "68a8960a0029e792ff237a54"
                        },
                        {
                            "nom": "Vacances de Pâques",
                            "dateDebut": "2024-04-10T00:00:00.000Z",
                            "dateFin": "2024-04-22T00:00:00.000Z",
                            "_id": "68a8960a0029e792ff237a55"
                        }
                    ],
                    "tranches": [
                        {
                            "options": {
                                "paiementEnLigne": true,
                                "paiementPhysique": true,
                                "paiementPartiel": false,
                                "penaliteRetard": 5
                            },
                            "nom": "1er versement",
                            "description": "Premier versement des frais scolaires",
                            "montant": 150000,
                            "devise": "CFA",
                            "dateDebut": "2023-09-01T00:00:00.000Z",
                            "dateFin": "2023-12-19T00:00:00.000Z",
                            "ordre": 1,
                            "estObligatoire": true,
                            "statut": "active",
                            "_id": "68a8960a0029e792ff237a56"
                        },
                        {
                            "options": {
                                "paiementEnLigne": true,
                                "paiementPhysique": true,
                                "paiementPartiel": false,
                                "penaliteRetard": 5
                            },
                            "nom": "2ème versement",
                            "description": "Second versement des frais scolaires",
                            "montant": 150000,
                            "devise": "CFA",
                            "dateDebut": "2024-01-08T00:00:00.000Z",
                            "dateFin": "2024-06-30T00:00:00.000Z",
                            "ordre": 2,
                            "estObligatoire": true,
                            "statut": "active",
                            "_id": "68a8960a0029e792ff237a57"
                        }
                    ]
                },
                "_id": "68a8960a0029e792ff237a50",
                "nom": "2023-2024",
                "etablissement": "68a82d912ca8540ad4a22c90",
                "dateDebut": "2023-09-01T00:00:00.000Z",
                "dateFin": "2024-06-30T00:00:00.000Z",
                "statut": "en_cours",
                "effectifPrevu": 500,
                "effectifReel": 0,
                "dateCreation": "2025-08-22T16:08:42.127Z",
                "createdAt": "2025-08-22T16:08:42.133Z",
                "updatedAt": "2025-08-22T16:08:42.133Z",
                "__v": 0
            },
            {
                "configuration": {
                    "systemeEvaluation": "trimestre",
                    "periodes": [
                        {
                            "nom": "1er trimestre",
                            "dateDebut": "2023-09-12T00:00:00.000Z",
                            "dateFin": "2024-02-24T00:00:00.000Z",
                            "estActif": false,
                            "_id": "68ad6c513b5134131a558a81"
                        },
                        {
                            "nom": "2ème trimestre",
                            "dateDebut": "2024-03-04T00:00:00.000Z",
                            "dateFin": "2024-06-24T00:00:00.000Z",
                            "estActif": false,
                            "_id": "68ad6c513b5134131a558a82"
                        }
                    ],
                    "vacances": [
                        {
                            "nom": "Congès de Noel",
                            "dateDebut": "2023-12-23T00:00:00.000Z",
                            "dateFin": "2024-01-08T00:00:00.000Z",
                            "_id": "68ad6c513b5134131a558a83"
                        }
                    ],
                    "tranches": []
                },
                "_id": "68ad6c513b5134131a558a80",
                "nom": "2022-2023",
                "etablissement": "68a82d912ca8540ad4a22c90",
                "dateDebut": "2022-09-12T00:00:00.000Z",
                "dateFin": "2023-06-24T00:00:00.000Z",
                "statut": "preparation",
                "effectifPrevu": 20000,
                "effectifReel": 0,
                "dateCreation": "2025-08-26T08:12:01.101Z",
                "createdAt": "2025-08-26T08:12:01.106Z",
                "updatedAt": "2025-08-26T15:53:49.558Z",
                "__v": 0
            },
            {
                "configuration": {
                    "systemeEvaluation": "trimestre",
                    "periodes": [
                        {
                            "nom": "",
                            "dateDebut": null,
                            "dateFin": null,
                            "estActif": false,
                            "_id": "68adda2122f69ad959f3c7a4"
                        }
                    ],
                    "vacances": [
                        {
                            "nom": "",
                            "dateDebut": null,
                            "dateFin": null,
                            "_id": "68adda2122f69ad959f3c7a5"
                        }
                    ],
                    "tranches": []
                },
                "_id": "68adda2122f69ad959f3c7a3",
                "nom": "2020-2021",
                "etablissement": "68a82d912ca8540ad4a22c90",
                "dateDebut": "2020-09-20T00:00:00.000Z",
                "dateFin": "2021-06-25T00:00:00.000Z",
                "statut": "preparation",
                "effectifPrevu": 15000,
                "effectifReel": 0,
                "dateCreation": "2025-08-26T16:00:33.332Z",
                "createdAt": "2025-08-26T16:00:33.334Z",
                "updatedAt": "2025-08-26T16:00:33.334Z",
                "__v": 0
            },
            {
                "configuration": {
                    "systemeEvaluation": "trimestre",
                    "periodes": [
                        {
                            "nom": "",
                            "dateDebut": null,
                            "dateFin": null,
                            "estActif": false,
                            "_id": "68b6f1321deec5f5f16a775d"
                        }
                    ],
                    "vacances": [
                        {
                            "nom": "",
                            "dateDebut": null,
                            "dateFin": null,
                            "_id": "68b6f1321deec5f5f16a775e"
                        }
                    ],
                    "tranches": [
                        {
                            "options": {
                                "paiementEnLigne": true,
                                "paiementPhysique": true,
                                "paiementPartiel": false,
                                "penaliteRetard": 0
                            },
                            "devise": "CFA",
                            "estObligatoire": true,
                            "statut": "active",
                            "nom": "1er versement",
                            "dateDebut": "2019-09-02T00:00:00.000Z",
                            "dateFin": "2019-12-14T00:00:00.000Z",
                            "_id": "68b6f1321deec5f5f16a775f"
                        },
                        {
                            "options": {
                                "paiementEnLigne": true,
                                "paiementPhysique": true,
                                "paiementPartiel": false,
                                "penaliteRetard": 0
                            },
                            "devise": "CFA",
                            "estObligatoire": true,
                            "statut": "active",
                            "nom": "2ème versement",
                            "dateDebut": "2020-01-06T00:00:00.000Z",
                            "dateFin": "2020-05-11T00:00:00.000Z",
                            "_id": "68b6f1321deec5f5f16a7760"
                        }
                    ]
                },
                "_id": "68b6f1321deec5f5f16a775c",
                "nom": "2019-2020",
                "etablissement": "68a82d912ca8540ad4a22c90",
                "dateDebut": "2019-09-02T00:00:00.000Z",
                "dateFin": "2020-07-25T00:00:00.000Z",
                "statut": "preparation",
                "effectifPrevu": 500,
                "effectifReel": 0,
                "dateCreation": "2025-09-02T13:29:22.506Z",
                "createdAt": "2025-09-02T13:29:22.519Z",
                "updatedAt": "2025-09-02T13:29:22.519Z",
                "__v": 0
            }
        ],
        "etablissement": {
            "adresse": {
                "rue": "45 Avenue des Sciences",
                "ville": "Abidjan",
                "codePostal": "00225",
                "pays": "Côte d'Ivoire",
                "latitude": 5.3364,
                "longitude": -4.0267
            },
            "contacts": {
                "reseauxSociaux": {
                    "facebook": "https://facebook.com/lycee-scientifique",
                    "twitter": "https://twitter.com/lycee-scientifique",
                    "instagram": "https://instagram.com/lycee-scientifique"
                },
                "telephone": "0123456789",
                "telephone2": "0987654321",
                "email": "contact@lycee-scientifique.ci",
                "email2": "info@lycee-scientifique.ci",
                "siteWeb": "https://lycee-scientifique.ci"
            },
            "configuration": {
                "options": {
                    "bulletinEnLigne": true,
                    "paiementEnLigne": true,
                    "emploiDuTempsEnLigne": true
                },
                "systemeEvaluation": "trimestre",
                "divisions": [
                    {
                        "nom": "Trimestre 1",
                        "dateDebut": "2023-09-01T00:00:00.000Z",
                        "dateFin": "2023-11-30T00:00:00.000Z",
                        "estActif": true,
                        "_id": "68a82d912ca8540ad4a22c91",
                        "id": "68a82d912ca8540ad4a22c91"
                    },
                    {
                        "nom": "Trimestre 2",
                        "dateDebut": "2023-12-01T00:00:00.000Z",
                        "dateFin": "2024-02-28T00:00:00.000Z",
                        "estActif": false,
                        "_id": "68a82d912ca8540ad4a22c92",
                        "id": "68a82d912ca8540ad4a22c92"
                    },
                    {
                        "nom": "Trimestre 3",
                        "dateDebut": "2024-03-01T00:00:00.000Z",
                        "dateFin": "2024-05-31T00:00:00.000Z",
                        "estActif": false,
                        "_id": "68a82d912ca8540ad4a22c93",
                        "id": "68a82d912ca8540ad4a22c93"
                    }
                ],
                "tranchesPaiement": [
                    {
                        "nom": "Inscription",
                        "montant": 50000,
                        "dateEcheance": "2023-09-15T00:00:00.000Z",
                        "estObligatoire": true,
                        "_id": "68a82d912ca8540ad4a22c94",
                        "id": "68a82d912ca8540ad4a22c94"
                    },
                    {
                        "nom": "Trimestre 1",
                        "montant": 75000,
                        "dateEcheance": "2023-10-15T00:00:00.000Z",
                        "estObligatoire": true,
                        "_id": "68a82d912ca8540ad4a22c95",
                        "id": "68a82d912ca8540ad4a22c95"
                    },
                    {
                        "nom": "Trimestre 2",
                        "montant": 75000,
                        "dateEcheance": "2024-01-15T00:00:00.000Z",
                        "estObligatoire": true,
                        "_id": "68a82d912ca8540ad4a22c96",
                        "id": "68a82d912ca8540ad4a22c96"
                    },
                    {
                        "nom": "Trimestre 3",
                        "montant": 75000,
                        "dateEcheance": "2024-04-15T00:00:00.000Z",
                        "estObligatoire": true,
                        "_id": "68a82d912ca8540ad4a22c97",
                        "id": "68a82d912ca8540ad4a22c97"
                    }
                ]
            },
            "parametresAvances": {
                "delaiPaiement": 30,
                "seuilAlerteStock": 10,
                "modeMaintenance": false,
                "messageMaintenance": ""
            },
            "_id": "68a82d912ca8540ad4a22c90",
            "nom": "Lycée Scientifique d'Abidjan",
            "sigle": "LSA",
            "type": "secondaire",
            "categorie": "prive",
            "description": "Lycée privé spécialisé dans les filières scientifiques et technologiques",
            "etablissementsFilles": [],
            "statut": "actif",
            "logo": null,
            "images": [],
            "effectifMax": 800,
            "effectifActuel": 0,
            "zone": "Zone Abidjan Nord",
            "academie": "Académie d'Abidjan",
            "inspection": "Inspection d'Abidjan 2",
            "dateCreation": "2025-08-22T08:42:57.834Z",
            "documents": [],
            "dateFinPeriodeEssai": "2025-09-21T08:42:57.834Z",
            "createdAt": "2025-08-22T08:42:57.847Z",
            "updatedAt": "2025-09-03T22:00:00.094Z",
            "__v": 0,
            "dateBlocage": "2025-09-03T22:00:00.093Z",
            "motifBlocage": "abonnement_expire",
            "id": "68a82d912ca8540ad4a22c90"
        }
    }
}
GET sans body /mobile/inscription/verifier renvoie {
    "inscriptionTrouvee": true,
    "inscription": {
        "id": "68ae55dc0a5616452f5095dd",
        "statut": "actif",
        "eleve": {
            "id": "68a910b0443009e9fde2a133"
        },
        "classe": {
            "_id": "68a8baee7c504bc1e4f3018b",
            "nom": "6ème A",
            "id": "68a8baee7c504bc1e4f3018b"
        },
        "anneeScolaire": {
            "id": "68a8960a0029e792ff237a50",
            "nom": "2023-2024"
        }
    }
}
GET sans body mobile/paiements/info renvoie {
    "data": [
        {
            "inscription": {
                "id": "68ae55dc0a5616452f5095dd",
                "eleve": {
                    "id": "68a910b0443009e9fde2a133",
                    "nom": "Dupont",
                    "prenom": "Jean"
                },
                "classe": {
                    "_id": "68a8baee7c504bc1e4f3018b",
                    "nom": "6ème A",
                    "id": "68a8baee7c504bc1e4f3018b"
                },
                "statut": "actif",
                "statutPaiementGlobal": "paye"
            },
            "anneeScolaire": {
                "id": "68a8960a0029e792ff237a50",
                "nom": "2023-2024"
            },
            "montantTotal": 80000,
            "montantPaye": 720000,
            "montantRestant": -640000,
            "tranches": [
                {
                    "options": {
                        "paiementEnLigne": true,
                        "paiementPhysique": true,
                        "paiementPartiel": false,
                        "penaliteRetard": 5
                    },
                    "nom": "1er versement",
                    "description": "Premier versement des frais scolaires",
                    "montant": 150000,
                    "devise": "CFA",
                    "dateDebut": "2023-09-01T00:00:00.000Z",
                    "dateFin": "2023-12-19T00:00:00.000Z",
                    "ordre": 1,
                    "estObligatoire": true,
                    "statut": "active",
                    "_id": "68a8960a0029e792ff237a56",
                    "index": 0,
                    "statutPaiement": "complet",
                    "montantPaye": 150000,
                    "datePaiement": "2025-09-04T11:59:14.484Z"
                },
                {
                    "options": {
                        "paiementEnLigne": true,
                        "paiementPhysique": true,
                        "paiementPartiel": false,
                        "penaliteRetard": 5
                    },
                    "nom": "2ème versement",
                    "description": "Second versement des frais scolaires",
                    "montant": 150000,
                    "devise": "CFA",
                    "dateDebut": "2024-01-08T00:00:00.000Z",
                    "dateFin": "2024-06-30T00:00:00.000Z",
                    "ordre": 2,
                    "estObligatoire": true,
                    "statut": "active",
                    "_id": "68a8960a0029e792ff237a57",
                    "index": 1,
                    "statutPaiement": "complet",
                    "montantPaye": 150000,
                    "datePaiement": "2025-09-04T11:59:14.701Z"
                }
            ],
            "paiements": [
                {
                    "_id": "68b970bb57f379556187f70f",
                    "inscription": "68ae55dc0a5616452f5095dd",
                    "etablissement": "68a82d912ca8540ad4a22c90",
                    "anneeScolaire": "68a8960a0029e792ff237a50",
                    "trancheIndex": 1,
                    "trancheNom": "2ème versement",
                    "trancheMontant": 150000,
                    "trancheDateFin": "2024-06-30T00:00:00.000Z",
                    "estPaiementGlobal": false,
                    "tranchesIndexes": [],
                    "montant": 150000,
                    "devise": "CFA",
                    "dateLimite": "2024-06-30T00:00:00.000Z",
                    "methode": "espece",
                    "statut": "complet",
                    "datePaiement": "2025-09-04T11:59:14.701Z",
                    "historiqueStatut": [
                        {
                            "statut": "complet",
                            "utilisateur": "68a88ad0964ef08fc501c393",
                            "commentaire": "Payé via paiement global",
                            "_id": "68b97f12770c9570b6b2d0f1",
                            "date": "2025-09-04T11:59:14.702Z"
                        }
                    ],
                    "createdAt": "2025-09-04T10:58:03.565Z",
                    "updatedAt": "2025-09-04T11:59:14.704Z",
                    "referencePaiement": "PAY-20250904-9985",
                    "__v": 1
                },
                {
                    "_id": "68b970bb57f379556187f70d",
                    "inscription": "68ae55dc0a5616452f5095dd",
                    "etablissement": "68a82d912ca8540ad4a22c90",
                    "anneeScolaire": "68a8960a0029e792ff237a50",
                    "trancheIndex": 0,
                    "trancheNom": "1er versement",
                    "trancheMontant": 150000,
                    "trancheDateFin": "2023-12-19T00:00:00.000Z",
                    "estPaiementGlobal": false,
                    "tranchesIndexes": [],
                    "montant": 150000,
                    "devise": "CFA",
                    "dateLimite": "2023-12-19T00:00:00.000Z",
                    "methode": "espece",
                    "statut": "complet",
                    "datePaiement": "2025-09-04T11:59:14.484Z",
                    "historiqueStatut": [
                        {
                            "statut": "complet",
                            "utilisateur": "68a88ad0964ef08fc501c393",
                            "commentaire": "Payé via paiement global",
                            "_id": "68b97f12770c9570b6b2d0ee",
                            "date": "2025-09-04T11:59:14.486Z"
                        }
                    ],
                    "createdAt": "2025-09-04T10:58:03.454Z",
                    "updatedAt": "2025-09-04T11:59:14.489Z",
                    "referencePaiement": "PAY-20250904-5066",
                    "__v": 1
                },
                {
                    "details": {
                        "collecteur": "68a88ad0964ef08fc501c393",
                        "nomPayeur": "Parent de l'élève",
                        "commentaire": "Paiement global de toutes les tranches"
                    },
                    "_id": "68b97f12770c9570b6b2d0ea",
                    "inscription": "68ae55dc0a5616452f5095dd",
                    "etablissement": "68a82d912ca8540ad4a22c90",
                    "anneeScolaire": "68a8960a0029e792ff237a50",
                    "estPaiementGlobal": true,
                    "tranchesIndexes": [
                        0,
                        1
                    ],
                    "montant": 315000,
                    "devise": "CFA",
                    "datePaiement": "2025-09-04T11:59:14.261Z",
                    "methode": "espece",
                    "statut": "complet",
                    "historiqueStatut": [
                        {
                            "statut": "complet",
                            "utilisateur": "68a88ad0964ef08fc501c393",
                            "commentaire": "Paiement global de toutes les tranches",
                            "_id": "68b97f12770c9570b6b2d0eb",
                            "date": "2025-09-04T11:59:14.269Z"
                        }
                    ],
                    "createdAt": "2025-09-04T11:59:14.278Z",
                    "updatedAt": "2025-09-04T11:59:14.278Z",
                    "referencePaiement": "PAY-20250904-7883",
                    "__v": 0
                },
                {
                    "details": {
                        "collecteur": "68a88ad0964ef08fc501c393",
                        "nomPayeur": "Parent de l'élève",
                        "commentaire": "Paiement de la première tranche"
                    },
                    "_id": "68b979e5b9d532a689fdcab3",
                    "inscription": "68ae55dc0a5616452f5095dd",
                    "etablissement": "68a82d912ca8540ad4a22c90",
                    "anneeScolaire": "68a8960a0029e792ff237a50",
                    "trancheIndex": 0,
                    "trancheNom": "1er versement",
                    "trancheMontant": 150000,
                    "trancheDateFin": "2023-12-19T00:00:00.000Z",
                    "estPaiementGlobal": false,
                    "tranchesIndexes": [],
                    "montant": 105000,
                    "devise": "CFA",
                    "dateLimite": "2023-12-19T00:00:00.000Z",
                    "methode": "espece",
                    "statut": "partiel",
                    "historiqueStatut": [
                        {
                            "statut": "partiel",
                            "utilisateur": "68a88ad0964ef08fc501c393",
                            "commentaire": "Paiement physique enregistré",
                            "_id": "68b979e5b9d532a689fdcab4",
                            "date": "2025-09-04T11:37:09.050Z"
                        }
                    ],
                    "datePaiement": "2025-09-04T11:37:09.050Z",
                    "createdAt": "2025-09-04T11:37:09.056Z",
                    "updatedAt": "2025-09-04T11:37:09.056Z",
                    "referencePaiement": "PAY-20250904-6903",
                    "__v": 0
                }
            ],
            "recus": [
                {
                    "informations": {
                        "eleve": "Dupont Jean",
                        "classe": "6ème A",
                        "anneeScolaire": "2023-2024",
                        "tranche": "Paiement global",
                        "motif": "Paiement global de toutes les tranches",
                        "paiementPar": "Parent de l'élève"
                    },
                    "_id": "68b97f13770c9570b6b2d0fa",
                    "paiement": "68b97f12770c9570b6b2d0ea",
                    "inscription": "68ae55dc0a5616452f5095dd",
                    "etablissement": "68a82d912ca8540ad4a22c90",
                    "montant": 315000,
                    "devise": "CFA",
                    "emisPar": "68a88ad0964ef08fc501c393",
                    "statut": "valide",
                    "dateEmission": "2025-09-04T11:59:15.135Z",
                    "createdAt": "2025-09-04T11:59:15.137Z",
                    "updatedAt": "2025-09-04T11:59:15.137Z",
                    "numero": "REC-20250904-7872",
                    "__v": 0
                },
                {
                    "informations": {
                        "eleve": "Dupont Jean",
                        "classe": "6ème A",
                        "anneeScolaire": "2023-2024",
                        "tranche": "1er versement",
                        "motif": "Paiement des frais scolaires",
                        "paiementPar": "Dupont Jean"
                    },
                    "_id": "68b979e5b9d532a689fdcabb",
                    "paiement": "68b979e5b9d532a689fdcab3",
                    "inscription": "68ae55dc0a5616452f5095dd",
                    "etablissement": "68a82d912ca8540ad4a22c90",
                    "montant": 105000,
                    "devise": "CFA",
                    "emisPar": "68a88ad0964ef08fc501c393",
                    "statut": "valide",
                    "dateEmission": "2025-09-04T11:37:09.581Z",
                    "createdAt": "2025-09-04T11:37:09.582Z",
                    "updatedAt": "2025-09-04T11:37:09.582Z",
                    "numero": "REC-20250904-3939",
                    "__v": 0
                },
                {
                    "informations": {
                        "eleve": "Dupont Jean",
                        "classe": "6ème A",
                        "anneeScolaire": "2023-2024",
                        "tranche": "1er versement",
                        "motif": "Paiement des frais scolaires",
                        "paiementPar": "Dupont Jean"
                    },
                    "_id": "68b978f97110399dc8c212ee",
                    "paiement": "68b978f87110399dc8c212e3",
                    "inscription": "68ae55dc0a5616452f5095dd",
                    "etablissement": "68a82d912ca8540ad4a22c90",
                    "montant": 105000,
                    "devise": "CFA",
                    "emisPar": "68a88ad0964ef08fc501c393",
                    "statut": "valide",
                    "dateEmission": "2025-09-04T11:33:13.399Z",
                    "createdAt": "2025-09-04T11:33:13.402Z",
                    "updatedAt": "2025-09-04T11:33:13.402Z",
                    "numero": "REC-20250904-2971",
                    "__v": 0
                },
                {
                    "informations": {
                        "eleve": "Dupont Jean",
                        "classe": "6ème A",
                        "anneeScolaire": "2023-2024",
                        "tranche": "1er versement",
                        "motif": "Paiement des frais scolaires",
                        "paiementPar": "Dupont Jean"
                    },
                    "_id": "68b9787e57c03381b3d5c283",
                    "paiement": "68b9787d57c03381b3d5c279",
                    "inscription": "68ae55dc0a5616452f5095dd",
                    "etablissement": "68a82d912ca8540ad4a22c90",
                    "montant": 105000,
                    "devise": "CFA",
                    "emisPar": "68a88ad0964ef08fc501c393",
                    "statut": "valide",
                    "dateEmission": "2025-09-04T11:31:10.464Z",
                    "createdAt": "2025-09-04T11:31:10.465Z",
                    "updatedAt": "2025-09-04T11:31:10.465Z",
                    "numero": "REC-20250904-279",
                    "__v": 0
                }
            ]
        }
    ]
}
Ok d'accord donc d'abord on doit s'assurer qu'il y'a une inscription en cours pour faire sortir
les tranches de payéer de l'anneé en cours, prevoir une option ou il peut payer la totalité en même
affiches l'historiques de payeant, les cas écheances montant total, montant restant absolument tout 
fait une truc propre prefessionnel, n'oublie pas l'écran de détail aussi