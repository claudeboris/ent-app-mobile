import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

export default function ResultsScreen() {
  const { user, showErrorToast, showSuccessToast } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('notes');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [notesData, setNotesData] = useState(null);
  const [bulletinsData, setBulletinsData] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  
  // Charger les données de notes
  const loadNotesData = async () => {
    if (!user) return;
    
    try {
      console.log('Chargement des notes pour:', selectedYear, selectedPeriod);
      const response = await api.get(`/notes/eleve/${user.id}/notes-enseignants`, {
        params: {
          anneeScolaire: selectedYear,
          periode: selectedPeriod
        }
      });
      
      console.log('Réponse API notes:', response.data);
      
      if (response.data && response.data.data) {
        setNotesData(response.data);
        // Mettre à jour l'année et la période avec les valeurs de la réponse
        setSelectedYear(response.data.anneeScolaire);
        setSelectedPeriod(response.data.periode);
        setCurrentPeriod(response.data.data.periode);
      } else {
        setNotesData(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
      
      // Gérer les erreurs spécifiques
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 404) {
          if (data.message && data.message.includes("n'est pas inscrit")) {
            showErrorToast('Erreur', 'Vous n\'êtes pas inscrit pour l\'année scolaire en cours. Veuillez contacter l\'administration.');
          } else {
            showErrorToast('Erreur', 'Aucune donnée trouvée pour cette période');
          }
        } else if (status === 400) {
          showErrorToast('Erreur', data.message || 'Requête invalide');
        } else {
          showErrorToast('Erreur', 'Impossible de charger les notes');
        }
      } else {
        showErrorToast('Erreur', 'Problème de connexion');
      }
      
      setNotesData(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Charger les données de bulletins
  const loadBulletinsData = async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/bulletins/eleve/${user.id}/annees-scolaires/bulletins`);
      setBulletinsData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des bulletins:', error);
      showErrorToast('Erreur', 'Impossible de charger les bulletins');
      setBulletinsData(null);
    }
  };

  // Charger les années scolaires disponibles
  const loadAvailableYears = async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/notes/eleve/${user.id}/annees-scolaires`);
      if (response.data && response.data.data) {
        setAvailableYears(response.data.data);
        // Définir la première année comme sélectionnée si pas encore définie
        if (response.data.data.length > 0 && !selectedYear) {
          setSelectedYear(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des années scolaires:', error);
      // Garder les années par défaut en cas d'erreur
    }
  };
  
  // Charger toutes les données
  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadAvailableYears(),
      loadNotesData(),
      loadBulletinsData()
    ]);
    setIsLoading(false);
  };
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  // Rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
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

  // Formater la période pour l'affichage
  const formatPeriodDates = () => {
    if (!currentPeriod || !currentPeriod.dateDebut || !currentPeriod.dateFin) {
      return '';
    }
    
    const startDate = new Date(currentPeriod.dateDebut);
    const endDate = new Date(currentPeriod.dateFin);
    
    const startMonth = startDate.toLocaleDateString('fr-FR', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('fr-FR', { month: 'short' });
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    if (startYear === endYear) {
      return `${startMonth} - ${endMonth} ${startYear}`;
    } else {
      return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
    }
  };

  // Fonction pour changer d'année scolaire
  const handleYearChange = () => {
    if (availableYears.length === 0) {
      Alert.alert('Information', 'Aucune année scolaire disponible');
      return;
    }
    
    Alert.alert(
      'Année scolaire',
      'Sélectionnez une année',
      availableYears.map(year => ({
        text: year,
        onPress: async () => {
          setSelectedYear(year);
          // Réinitialiser les données et recharger
          setNotesData(null);
          setIsLoading(true);
          await loadNotesData();
        }
      }))
    );
  };

  // Fonctions pour les icônes du header
  const handleShare = () => {
    Alert.alert('Partage', 'Fonctionnalité de partage des résultats à venir');
  };

  const handleSearch = () => {
    Alert.alert('Recherche', 'Fonctionnalité de recherche des résultats à venir');
  };

  const handleBookmark = () => {
    Alert.alert('Favoris', 'Fonctionnalité de favoris des résultats à venir');
  };

  // Fonction pour vérifier si l'élève est inscrit
  const checkInscription = () => {
    if (!notesData || !notesData.data || !notesData.data.eleve || !notesData.data.eleve.classe) {
      return false;
    }
    return true;
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des résultats...</Text>
          <Text style={styles.loadingSubtext}>
            {selectedYear} - {selectedPeriod}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Vérifier si l'élève est inscrit
  const isInscrit = checkInscription();
  
  const renderNotesTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Message si non inscrit */}
      {!isInscrit && (
        <View style={styles.inscriptionRequiredContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF5252" />
          <Text style={styles.inscriptionRequiredTitle}>Inscription requise</Text>
          <Text style={styles.inscriptionRequiredText}>
            Vous n'êtes pas inscrit pour l'année scolaire en cours. Veuillez contacter l'administration pour vous inscrire.
          </Text>
          <TouchableOpacity 
            style={styles.inscriptionButton}
            onPress={() => router.push('contact')}
          >
            <Text style={styles.inscriptionButtonText}>Contacter l'administration</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Sélecteur d'année scolaire */}
      <View style={styles.selector}>
        <Text style={styles.selectorLabel}>Année scolaire</Text>
        <TouchableOpacity style={styles.selectorButton} onPress={handleYearChange}>
          <Text style={styles.selectorValue}>{selectedYear}</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>
      
      {/* Période Header */}
      <View style={styles.periodHeader}>
        <View style={styles.periodInfo}>
          <Text style={styles.periodTitle}>{selectedPeriod}</Text>
          <Text style={styles.periodDate}>{formatPeriodDates()}</Text>
        </View>
      </View>
      
      {/* Stats Cards */}
      {notesData && notesData.data && notesData.data.stats ? (
        <View style={styles.statsContainer}>
          <View style={styles.moyenneCard}>
            <Text style={styles.cardLabel}>Moyenne</Text>
            <Text style={styles.cardNumber}>{notesData.data.stats.moyenne.toFixed(2)}</Text>
          </View>
          
          <View style={styles.bestNoteCard}>
            <Text style={styles.cardLabel}>Meilleure note</Text>
            <Text style={styles.cardNumber}>{notesData.data.stats.meilleureNote}</Text>
          </View>
          
          <View style={styles.worstNoteCard}>
            <Text style={styles.cardLabel}>Moins bonne note</Text>
            <Text style={styles.cardNumber}>{notesData.data.stats.moinsBonneNote}</Text>
          </View>
        </View>
      ) : !isLoading && isInscrit && (
        <View style={styles.noDataContainer}>
          <Ionicons name="document-text-outline" size={48} color="#ccc" />
          <Text style={styles.noDataText}>
            Aucune donnée disponible pour {selectedPeriod} {selectedYear}
          </Text>
        </View>
      )}
      
      {/* Grades Table */}
      {notesData && notesData.data && notesData.data.notesParMatiere && Object.keys(notesData.data.notesParMatiere).length > 0 ? (
        <View style={styles.gradesTable}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.headerSubject}>Matières</Text>
            <Text style={styles.headerNote}>Note 1</Text>
            <Text style={styles.headerNote}>Note 2</Text>
            <Text style={styles.headerNote}>Note 3</Text>
            <Text style={styles.headerMoyenne}>Moyenne</Text>
          </View>
          
          {/* Rows */}
          {Object.values(notesData.data.notesParMatiere).map((matiereData, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.subjectName}>{matiereData.matiere.nom}</Text>
              <Text style={styles.gradeCell}>
                {matiereData.notes.length > 0 ? matiereData.notes[0].valeur : '-'}
              </Text>
              <Text style={styles.gradeCell}>
                {matiereData.notes.length > 1 ? matiereData.notes[1].valeur : '-'}
              </Text>
              <Text style={styles.gradeCell}>
                {matiereData.notes.length > 2 ? matiereData.notes[2].valeur : '-'}
              </Text>
              <View style={styles.moyenneCell}>
                <Text style={styles.moyenneText}>{matiereData.moyenne.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : !isLoading && isInscrit && (
        <View style={styles.noDataContainer}>
          <Ionicons name="school-outline" size={48} color="#ccc" />
          <Text style={styles.noDataText}>
            Aucune note disponible pour {selectedPeriod} {selectedYear}
          </Text>
          <Text style={styles.noDataSubtext}>
            Les notes apparaîtront ici une fois qu'elles seront saisies par vos enseignants.
          </Text>
        </View>
      )}
      
      {/* Teachers Section */}
      {notesData && notesData.data && notesData.data.enseignantsParMatiere && notesData.data.enseignantsParMatiere.length > 0 ? (
        <View style={styles.teachersSection}>
          <Text style={styles.sectionTitle}>{t('results.teachers')}</Text>
          {notesData.data.enseignantsParMatiere.map((enseignantMatiere, index) => (
            <TouchableOpacity key={index} style={styles.teacherItem}>
              <Image 
                source={{ uri: `https://images.unsplash.com/photo-15${index % 2 === 0 ? '00' : '49'}7003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face` }} 
                style={styles.teacherAvatar} 
              />
              <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>
                  {enseignantMatiere.enseignant.prenom} {enseignantMatiere.enseignant.nom}
                </Text>
                <Text style={styles.teacherSubject}>
                  {t('results.teacherOf')} {enseignantMatiere.matiere.nom}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      ) : !isLoading && isInscrit && (
        <View style={styles.noDataContainer}>
          <Ionicons name="people-outline" size={48} color="#ccc" />
          <Text style={styles.noDataText}>
            Aucun enseignant trouvé pour cette période
          </Text>
        </View>
      )}
    </ScrollView>
  );
  
  const renderBulletinsTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Sélecteurs d'année scolaire */}
      <View style={styles.selector}>
        <Text style={styles.selectorLabel}>{t('results.schoolYear')}</Text>
        <TouchableOpacity style={styles.selectorButton}>
          <Text style={styles.selectorValue}>{selectedYear}</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>
      
      {bulletinsData && bulletinsData.resultats ? (
        <>
          {bulletinsData.resultats
            .filter(annee => annee.anneeScolaire.nom === selectedYear)
            .map(annee => (
              annee.bulletins && annee.bulletins.length > 0 ? (
                annee.bulletins.map(bulletin => (
                  <TouchableOpacity key={bulletin._id} style={styles.bulletinItem}>
                    <View style={styles.bulletinIcon}>
                      <Ionicons name="document-outline" size={24} color="#FF5252" />
                    </View>
                    <View style={styles.bulletinInfo}>
                      <View style={styles.bulletinHeader}>
                        <Text style={styles.bulletinTitle}>
                          {t('results.reportCard')} {bulletin.periode.nom}
                        </Text>
                        <View style={[styles.newBadge, { backgroundColor: bulletin.statut === 'publié' ? '#4CAF50' : '#FF9800' }]}>
                          <Text style={styles.newBadgeText}>
                            {bulletin.statut === 'publié' ? t('results.published') : t('results.draft')}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.bulletinPages}>
                        {bulletin.moyenne}/20 • {t('results.classAverage')}: {bulletin.moyenneClasse}/20
                      </Text>
                      <Text style={styles.bulletinPages}>
                        {t('results.rank')}: {bulletin.rang}/{bulletin.effectifClasse}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                      <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                <View key={annee.anneeScolaire.id} style={styles.noDataContainer}>
                  <Ionicons name="document-text-outline" size={48} color="#ccc" />
                  <Text style={styles.noDataText}>{t('results.noReportCardsForYear')}</Text>
                </View>
              )
            ))}
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Ionicons name="document-text-outline" size={48} color="#ccc" />
          <Text style={styles.noDataText}>{t('results.noReportCards')}</Text>
        </View>
      )}
    </ScrollView>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('results.title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#666" />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.headerButton} onPress={handleSearch}>
            <Ionicons name="search-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleBookmark}>
            <Ionicons name="bookmark-outline" size={24} color="#666" />
          </TouchableOpacity> */}
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
            {t('results.gradeTable')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bulletins' && styles.activeTab]}
          onPress={() => setActiveTab('bulletins')}
        >
          <Text style={[styles.tabText, activeTab === 'bulletins' && styles.activeTabText]}>
            {t('results.reportCards')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      {activeTab === 'notes' ? renderNotesTab() : renderBulletinsTab()}
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
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    marginBottom: 10,
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 2,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inscriptionRequiredContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  inscriptionRequiredTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF5252',
    marginTop: 10,
    marginBottom: 10,
  },
  inscriptionRequiredText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  inscriptionButton: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  inscriptionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  selector: {
    marginBottom: 20,
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
  periodHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  periodInfo: {
    alignItems: 'center',
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  periodDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  moyenneCard: {
    flex: 1,
    backgroundColor: '#4A90E2',
    padding: 20,
    borderRadius: 12,
    marginRight: 10,
  },
  bestNoteCard: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 12,
    marginRight: 10,
  },
  worstNoteCard: {
    flex: 1,
    backgroundColor: '#F44336',
    padding: 20,
    borderRadius: 12,
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
  gradesTable: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerSubject: {
    flex: 2,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  headerNote: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  headerMoyenne: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  subjectName: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
  gradeCell: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  moyenneCell: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 10,
  },
  moyenneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  teachersSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  teacherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  teacherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  teacherSubject: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bulletinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  bulletinIcon: {
    marginRight: 15,
  },
  bulletinInfo: {
    flex: 1,
  },
  bulletinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  bulletinTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  newBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  bulletinPages: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    padding: 10,
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
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
  },
});