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
import { useNotifications } from '../contexts/NotificationContext'; // ⬅️ AJOUTER
import { formatDistanceToNow } from 'date-fns'; // ⬅️ INSTALLER: npm install date-fns
import { fr } from 'date-fns/locale';

export default function NotificationsScreen() {
  const { user, showErrorToast, showSuccessToast } = useAuth();
  const { t } = useLanguage();
  const { 
    refreshUnreadCount, // ⬅️ Pour mettre à jour le compteur
    loadNotifications: reloadNotifications // ⬅️ Pour recharger les notifs
  } = useNotifications();
  
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
      
      // Mettre à jour l'état local
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      // ⬇️ METTRE À JOUR LE COMPTEUR GLOBAL
      await refreshUnreadCount();
      
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
      
      // ⬇️ METTRE À JOUR LE COMPTEUR GLOBAL
      await refreshUnreadCount();
      
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
        router.push({
          pathname: '/notification_detail',
          params: { 
            notification: JSON.stringify(response.data.data) 
          }
        });
        
        // Marquer comme lue après avoir consulté
        markAsRead(notificationId);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      showErrorToast('Erreur', 'Impossible de charger les détails de la notification');
    }
  };

  // Gérer le rafraîchissement
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    await reloadNotifications(); // ⬅️ Recharger aussi le contexte
  };

  // Charger les notifications au démarrage
  useEffect(() => {
    fetchNotifications();
  }, []);

  // ⬇️ NOUVELLE FONCTION: Formater la date relative
  const formatRelativeDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: fr,
      });
    } catch (error) {
      return formatDate(dateString);
    }
  };

  // Formater la date (fonction existante - garder en fallback)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'systeme':
        return { icon: 'notifications-outline', color: '#3B82F6' };
      case 'paiement':
        return { icon: 'cash-outline', color: '#10B981' };
      case 'examen':
        return { icon: 'school-outline', color: '#8B5CF6' };
      case 'resultat':
        return { icon: 'trophy-outline', color: '#F59E0B' };
      case 'absence':
        return { icon: 'calendar-outline', color: '#EF4444' };
      case 'message':
        return { icon: 'chatbubble-outline', color: '#EC4899' };
      default:
        return { icon: 'information-circle-outline', color: '#6B7280' };
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

  const renderNotifications = () => {
    const notifIcon = getNotificationIcon(notifications[0]?.type);
    
    return (
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
            <Text style={styles.notificationCount}>
              {notifications.length} notification{notifications.length > 1 ? 's' : ''}
            </Text>
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Ionicons name="checkmark-done-outline" size={18} color="#007AFF" />
              <Text style={styles.markAllButtonText}>{t('notifications.markAllAsRead')}</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {notifications.map((notification) => {
          const iconData = getNotificationIcon(notification.type);
          
          return (
            <TouchableOpacity 
              key={notification._id} 
              style={styles.notificationItem}
              onPress={() => viewNotificationDetails(notification._id)}
              activeOpacity={0.7}
            >
              {/* Icône avec couleur dynamique */}
              <View style={[styles.notificationIconContainer, { backgroundColor: iconData.color + '20' }]}>
                <Ionicons name={iconData.icon} size={24} color={iconData.color} />
              </View>
              
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle} numberOfLines={2}>
                    {notification.titre}
                  </Text>
                  {/* Point non lu */}
                  <View style={styles.unreadDot} />
                </View>
                
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                
                {/* Date relative */}
                <Text style={styles.notificationTime}>
                  {formatRelativeDate(notification.dateEnvoi)}
                </Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.readButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      markAsRead(notification._id);
                    }}
                  >
                    <Ionicons name="checkmark-outline" size={16} color="#666" />
                    <Text style={styles.readButtonText}>{t('notifications.markAsRead')}</Text>
                  </TouchableOpacity>
                  
                  {notification.type === 'paiement' && (
                    <TouchableOpacity 
                      style={styles.payButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push('/payment');
                      }}
                    >
                      <Ionicons name="card-outline" size={16} color="white" />
                      <Text style={styles.payButtonText}>{t('notifications.pay')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('home')}>
            <Ionicons name="chevron-back" size={24} color="#333" />
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('home')}>
          <Ionicons name="chevron-back" size={24} color="#333" />
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

// ⬇️ STYLES AMÉLIORÉS
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
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
  notificationsList: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  actionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  markAllButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    marginTop: 7,
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
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 4,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  readButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  payButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
});