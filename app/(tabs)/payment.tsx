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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const PaiementsScreen = () => {
  const { user, profileType } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedTranche, setSelectedTranche] = useState(null);
  const [selectedMoyen, setSelectedMoyen] = useState(null);
  const [numeroTelephone, setNumeroTelephone] = useState('');
  const [montantAPayer, setMontantAPayer] = useState(0);
  const [activeTab, setActiveTab] = useState('Montants payés');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Données dynamiques
  const [inscription, setInscription] = useState(null);
  const [paiementInfo, setPaiementInfo] = useState(null);
  const [anneesScolaires, setAnneesScolaires] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState(null);
  
  // Moyens de paiement
  const moyensPaiement = [
    { id: 'wave', nom: 'Wave', icon: '📱', couleur: '#00D4FF' },
    { id: 'orange', nom: 'Orange Money', icon: '📱', couleur: '#FF7900' },
    { id: 'mtn', nom: 'MTN Money', icon: '📱', couleur: '#FFCC00' },
    { id: 'moov', nom: 'Moov Money', icon: '📱', couleur: '#0099CC' },
  ];

  // Charger les données de l'inscription
  const loadInscription = async () => {
    try {
      const response = await api.get('/mobile/inscription/verifier');
      if (response.data.inscriptionTrouvee) {
        setInscription(response.data.inscription);
        // Définir l'année scolaire sélectionnée
        setSelectedAnnee(response.data.inscription.anneeScolaire);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'inscription:', error);
      Alert.alert('Erreur', 'Impossible de vérifier votre inscription');
    }
  };

  // Charger les informations de paiement
  const loadPaiementInfo = async () => {
    try {
      const response = await api.get('/mobile/paiements/info');
      if (response.data.data && response.data.data.length > 0) {
        setPaiementInfo(response.data.data[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des informations de paiement:', error);
      Alert.alert('Erreur', 'Impossible de charger les informations de paiement');
    }
  };

  // Charger les années scolaires
  const loadAnneesScolaires = async () => {
    try {
      console.log('data', user?.etablissementActif)
      const etablissementId = user?.etablissementActif;
      const response = await api.get(`/annee-scolaire/etablissement/${etablissementId}`);
      if (response.data.data && response.data.data.anneesScolaires) {
        setAnneesScolaires(response.data.data.anneesScolaires);
        // Sélectionner l'année en cours par défaut
        const anneeEnCours = response.data.data.anneesScolaires.find(a => a.statut === 'en_cours');
        if (anneeEnCours) {
          setSelectedAnnee(anneeEnCours);
        }
      }
    } catch (error) {
      console.log('data', user)
      console.error('Erreur lors du chargement des années scolaires:', error);
      Alert.alert('Erreur', 'Impossible de charger les années scolaires');
    }
  };

  // Charger toutes les données
  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadInscription(),
      loadPaiementInfo(),
      loadAnneesScolaires()
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Vérifier s'il y a des échéances à payer
  const hasEcheancesAPayer = () => {
    if (!paiementInfo || !paiementInfo.tranches) return false;
    return paiementInfo.tranches.some(tranche => tranche.statutPaiement !== 'complet');
  };

  // Calculer le montant total
  const montantTotal = paiementInfo ? paiementInfo.montantTotal : 0;
  
  // Calculer le montant payé
  const montantPaye = paiementInfo ? paiementInfo.montantPaye : 0;
  
  // Calculer le montant restant
  const montantRestant = paiementInfo ? paiementInfo.montantRestant : 0;

  // Ouvrir un modal
  const openModal = (type, tranche = null) => {
    if (tranche) {
      setSelectedTranche(tranche);
      setMontantAPayer(tranche.montant - (tranche.montantPaye || 0));
    }
    setModalType(type);
    setModalVisible(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setModalVisible(false);
    setModalType('');
    setSelectedTranche(null);
    setNumeroTelephone('');
  };

  // Sélectionner un moyen de paiement
  const handleSelectMoyen = (moyen) => {
    setSelectedMoyen(moyen);
    closeModal();
    setTimeout(() => openModal('numero'), 300);
  };

  // Confirmer le paiement
  const handleConfirmerPaiement = async () => {
    if (!numeroTelephone.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro de téléphone');
      return;
    }
    
    try {
      // Simuler le paiement
      Alert.alert(
        'Paiement initié',
        `Un code de confirmation va être envoyé au ${numeroTelephone}`,
        [
          {
            text: 'OK',
            onPress: async () => {
              closeModal();
              // Mettre à jour les données après paiement
              await loadData();
              setNumeroTelephone('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      Alert.alert('Erreur', 'Le paiement a échoué');
    }
  };

  // Naviguer vers les détails d'une transaction
  const navigateToTransactionDetails = (transaction) => {
    router.push({
      pathname: 'transaction_detail',
      params: { transaction: JSON.stringify(transaction) }
    });
  };

  // Rendre le contenu du modal
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
            <Text style={styles.modalTitle}>Sélectionner une tranche</Text>
            
            <View style={styles.tranchesContainer}>
              {paiementInfo && paiementInfo.tranches.map((tranche) => (
                <TouchableOpacity
                  key={tranche._id}
                  style={[
                    styles.trancheItem,
                    tranche.statutPaiement === 'complet' && styles.trancheComplete
                  ]}
                  onPress={() => tranche.statutPaiement !== 'complet' && openModal('montant', tranche)}
                  disabled={tranche.statutPaiement === 'complet'}
                >
                  <View style={styles.trancheInfo}>
                    <View style={styles.trancheIcon}>
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                    </View>
                    <View>
                      <Text style={styles.trancheLibelle}>{tranche.nom}</Text>
                      <Text style={styles.trancheDate}>
                        {new Date(tranche.dateDebut).toLocaleDateString('fr-FR')} - {new Date(tranche.dateFin).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.trancheMontant}>{tranche.montant.toLocaleString()} F</Text>
                    <Text style={[
                      styles.trancheStatut,
                      tranche.statutPaiement === 'complet' ? styles.statutPaye : 
                      tranche.statutPaiement === 'partiel' ? styles.statutPartiel : styles.statutNonPaye
                    ]}>
                      {tranche.statutPaiement === 'complet' ? 'Payée' : 
                       tranche.statutPaiement === 'partiel' ? 'Partielle' : 'Non payée'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.payerTotalButton}
              onPress={() => openModal('montant', { montant: montantRestant, nom: 'Totalité' })}
            >
              <Text style={styles.payerTotalButtonText}>Payer la totalité ({montantRestant.toLocaleString()} F)</Text>
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
            <Text style={styles.modalTitle}>Confirmer le paiement</Text>
            
            <View style={styles.montantContainer}>
              <Text style={styles.montantPrincipal}>{montantAPayer.toLocaleString()} F</Text>
              <Text style={styles.montantEcole}>
                {selectedTranche?.nom || 'Totalité des frais'}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.payerButton} 
              onPress={() => {
                closeModal();
                setTimeout(() => openModal('moyens'), 300);
              }}
            >
              <Text style={styles.payerButtonText}>Continuer</Text>
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
              <Text style={styles.modalHeaderTitle}>Moyen de paiement</Text>
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
              <Text style={styles.modalHeaderTitle}>Numéro de téléphone</Text>
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
              
              <Text style={styles.montantInfo}>Montant à payer: {montantAPayer.toLocaleString()} F CFA</Text>
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Sélecteur d'année scolaire */}
        <View style={styles.anneeSelectorContainer}>
          <Text style={styles.anneeSelectorLabel}>Année scolaire</Text>
          <TouchableOpacity 
            style={styles.anneeSelectorButton}
            onPress={() => openModal('annees')}
          >
            <Text style={styles.anneeSelectorValue}>
              {selectedAnnee ? selectedAnnee.nom : 'Sélectionner une année'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Montants */}
        <View style={styles.montantsContainer}>
          <View style={styles.montantCard}>
            <View style={styles.montantHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.montantLabel}>MONTANT PAYÉ</Text>
            </View>
            <Text style={styles.montantValue}>{montantPaye.toLocaleString()} F</Text>
          </View>
          
          <View style={styles.montantCard}>
            <View style={styles.montantHeader}>
              <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
              <Text style={styles.montantLabel}>MONTANT RESTANT</Text>
            </View>
            <Text style={[styles.montantValue, styles.montantRestantValue]}>
              {montantRestant.toLocaleString()} F
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
        {activeTab === 'Montants payés' && paiementInfo && paiementInfo.paiements && paiementInfo.paiements.length > 0 ? (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Historique des paiements</Text>
            {paiementInfo.paiements.map((paiement) => (
              <TouchableOpacity
                key={paiement._id}
                style={styles.historyItem}
                onPress={() => navigateToTransactionDetails(paiement)}
              >
                <View style={styles.historyIcon}>
                  <Ionicons name="arrow-up" size={20} color="#666" />
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyType}>
                    {paiement.estPaiementGlobal ? 'Paiement global' : paiement.trancheNom}
                  </Text>
                  <Text style={styles.historyDateTime}>
                    {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')} à {new Date(paiement.datePaiement).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                  </Text>
                  <Text style={styles.historyReference}>
                    Réf: {paiement.referencePaiement}
                  </Text>
                </View>
                <Text style={styles.historyAmount}>
                  {paiement.montant.toLocaleString()} {paiement.devise}
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
            <Text style={styles.echeancesTitle}>Échéances à payer</Text>
            {paiementInfo && paiementInfo.tranches && paiementInfo.tranches.length > 0 ? (
              paiementInfo.tranches
                .filter(tranche => tranche.statutPaiement !== 'complet')
                .map((tranche) => (
                  <View key={tranche._id} style={styles.echeanceItem}>
                    <View style={styles.echeanceInfo}>
                      <Text style={styles.echeanceNom}>{tranche.nom}</Text>
                      <Text style={styles.echeanceDate}>
                        Échéance: {new Date(tranche.dateFin).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <View style={styles.echeanceMontant}>
                      <Text style={styles.echeanceMontantValue}>
                        {tranche.montant.toLocaleString()} F
                      </Text>
                      <TouchableOpacity 
                        style={styles.payerEcheanceButton}
                        onPress={() => openModal('tranches', tranche)}
                      >
                        <Text style={styles.payerEcheanceText}>Payer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
            ) : (
              <View style={styles.noEcheancesContainer}>
                <View style={styles.noEcheancesIconContainer}>
                  <Ionicons name="checkmark-circle-outline" size={60} color="#4CAF50" />
                </View>
                <Text style={styles.noEcheancesTitle}>Félicitations!</Text>
                <Text style={styles.noEcheancesText}>
                  Vous n'avez aucune échéance de paiement en attente pour cette année scolaire.
                </Text>
                <View style={styles.noEcheancesCard}>
                  <View style={styles.noEcheancesCardItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.noEcheancesCardText}>Tous les paiements sont à jour</Text>
                  </View>
                  <View style={styles.noEcheancesCardItem}>
                    <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                    <Text style={styles.noEcheancesCardText}>Prochaine échéance: Non définie</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
        
        {/* Bouton Nouveau paiement - uniquement s'il y a des échéances à payer */}
        {hasEcheancesAPayer() && (
          <TouchableOpacity
            style={styles.nouveauPaiementButton}
            onPress={() => openModal('tranches')}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.nouveauPaiementText}>Nouveau paiement</Text>
          </TouchableOpacity>
        )}
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
  anneeSelectorContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  anneeSelectorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  anneeSelectorButton: {
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
  anneeSelectorValue: {
    fontSize: 14,
    color: '#333',
  },
  montantsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  montantCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
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
    fontSize: 18,
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
  historyReference: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  echeancesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  echeancesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  echeanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  echeanceInfo: {
    flex: 1,
  },
  echeanceNom: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  echeanceDate: {
    fontSize: 14,
    color: '#666',
  },
  echeanceMontant: {
    alignItems: 'flex-end',
  },
  echeanceMontantValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  payerEcheanceButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  payerEcheanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Styles pour la section "aucune échéance"
  noEcheancesContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  noEcheancesIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noEcheancesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noEcheancesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  noEcheancesCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  noEcheancesCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  noEcheancesCardItemlastChild: {
    marginBottom: 0,
  },
  noEcheancesCardText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
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
    marginBottom: 20,
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
  trancheComplete: {
    opacity: 0.6,
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
    fontWeight: '500',
  },
  trancheDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  trancheMontant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  trancheStatut: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statutPaye: {
    color: '#4CAF50',
  },
  statutPartiel: {
    color: '#FF9800',
  },
  statutNonPaye: {
    color: '#F44336',
  },
  payerTotalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  payerTotalButtonText: {
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
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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