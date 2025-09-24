import StorageService from './storageService';

class TokenService {
  // Stocker le token et sa date d'expiration
  static async storeToken(token, expiresIn) {
    try {
      console.log('Stockage du token avec expiration:', expiresIn);
      // Calculer la date d'expiration
      const expirationTime = this.calculateExpiration(expiresIn);
      console.log('Date d\'expiration calculée:', new Date(expirationTime).toISOString());
      
      // Stocker le token et sa date d'expiration
      await StorageService.setItem('authToken', token);
      await StorageService.setItem('tokenExpiration', expirationTime.toString());
      
      console.log('Token stocké avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors du stockage du token:', error);
      throw error; // Propager l'erreur pour la gérer dans le service d'authentification
    }
  }

  // Calculer la date d'expiration en millisecondes
  static calculateExpiration(expiresIn) {
    const now = Date.now();
    
    // Gérer différents formats d'expiration (ex: "4h", "2d", "3600s")
    if (typeof expiresIn === 'string') {
      const value = parseInt(expiresIn);
      const unit = expiresIn.slice(-1);
      
      switch (unit) {
        case 'h': // heures
          return now + value * 60 * 60 * 1000;
        case 'd': // jours
          return now + value * 24 * 60 * 60 * 1000;
        case 'm': // minutes
          return now + value * 60 * 1000;
        case 's': // secondes
          return now + value * 1000;
        default:
          // Par défaut, supposer que c'est en secondes
          return now + parseInt(expiresIn) * 1000;
      }
    }
    
    // Si c'est un nombre, supposer que c'est en secondes
    return now + expiresIn * 1000;
  }

  // Vérifier si le token est expiré
  static async isTokenExpired() {
    try {
      const expirationTime = await StorageService.getItem('tokenExpiration');
      
      if (!expirationTime) {
        console.log('Aucune date d\'expiration trouvée');
        return true; // Pas de token = considéré comme expiré
      }
      
      const now = Date.now();
      const expiration = parseInt(expirationTime, 10);
      
      console.log('Vérification expiration - Maintenant:', new Date(now).toISOString(), 'Expiration:', new Date(expiration).toISOString());
      
      // Ajouter une marge de 30 secondes pour éviter les problèmes de décalage
      return now >= expiration - 30000;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return true;
    }
  }

  // Obtenir le token stocké
  static async getToken() {
    try {
      const token = await StorageService.getItem('authToken');
      console.log('Token récupéré:', token ? 'Présent' : 'Absent');
      return token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  // Supprimer le token (déconnexion)
  static async clearToken() {
    try {
      await StorageService.removeItem('authToken');
      await StorageService.removeItem('tokenExpiration');
      console.log('Token supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
      return false;
    }
  }

  // Obtenir le temps restant avant expiration (en secondes)
  static async getTimeRemaining() {
    try {
      const expirationTime = await StorageService.getItem('tokenExpiration');
      
      if (!expirationTime) {
        return 0;
      }
      
      const now = Date.now();
      const expiration = parseInt(expirationTime, 10);
      const remaining = Math.max(0, expiration - now);
      
      return Math.floor(remaining / 1000); // Convertir en secondes
    } catch (error) {
      console.error('Erreur lors du calcul du temps restant:', error);
      return 0;
    }
  }
}

export default TokenService;