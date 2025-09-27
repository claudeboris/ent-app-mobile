import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Dimensions,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import api from '../../../services/api';
import { url } from '@/constants/url';

const { width } = Dimensions.get('window');

// Composant Carousel Card
const CarouselCard = ({ item }) => {
  return (
    <View style={styles.carouselCard}>
      <Image 
        source={{ 
          uri: item.image 
            ? `${url}/uploads/evenements/${item.image}` 
            : 'https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=400&h=200&fit=crop'
        }} 
        style={styles.cardImage} 
      />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardTitle}>{item.titre}</Text>
        <Text style={styles.cardSubtitle}>{item.description}</Text>
        <Text style={styles.cardDate}>
          {new Date(item.dateDebut).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>
    </View>
  )
}

// Composant Assignment Card
const AssignmentCard = ({ item, t }) => {
  // Déterminer le type d'évaluation
  const getEvaluationType = () => {
    if (item.sousType === 'examen' || item.type === 'evaluation') {
      return t('home.evaluation.exam');
    } else if (item.sousType === 'devoir_surveille') {
      return t('home.evaluation.supervised');
    } else {
      return t('home.evaluation.homework');
    }
  };
  
  // Déterminer la couleur du statut en fonction de la date
  const getStatusColor = () => {
    const today = new Date();
    const evaluationDate = new Date(item.date);
    const diffTime = evaluationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#F44336'; // Passé
    if (diffDays === 0) return '#FF9800'; // Aujourd'hui
    if (diffDays <= 3) return '#4CAF50'; // Proche
    return '#2196F3'; // Futur
  };
  
  // Formater la date
  const formatDate = () => {
    const date = new Date(item.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return t('home.evaluation.today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('home.evaluation.tomorrow');
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
  };
  
  // Formater l'heure
  const formatTime = () => {
    return `${item.heureDebut} - ${item.heureFin}`;
  };
  
  return (
    <View style={styles.assignmentCard}>
      <View style={styles.assignmentHeader}>
        <Text style={styles.assignmentTitle}>{getEvaluationType()}</Text>
        <Ionicons name="chevron-down-outline" size={20} color="#666" />
      </View>
      
      <Text style={styles.assignmentSubject}>{item.titre}</Text>
      <Text style={styles.assignmentTime}>{formatDate()} • {formatTime()}</Text>
      <Text style={styles.assignmentLocation}>{item.salle}, {item.batiment}</Text>
      
      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>{formatDate()}</Text>
      </View>
    </View>
  );
};

// Main Dashboard Component
export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('devoirs');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);
  
  // Charger les données
  const loadData = async () => {
    if (!user) {
      console.log('Utilisateur non connecté');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Charger les événements de l'établissement
      if (user.etablissementActif) {
        try {
          const eventsResponse = await api.get(`/evenements/etablissement/${user.etablissementActif}`);
          setEvents(eventsResponse.data.data.evenements || []);
        } catch (error) {
          console.error('Erreur lors du chargement des événements:', error);
          setEvents([]);
        }
      } else {
        console.log('Établissement actif non défini');
        setEvents([]);
      }
      
      // Charger les statistiques de présence
      if (user.id) {
        try {
          const attendanceResponse = await api.get(`/absences/stats/eleve/${user.id}`);
          setAttendanceStats(attendanceResponse.data.data.stats);
        } catch (error) {
          console.error('Erreur lors du chargement des statistiques de présence:', error);
          setAttendanceStats(null);
        }
      } else {
        console.log('ID utilisateur non défini');
        setAttendanceStats(null);
      }
      
      // Charger les évaluations
      try {
        const evaluationsResponse = await api.get(`/cours/evaluations/periodeEnCours`);
        setEvaluations(evaluationsResponse.data.data.evaluations || []);
      } catch (error) {
        console.error('Erreur lors du chargement des évaluations:', error);
        setEvaluations([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
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
  
  // Filtrer les évaluations en fonction de l'onglet actif
  const getFilteredEvaluations = () => {
    if (activeTab === 'devoirs') {
      return evaluations.filter(evaluation => 
        evaluation.sousType === 'devoir_surveille' || evaluation.type === 'devoir'
      );
    } else {
      return evaluations.filter(evaluation => 
        evaluation.sousType === 'examen' || evaluation.type === 'evaluation'
      );
    }
  };
  
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentSlide(viewableItems[0].index);
    }
  }).current;
  
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('home.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{t('home.greeting')}</Text>
          <Text style={styles.userName}>{user?.prenom || 'Utilisateur'}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('notification')}>
            <Ionicons name="notifications" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('profile')}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>
                {user?.prenom ? user.prenom.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('establishment_details')}>
            <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>{t('home.quickActions.establishment')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('administration')}>
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>{t('home.quickActions.administration')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Carousel */}
        {events.length > 0 && (
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={events}
              renderItem={({ item }) => <CarouselCard item={item} />}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={width - 40}
              decelerationRate="fast"
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              contentContainerStyle={styles.carouselContent}
            />
            
            {/* Indicateurs de pagination */}
            <View style={styles.paginationContainer}>
              {events.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentSlide === index && styles.paginationDotActive
                  ]}
                />
              ))}
            </View>
          </View>
        )}
        
        {/* Attendance Stats */}
        {attendanceStats && (
          <View style={styles.attendanceContainer}>
            <View style={styles.attendanceCard}>
              <Text style={styles.attendanceLabel}>{t('home.attendance.presence')}</Text>
              <Text style={styles.attendanceNumber}>{attendanceStats.presence}</Text>
            </View>
            
            <View style={[styles.attendanceCard, styles.absenceCard]}>
              <Text style={styles.attendanceLabel}>{t('home.attendance.absence')}</Text>
              <Text style={styles.attendanceNumber}>{attendanceStats.absence}</Text>
            </View>
          </View>
        )}
        
        {/* Tabs Section */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'devoirs' && styles.activeTab]}
              onPress={() => setActiveTab('devoirs')}
            >
              <Ionicons 
                name="clipboard-outline" 
                size={16} 
                color={activeTab === 'devoirs' ? '#007AFF' : '#666'} 
              />
              <Text style={[
                styles.tabText, 
                activeTab === 'devoirs' && styles.activeTabText
              ]}>
                {t('home.tabs.homework')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'examens' && styles.activeTab]}
              onPress={() => setActiveTab('examens')}
            >
              <Ionicons 
                name="school-outline" 
                size={16} 
                color={activeTab === 'examens' ? '#007AFF' : '#666'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'examens' && styles.activeTabText
              ]}>
                {t('home.tabs.exams')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Assignment Cards */}
        {getFilteredEvaluations().length > 0 ? (
          getFilteredEvaluations().map((item) => (
            <AssignmentCard key={item._id} item={item} t={t} />
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.noDataText}>
              {activeTab === 'devoirs' 
                ? t('home.evaluation.noHomework') 
                : t('home.evaluation.noExams')}
            </Text>
          </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  profileButton: {
    marginLeft: 8,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  // Styles du Carousel
  carouselContainer: {
    marginBottom: 20,
  },
  carouselContent: {
    paddingLeft: 0,
  },
  carouselCard: {
    width: width - 40,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 15,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: 'white',
    fontSize: 14,
    marginTop: 2,
  },
  cardDate: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 20,
  },
  attendanceContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  attendanceCard: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 12,
    marginRight: 10,
  },
  absenceCard: {
    backgroundColor: '#F44336',
    marginRight: 0,
    marginLeft: 10,
  },
  attendanceLabel: {
    color: 'white',
    fontSize: 12,
    marginBottom: 8,
  },
  attendanceNumber: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
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
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  assignmentCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  assignmentSubject: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  assignmentTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  assignmentLocation: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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
});