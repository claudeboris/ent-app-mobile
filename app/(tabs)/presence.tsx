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
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

export default function PresenceScreen() {
  const { user, profileType } = useAuth();
  const { t } = useLanguage();
  const [presenceData, setPresenceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2023-2024');
  const [selectedPeriod, setSelectedPeriod] = useState(t('presence.firstQuarter'));
  
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
      Alert.alert(t('error.title'), t('presence.error'));
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
          <Text style={styles.loadingText}>{t('presence.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('presence.title')}</Text>
        <View style={styles.headerActions}>
          {/* <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="bookmark-outline" size={24} color="#666" />
          </TouchableOpacity> */}
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
            <Text style={styles.selectorLabel}>{t('presence.schoolYear')}</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>{selectedYear}</Text>
            </View>
          </View>
          
          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>{t('presence.period')}</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>{selectedPeriod}</Text>
            </View>
          </View>
        </View>
        
        {/* Stats Cards */}
        {presenceData && presenceData.data && (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.presenceCard}>
                <Text style={styles.cardLabel}>{t('presence.presences')}</Text>
                <Text style={styles.cardNumber}>{presenceData.data.stats.presence}</Text>
              </View>
              
              <View style={styles.absenceCard}>
                <Text style={styles.cardLabel}>{t('presence.absences')}</Text>
                <Text style={styles.cardNumber}>{presenceData.data.stats.absence}</Text>
              </View>
              
              {/* <View style={styles.retardCard}>
                <Text style={styles.cardLabel}>Retards</Text>
                <Text style={styles.cardNumber}>{presenceData.data.stats.retard}</Text>
              </View> */}
            </View>
            
            {/* Taux de présence */}
           {/*  <View style={styles.tauxPresenceContainer}>
              <Text style={styles.tauxPresenceLabel}>{t('presence.attendanceRate')}</Text>
              <Text style={styles.tauxPresenceValue}>{presenceData.data.stats.tauxPresence}%</Text>
              
              
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${presenceData.data.stats.tauxPresence}%` }
                  ]} 
                />
              </View>
            </View> */}
            
            {/* Absences List */}
            <View style={styles.absencesSection}>
              <Text style={styles.sectionTitle}>{t('presence.absencesList')}</Text>
              
              {presenceData.data.stats.absences && presenceData.data.stats.absences.length > 0 ? (
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
                       {/*  <TouchableOpacity style={styles.moreButton}>
                          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                        </TouchableOpacity> */}
                      </View>
                      
                      {/* Fixed: Added safe navigation with optional chaining */}
                      <Text style={styles.absenceCourse}>{absence.cours?.titre}</Text>
                      <Text style={styles.absenceMatiere}>{absence?.cours.matiere?.nom}</Text>
                      <View style={styles.absenceFooter}>
                        <View style={[
                          styles.statusBadge, 
                          { 
                            backgroundColor: absence.estJustifiee ? '#4CAF50' : '#FF5252' 
                          }
                        ]}>
                          <Text style={styles.statusText}>
                            {absence.estJustifiee ? t('presence.justified') : t('presence.unjustified')}
                          </Text>
                        </View>
                        
                        {absence.motif && (
                          <Text style={styles.absenceMotif}>
                            {t('presence.reason')}: {absence.motif}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="checkmark-circle-outline" size={48} color="#4CAF50" />
                  <Text style={styles.noDataText}>{t('presence.noAbsences')}</Text>
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
  disabledInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disabledInputText: {
    fontSize: 14,
    color: '#666',
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