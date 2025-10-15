import axios from 'axios';
import { router } from 'expo-router';
import TokenService from './tokenService';
import StorageService from './storageService';

const API_BASE_URL = 'https://ent-back.maraboot.tech/api'// 'https://xfnqqm6f-3000.uks1.devtunnels.ms/api' //'https://ent-back.maraboot.tech/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(async (config) => {
  const token = await TokenService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les tokens expirés
api.interceptors.response.use(
  (response) => {
    // Log la réponse pour le débogage
    console.log('Réponse API reçue:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.log('Erreur API:', error);
    if (error.response) {
      console.log('Détails erreur:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    const originalRequest = error.config;
    
    // Si l'erreur est 401 (Unauthorized) et que ce n'est pas une tentative de rafraîchissement
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Vérifier si le token est expiré
      const isExpired = await TokenService.isTokenExpired();
      if (isExpired) {
        // Token expiré, déconnecter l'utilisateur et rediriger
        await TokenService.clearToken();
        // Supprimer aussi les autres données d'authentification
        try {
          await StorageService.multiRemove(['user', 'profileType']);
        } catch (e) {
          console.error('Erreur lors de la suppression des données utilisateur:', e);
        }
        router.replace('typeProfile');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;