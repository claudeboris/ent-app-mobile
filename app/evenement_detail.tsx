// app/events/[id].js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import { url } from '@/constants/url';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/evenements/${id}`);
      if (response.data.status === 'succès') {
        setEvent(response.data.data.evenement);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails de l\'événement:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEventDetails();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('eventDetails.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#F44336" />
          <Text style={styles.errorText}>{t('eventDetails.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('eventDetails.title')}</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Event Image */}
        {event.image ? (
          <Image 
            source={{ uri: `${url}/uploads/evenements/${event.image}` }} 
            style={styles.eventImage} 
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="calendar-outline" size={60} color="#ccc" />
          </View>
        )}
        
        {/* Event Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.eventTitle}>{event.titre}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>
          
          {/* Date and Time */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <Text style={styles.infoText}>{formatDate(event.dateDebut)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                {formatTime(event.dateDebut)} - {formatTime(event.dateFin)}
              </Text>
            </View>
            
            {event.lieu && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color="#007AFF" />
                <Text style={styles.infoText}>{event.lieu}</Text>
              </View>
            )}
            
            <View style={styles.infoItem}>
              <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.infoText}>{t('eventDetails.type')}: {event.type}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.infoText}>{t('eventDetails.status')}: {event.statut}</Text>
            </View>
          </View>
          
          {/* Additional Information */}
          {event.estRecurrent && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('eventDetails.recurrence')}</Text>
              <Text style={styles.sectionContent}>
                {t('eventDetails.everyXDays', { days: event.recurrence.intervalle })}
              </Text>
            </View>
          )}
          
          {event.ressources && event.ressources.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('eventDetails.resources')}</Text>
              {event.ressources.map((ressource, index) => (
                <View key={index} style={styles.resourceItem}>
                  <Ionicons name="document-outline" size={16} color="#666" />
                  <Text style={styles.resourceText}>{ressource}</Text>
                </View>
              ))}
            </View>
          )}
          
          {event.rappels && event.rappels.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('eventDetails.reminders')}</Text>
              {event.rappels.map((rappel, index) => (
                <View key={index} style={styles.reminderItem}>
                  <Ionicons name="notifications-outline" size={16} color="#666" />
                  <Text style={styles.reminderText}>
                    {rappel.type === 'email' ? t('eventDetails.email') : t('eventDetails.notification')} - {t('eventDetails.minutesBefore', { minutes: rappel.delai })}
                  </Text>
                </View>
              ))}
            </View>
          )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginTop: 10,
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
  content: {
    flex: 1,
  },
  eventImage: {
    width: '100%',
    height: 250,
  },
  placeholderImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  eventDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: '#666',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
});