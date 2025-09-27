import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';

const { width } = Dimensions.get('window');

const EmploiDuTempsScreen = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [activeTab, setActiveTab] = useState('cours');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const calendarRef = useRef(null);
  
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  // Charger les événements
  const loadEvents = async () => {
    if (!user || !user.etablissementActif) return;
    
    try {
      setIsLoading(true);
      const response = await api.get('/cours/evenements/periodeEnCours');
      setEvents(response.data.data.evenements);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadEvents();
  }, [user]);
  
  // Rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  // Fonction pour capturer et sauvegarder l'emploi du temps
  const handleShare = async () => {
    try {
      Alert.alert(
        'Partager l\'emploi du temps',
        'Que souhaitez-vous faire ?',
        [
          {
            text: 'Annuler',
            style: 'cancel'
          },
          {
            text: 'Sauvegarder dans la galerie',
            onPress: async () => {
              await saveToGallery();
            }
          },
          {
            text: 'Partager l\'image',
            onPress: async () => {
              await shareImage();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      Alert.alert('Erreur', 'Impossible de partager l\'emploi du temps');
    }
  };

  // Sauvegarder l'image dans la galerie
  const saveToGallery = async () => {
    try {
      // Demander les permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'L\'application a besoin de l\'autorisation pour accéder à votre galerie.');
        return;
      }

      // Capturer l'écran du calendrier
      const uri = await captureRef(calendarRef, {
        format: 'jpg',
        quality: 0.8,
      });

      // Sauvegarder dans la galerie
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('ENT App', asset, false);
      
      Alert.alert('Succès', 'L\'emploi du temps a été sauvegardé dans votre galerie !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'emploi du temps');
    }
  };

  // Partager l'image
  const shareImage = async () => {
    try {
      // Capturer l'écran du calendrier
      const uri = await captureRef(calendarRef, {
        format: 'jpg',
        quality: 0.8,
      });

      const currentMonth = months[currentDate.getMonth()];
      const currentYear = currentDate.getFullYear();
      
      await Share.share({
        url: uri,
        message: `Mon emploi du temps pour ${currentMonth} ${currentYear}`,
        title: 'Emploi du temps',
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      Alert.alert('Erreur', 'Impossible de partager l\'emploi du temps');
    }
  };

  // Fonction pour la recherche (simple)
  const handleSearch = () => {
    Alert.alert(
      'Recherche',
      'Fonctionnalité de recherche à venir.\nVous pourrez bientôt rechercher des cours, enseignants ou salles.',
      [{ text: 'OK' }]
    );
  };

  // Fonction pour les notifications
  const handleNotifications = () => {
    router.push('notification');
  };
  
  // Déterminer le type d'événement prédominant pour un jour donné
  const getEventTypeForDate = (day) => {
    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getFullYear() === currentDate.getFullYear();
    });
    
    // Priorité: examen > devoir > cours
    if (dayEvents.some(event => event.type === 'evaluation' && event.sousType === 'examen')) {
      return 'examen';
    } else if (dayEvents.some(event => event.type === 'evaluation' && event.sousType === 'devoir_surveille')) {
      return 'devoir';
    } else if (dayEvents.some(event => event.type === 'cours')) {
      return 'cours';
    }
    
    return null;
  };
  
  // Générer le calendrier pour le mois en cours
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
    const calendar = [];
    
    // Jours du mois précédent
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 2; i >= 0; i--) {
      calendar.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        eventType: null,
      });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const eventType = getEventTypeForDate(day);
      calendar.push({
        day,
        isCurrentMonth: true,
        eventType,
      });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - calendar.length;
    for (let day = 1; day <= remainingDays; day++) {
      calendar.push({
        day,
        isCurrentMonth: false,
        eventType: null,
      });
    }
    
    return calendar;
  };
  
  // Obtenir les événements pour la date sélectionnée
  const getEventsForSelectedDate = () => {
    const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
    
    // Filtrer les événements en fonction de l'onglet actif
    let filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === selectedDate && 
             eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getFullYear() === currentDate.getFullYear();
    });
    
    // Filtrer par type selon l'onglet actif
    if (activeTab === 'cours') {
      return filteredEvents.filter(event => event.type === 'cours');
    } else if (activeTab === 'devoirs') {
      return filteredEvents.filter(event => 
        event.type === 'evaluation' && event.sousType === 'devoir_surveille'
      );
    } else if (activeTab === 'examens') {
      return filteredEvents.filter(event => 
        event.type === 'evaluation' && event.sousType === 'examen'
      );
    }
    
    return filteredEvents;
  };
  
  // Navigation entre les mois
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };
  
  // Formater la date pour l'affichage
  const formatDateForDisplay = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Demain";
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
  };
  
  // Obtenir la couleur en fonction du type d'événement
  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'examen':
        return '#F44336'; // Rouge
      case 'devoir':
        return '#4CAF50'; // Vert
      case 'cours':
        return '#3498db'; // Bleu
      default:
        return '#007AFF'; // Bleu par défaut
    }
  };
  
  const calendar = generateCalendar();
  const currentEvents = getEventsForSelectedDate();
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement de l'emploi du temps...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emploi du temps</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSearch}>
            <Ionicons name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleNotifications}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        ref={calendarRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Navigation du calendrier */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth(-1)}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth(1)}>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* Jours de la semaine */}
        <View style={styles.daysOfWeekContainer}>
          {daysOfWeek.map((day, index) => (
            <Text key={index} style={styles.dayOfWeek}>
              {day}
            </Text>
          ))}
        </View>
        
        {/* Calendrier */}
        <View style={styles.calendarGrid}>
          {calendar.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                !date.isCurrentMonth && styles.inactiveDay,
                selectedDate === date.day && date.isCurrentMonth && styles.selectedDay,
              ]}
              onPress={() => date.isCurrentMonth && setSelectedDate(date.day)}
            >
              <Text
                style={[
                  styles.calendarDayText,
                  !date.isCurrentMonth && styles.inactiveDayText,
                  selectedDate === date.day && date.isCurrentMonth && styles.selectedDayText,
                ]}
              >
                {date.day}
              </Text>
              {date.eventType && date.isCurrentMonth && (
                <View style={[styles.eventDot, { backgroundColor: getEventColor(date.eventType) }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Légende des couleurs */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Légende:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3498db' }]} />
              <Text style={styles.legendText}>Cours</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Devoirs</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>Examens</Text>
            </View>
          </View>
        </View>
        
        {/* Onglets */}
        <View style={styles.tabsContainer}>
          {['cours', 'devoirs', 'examens'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Date sélectionnée */}
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {formatDateForDisplay(new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate))}
          </Text>
        </View>
        
        {/* Liste des événements */}
        <View style={styles.eventsContainer}>
          {currentEvents.length > 0 ? (
            currentEvents.map((event) => (
              <View key={event._id} style={styles.eventCard}>
                <View style={styles.eventTime}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.eventTimeText}>
                    {event.heureDebut} - {event.heureFin}
                  </Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>
                    {event.titre || `${event.matiere.nom} - ${event.type === 'evaluation' ? event.sousType === 'examen' ? 'Examen' : 'Devoir' : 'Cours'}`}
                  </Text>
                  <Text style={styles.eventTeacher}>
                    {event.enseignant.nomComplet}
                  </Text>
                  {event.salle && (
                    <Text style={styles.eventLocation}>
                      {event.salle}{event.batiment ? `, ${event.batiment}` : ''}
                    </Text>
                  )}
                </View>
                <TouchableOpacity style={styles.eventOptions}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.noEventsContainer}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.noEventsText}>
                Aucun {activeTab} pour le {selectedDate} {months[currentDate.getMonth()].toLowerCase()}
              </Text>
            </View>
          )}
        </View>
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  dayOfWeek: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  calendarDay: {
    width: (width - 40) / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  inactiveDay: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  inactiveDayText: {
    color: '#ccc',
  },
  eventDot: {
    position: 'absolute',
    bottom: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  legendItems: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  selectedDateContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  eventsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  eventTimeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  eventTeacher: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#999',
  },
  eventOptions: {
    padding: 5,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default EmploiDuTempsScreen