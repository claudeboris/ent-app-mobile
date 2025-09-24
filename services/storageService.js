import AsyncStorage from '@react-native-async-storage/async-storage';

// Stockage en mémoire comme solution de secours
let memoryStorage = {};

class StorageService {
  static async setItem(key, value) {
    // Vérifier que la valeur n'est pas undefined ou null
    if (value === undefined || value === null) {
      console.warn(`Tentative de stocker une valeur ${value} pour la clé ${key}. Utilisation de removeItem à la place.`);
      return this.removeItem(key);
    }
    
    try {
      // D'abord essayer avec AsyncStorage
      await AsyncStorage.setItem(key, value);
      // Stocker aussi en mémoire comme solution de secours
      memoryStorage[key] = value;
      return true;
    } catch (error) {
      console.error('Erreur avec AsyncStorage, utilisation du stockage en mémoire:', error);
      // Utiliser le stockage en mémoire
      memoryStorage[key] = value;
      return true;
    }
  }

  static async getItem(key) {
    try {
      // D'abord essayer avec AsyncStorage
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return value;
      }
      // Si rien dans AsyncStorage, essayer le stockage en mémoire
      return memoryStorage[key] || null;
    } catch (error) {
      console.error('Erreur avec AsyncStorage, utilisation du stockage en mémoire:', error);
      // Utiliser le stockage en mémoire
      return memoryStorage[key] || null;
    }
  }

  static async removeItem(key) {
    try {
      // D'abord essayer avec AsyncStorage
      await AsyncStorage.removeItem(key);
      // Supprimer aussi du stockage en mémoire
      delete memoryStorage[key];
      return true;
    } catch (error) {
      console.error('Erreur avec AsyncStorage, utilisation du stockage en mémoire:', error);
      // Supprimer du stockage en mémoire
      delete memoryStorage[key];
      return true;
    }
  }

  static async multiRemove(keys) {
    try {
      // D'abord essayer avec AsyncStorage
      await AsyncStorage.multiRemove(keys);
      // Supprimer aussi du stockage en mémoire
      keys.forEach(key => {
        delete memoryStorage[key];
      });
      return true;
    } catch (error) {
      console.error('Erreur avec AsyncStorage, utilisation du stockage en mémoire:', error);
      // Supprimer du stockage en mémoire
      keys.forEach(key => {
        delete memoryStorage[key];
      });
      return true;
    }
  }

  static async clear() {
    try {
      // D'abord essayer avec AsyncStorage
      await AsyncStorage.clear();
      // Vider aussi le stockage en mémoire
      memoryStorage = {};
      return true;
    } catch (error) {
      console.error('Erreur avec AsyncStorage, utilisation du stockage en mémoire:', error);
      // Vider le stockage en mémoire
      memoryStorage = {};
      return true;
    }
  }
}

export default StorageService;