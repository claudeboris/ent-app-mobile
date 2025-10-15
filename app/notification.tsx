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
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotificationsScreen() {
  const { user, showErrorToast, showSuccessToast } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  // Charger les notifications non lues
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/etablissements/eleve/notifications/non-lues');
      
      if (response.data.success && response.data.data.length > 0) {
        setNotifications(response.data.data);
        setHasNotifications(true);
      } else {
        setNotifications([]);
        setHasNotifications(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      showErrorToast('Erreur', t('notifications.error'));
      setHasNotifications(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      await api.put('/notifications/marquer-lues', {
        notificationId: notificationId
      });
      
      // Mettre à jour l'état local pour supprimer la notification
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      // Vérifier s'il reste des notifications
      if (notifications.length === 1) {
        setHasNotifications(false);
      }
      
      showSuccessToast('Succès', t('notifications.markAsRead'));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      showErrorToast('Erreur', 'Impossible de marquer la notification comme lue');
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const notificationIds = notifications.map(notification => notification._id);
      
      await api.put('/notifications/marquer-lues', {
        ids: notificationIds
      });
      
      setNotifications([]);
      setHasNotifications(false);
      showSuccessToast('Succès', t('notifications.markAllAsRead'));
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
      showErrorToast('Erreur', 'Impossible de marquer toutes les notifications comme lues');
    }
  };

  // Voir les détails d'une notification
  const viewNotificationDetails = async (notificationId) => {
    try {
      const response = await api.get(`/notifications/${notificationId}`);
      
      if (response.data.success) {
        // Naviguer vers l'écran de détails avec les données de la notification
        router.push({
          pathname: '/notification_detail',
          params: { 
            notification: JSON.stringify(response.data.data) 
          }
        });
        
        // Marquer comme lue après avoir consulté les détails
        markAsRead(notificationId);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      showErrorToast('Erreur', 'Impossible de charger les détails de la notification');
    }
  };

  // Gérer le rafraîchissement
  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Charger les notifications au démarrage
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formater l'heure
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'systeme':
        return '📱';
      case 'paiement':
        return '💳';
      case 'examen':
        return '📝';
      case 'resultat':
        return '🏆';
      case 'absence':
        return '📅';
      case 'message':
        return '💬';
      default:
        return '📢';
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="notifications-off-outline" size={60} color="#007AFF" />
      </View>
      <Text style={styles.emptyTitle}>{t('notifications.emptyTitle')}</Text>
      <Text style={styles.emptySubtitle}>
        {t('notifications.emptySubtitle')}
      </Text>
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={handleRefresh}
      >
        <Ionicons name="refresh-outline" size={20} color="#007AFF" />
        <Text style={styles.refreshButtonText}>{t('notifications.refreshButton')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotifications = () => (
    <ScrollView 
      style={styles.notificationsList}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#007AFF']}
          tintColor="#007AFF"
        />
      }
    >
      {notifications.length > 1 && (
        <View style={styles.actionsHeader}>
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllButtonText}>{t('notifications.markAllAsRead')}</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {notifications.map((notification) => (
        <TouchableOpacity 
          key={notification._id} 
          style={styles.notificationItem}
          onPress={() => viewNotificationDetails(notification._id)}
        >
          <View style={styles.notificationIcon}>
            <Text style={styles.emoji}>
              {getNotificationIcon(notification.type)}
            </Text>
          </View>
          
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{notification.titre}</Text>
            <Text style={styles.notificationMessage}>{notification.message}</Text>
            <Text style={styles.notificationTime}>
              {t('notifications.time', { 
                date: formatDate(notification.dateEnvoi), 
                time: formatTime(notification.dateEnvoi) 
              })}
            </Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.readButton}
                onPress={(e) => {
                  e.stopPropagation(); // Empêcher la propagation vers le parent
                  markAsRead(notification._id);
                }}
              >
                <Text style={styles.readButtonText}>{t('notifications.markAsRead')}</Text>
              </TouchableOpacity>
              
              {notification.type === 'paiement' && (
                <TouchableOpacity 
                  style={styles.payButton}
                  onPress={(e) => {
                    e.stopPropagation(); // Empêcher la propagation vers le parent
                    router.push('/payment');
                  }}
                >
                  <Text style={styles.payButtonText}>{t('notifications.pay')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" onPress={() => router.push('home')} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('notifications.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" onPress={() => router.push('home')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {hasNotifications ? renderNotifications() : renderEmptyState()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginTop: 25
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
  // Loading State
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
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  refreshButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  // Notifications List Styles
  notificationsList: {
    flex: 1,
    backgroundColor: 'white',
  },
  actionsHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  markAllButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  markAllButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  notificationIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  emoji: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 15,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    lineHeight: 22,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 5,
  },
  readButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  readButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  payButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});