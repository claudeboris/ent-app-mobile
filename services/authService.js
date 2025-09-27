import api from './api';
import StorageService from './storageService';
import TokenService from './tokenService';

export const login = async (credentials, profileType) => {
  try {
    const endpoint = profileType === 'parent' ? '/parent/login' : '/eleve/login';
    console.log('🔗 Tentative de connexion:', { endpoint, credentials, profileType });
    const response = await api.post(endpoint, credentials);
    console.log('✅ Réponse serveur:', response.data)
    
    if (response.data?.status === 'succès') {
      const { token, expiresIn, data } = response.data;
      
      try {
        // Stocker le token et sa date d'expiration
        const tokenStored = await TokenService.storeToken(token, expiresIn);
        console.log('Token stocké:', tokenStored);

        console.log('data', data)
        
        // Stocker les données utilisateur et le type de profil
        console.log('Tentative de stockage des données utilisateur...');
        await StorageService.setItem('user', JSON.stringify(data));
        console.log('Données utilisateur stockées');
        
        await StorageService.setItem('profileType', profileType);
        console.log('Type de profil stocké');
        
        return {
          success: true,
          data: response.data
        };
      } catch (storageError) {
        console.error('Erreur lors du stockage des données:', storageError);
        
        // Si le stockage échoue, on supprime le token pour éviter un état incohérent
        await TokenService.clearToken();
        
        return {
          success: false,
          message: 'Erreur lors du stockage des données: ' + storageError.message
        };
      }
    }
    
    return {
      success: false,
      message: response.data.message || 'Échec de la connexion'
    };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Erreur réseau: ' + error.message
    };
  }
};

export const logout = async () => {
  try {
    // Supprimer le token
    await TokenService.clearToken();
    
    // Supprimer les autres données d'authentification
    await StorageService.multiRemove(['user', 'profileType']);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return false;
  }
};

export const getToken = async () => {
  return await TokenService.getToken();
};

export const getUser = async () => {
  try {
    const user = await StorageService.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
};

export const getProfileType = async () => {
  try {
    return await StorageService.getItem('profileType');
  } catch (error) {
    console.error('Erreur lors de la récupération du type de profil:', error);
    return null;
  }
};

export const checkAuthStatus = async () => {
  try {
    // Vérifier si le token est expiré
    const isExpired = await TokenService.isTokenExpired();
    
    if (isExpired) {
      await logout();
      return { authenticated: false, reason: 'expired' };
    }
    
    // Vérifier si nous avons des données utilisateur
    const user = await getUser();
    const profileType = await getProfileType();
    
    if (!user || !profileType) {
      await logout();
      return { authenticated: false, reason: 'no_data' };
    }
    
    return { 
      authenticated: true, 
      user, 
      profileType,
      token: await getToken()
    };
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return { authenticated: false, reason: 'error' };
  }
};