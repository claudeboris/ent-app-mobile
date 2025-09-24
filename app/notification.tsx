import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: '📱',
      title: 'Nouveau bulletin disponible',
      date: '15/08',
      time: '14:00',
      type: 'info'
    },
    {
      id: 2,
      icon: '🏆',
      title: 'Examen de Math demain à 9h',
      date: '20/08',
      time: '10:30',
      type: 'exam'
    },
    {
      id: 3,
      icon: '😊',
      title: 'Paiement reçu avec succès',
      date: '14/08',
      time: '18:00',
      type: 'payment'
    },
    {
      id: 4,
      icon: '🏦',
      title: 'Vous devez faire un versement avant le 18/08',
      date: '14/08',
      time: '16:00',
      type: 'payment-reminder',
      hasActions: true
    }
  ]);

  const [hasNotifications, setHasNotifications] = useState(true);

  const handlePay = (notificationId: any) => {
    console.log(`Paying for notification ${notificationId}`);
  };

  const handleRemindLater = (notificationId: any) => {
    console.log(`Remind later for notification ${notificationId}`);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="tv-outline" size={60} color="#007AFF" />
      </View>
      <Text style={styles.emptyTitle}>Aucune notification</Text>
      <Text style={styles.emptySubtitle}>
        Vous avez déjà tout lu concernant les notifications.
      </Text>
    </View>
  );

  const renderNotifications = () => (
    <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
      {notifications.map((notification) => (
        <View key={notification.id} style={styles.notificationItem}>
          <View style={styles.notificationIcon}>
            <Text style={styles.emoji}>{notification.icon}</Text>
          </View>
          
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationTime}>
              {notification.date}, {notification.time}
            </Text>
            
            {notification.hasActions && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.payButton}
                  onPress={() => handlePay(notification.id)}
                >
                  <Text style={styles.payButtonText}>Payer</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.remindButton}
                  onPress={() => handleRemindLater(notification.id)}
                >
                  <Text style={styles.remindButtonText}>Me rappeler</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" onPress={() => router.push('home')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
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
  },
  // Notifications List Styles
  notificationsList: {
    flex: 1,
    backgroundColor: 'white',
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
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    lineHeight: 22,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  payButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  remindButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  remindButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});