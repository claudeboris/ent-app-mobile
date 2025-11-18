import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import messaging from '@react-native-firebase/messaging';
import api from './api';

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Demander les permissions et obtenir le token
   */
  async registerForPushNotifications() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission de notification refusée');
        return null;
      }

      try {
        console.log('Constants.expoConfig?.extra?.eas?.projectId', Constants.expoConfig?.extra?.eas?.projectId)
        // Obtenir le token Expo Push
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId
        })).data; 
        
        //token = await messaging().getToken();

        console.log('Token Expo Push:', token);

        // Enregistrer le token sur le serveur
        await this.registerToken(token);

        // Sauvegarder localement
        await AsyncStorage.setItem('expoPushToken', token);
      } catch (error) {
        console.error('Erreur obtention token:', error);
      }
    } else {
      console.log('Simulateur - les notifications push ne fonctionnent pas');
    }

    // Configuration Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'notification-sound.wav',
      });
    }

    return token;
  }

  /**
   * Enregistrer le token sur le serveur
   */
  async registerToken(token) {
    try {
      console.log('token serveur', token)
      await api.put('/notifications/register-token', {
        fcmToken: token,
        platform: Platform.OS
      });
      console.log('token serveur token !!', {
        fcmToken: token,
        platform: Platform.OS
      })
      
      console.log('Token enregistré sur le serveur');
    } catch (error) {
      console.error('Erreur enregistrement token:', error);
    }
  }

  /**
   * Écouter les notifications reçues
   */
  addNotificationReceivedListener(callback) {
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue:', notification);
      callback(notification);
    });
  }

  /**
   * Écouter les interactions avec les notifications
   */
  addNotificationResponseReceivedListener(callback) {
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Interaction avec notification:', response);
      callback(response);
    });
  }

  /**
   * Nettoyer les listeners
   */
  removeNotificationListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Afficher une notification locale
   */
  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger || null, // null = afficher immédiatement
    });
  }

  /**
   * Définir le badge count
   */
  async setBadgeCount(count) {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Obtenir toutes les notifications programmées
   */
  async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Annuler toutes les notifications
   */
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Récupérer les notifications de l'utilisateur
   */
  async getNotifications(page = 1, limit = 20) {
    try {
      const response = await api.get('/notifications', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      throw error;
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      throw error;
    }
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Erreur comptage notifications:', error);
      throw error;
    }
  }
}

export default new NotificationService();