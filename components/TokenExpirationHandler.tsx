import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import TokenService from '../services/tokenService';
import { logout } from '../services/authService';

const TokenExpirationHandler = () => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [warningShown, setWarningShown] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        console.log('okjjjjj')
        // Vérifier si le token est expiré
        const isExpired = await TokenService.isTokenExpired();
        
        if (isExpired) {
          // Déconnecter l'utilisateur
          await logout();
          router.replace('typeProfile');
          return;
        }
        
        // Obtenir le temps restant avant expiration
        const remaining = await TokenService.getTimeRemaining();
        setTimeRemaining(remaining);
        
        // Afficher un avertissement 5 minutes avant expiration
        if (remaining <= 300 && remaining > 0 && !warningShown) {
          setWarningShown(true);
          Alert.alert(
            'Session expirée bientôt',
            'Votre session va expirer dans moins de 5 minutes. Veuillez vous reconnecter.',
            [
              { text: 'OK', style: 'default' },
              { 
                text: 'Se reconnecter maintenant', 
                onPress: async () => {
                  await logout();
                  router.replace('typeProfile');
                }
              }
            ]
          );
        }
        
        // Réinitialiser l'avertissement si le temps restant augmente (nouvelle connexion)
        if (remaining > 300 && warningShown) {
          setWarningShown(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
      }
    };

    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkToken, 30000);
    
    // Vérifier immédiatement au chargement
    checkToken();
    
    return () => clearInterval(interval);
  }, [warningShown]);

  return null; // Ce composant ne rend rien
};

export default TokenExpirationHandler;