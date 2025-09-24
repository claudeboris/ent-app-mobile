// contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login, logout, checkAuthStatus } from '../services/authService';
import StorageService from '../services/storageService';

// Import direct de Toast pour les fonctions utilitaires
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadAuthData = async () => {
      setIsLoading(true);
      
      try {
        const authStatus = await checkAuthStatus();
        
        if (authStatus.authenticated) {
          setUser(authStatus.user);
          setProfileType(authStatus.profileType);
          setToken(authStatus.token);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setProfileType(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données d\'authentification', error);
        setUser(null);
        setProfileType(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const handleLogin = async (credentials, type) => {
    const result = await login(credentials, type);
    
    if (result.success) {
      setToken(result.data.token);
      setUser(result.data.data.utilisateur);
      setProfileType(type);
      setIsAuthenticated(true);
      return { success: true };
    }
    
    return { success: false, message: result.message };
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setProfileType(null);
    setIsAuthenticated(false);
    router.push('typeProfile')
    console.log('ok !!!!')
  };

  // Fonction pour mettre à jour les informations de l'utilisateur
  const updateUser = async (userData) => {
    try {
      // Mettre à jour l'état local
      setUser(userData);
      
      // Mettre à jour dans le stockage local
      await StorageService.setItem('user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des informations utilisateur', error);
      return false;
    }
  };

  // Fonctions pour les toasts
  const showSuccessToast = (title, message) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'bottom'
    });
  };

  const showErrorToast = (title, message) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'bottom'
    });
  };

  const showConfirmToast = (title, message, onConfirm, onCancel) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'bottom',
      autoHide: false,
      visibilityTime: 0,
      props: {
        onConfirm,
        onCancel
      }
    });
  };

  const hideToast = () => {
    Toast.hide();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profileType,
        token,
        isLoading,
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
        updateUser,
        showSuccessToast,
        showErrorToast,
        showConfirmToast,
        hideToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);