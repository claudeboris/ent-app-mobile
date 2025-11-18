// contexts/NotificationContext.tsx - VERSION SIMPLIFIÉE
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import notificationService from '../services/notificationService';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';
import * as Device from 'expo-device';           // ← nouveau
import * as Application from 'expo-application';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const appState = useRef(AppState.currentState);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      initializeNotifications();
      
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      
      return () => {
        subscription.remove();
        notificationService.removeNotificationListeners();
      };
    }
  }, [isAuthenticated, user]);

  const initializeNotifications = async () => {
   if (!Device.isDevice || !Application.nativeApplicationVersion) {
      console.log('Notifications désactivées en Expo Go / simulateur');
      return;
    }
    try {
      // 1. Demander les permissions et obtenir le token
      await notificationService.registerForPushNotifications();
      
      // 2. Charger le compteur de notifications non lues
      await loadUnreadCount();
      
      // 3. Écouter les nouvelles notifications
      setupNotificationListeners();
      
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
    }
  };

  const handleAppStateChange = (nextAppState: string) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      loadUnreadCount();
    }
    appState.current = nextAppState;
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      await notificationService.setBadgeCount(count);
    } catch (error) {
      console.error('Erreur chargement compteur:', error);
    }
  };

  const setupNotificationListeners = () => {
    // Notification reçue pendant que l'app est ouverte
    notificationService.addNotificationReceivedListener((notification) => {
      console.log('📩 Nouvelle notification reçue:', notification);
      
      // Incrémenter le compteur
      setUnreadCount(prev => prev + 1);
      
      // Afficher une notification locale si l'app est au premier plan
      notificationService.scheduleLocalNotification(
        notification.request.content.title,
        notification.request.content.body,
        notification.request.content.data
      );
    });

    // Interaction avec une notification (quand l'utilisateur clique)
    notificationService.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification cliquée:', response);
      // La navigation est déjà gérée dans votre écran existant
    });
  };

  const value = {
    unreadCount,
    refreshUnreadCount: loadUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};