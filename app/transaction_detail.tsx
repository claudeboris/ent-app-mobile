import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const TransactionDetailsScreen = () => {
  const { transaction } = useLocalSearchParams();
  let transactionData = {};
  
  try {
    transactionData = transaction ? JSON.parse(transaction) : {};
  } catch (e) {
    console.error('Erreur lors du parsing des données de transaction:', e);
  }

  const handleGoBack = () => {
    router.back();
  };

  const handleSignalerProbleme = () => {
    Alert.alert(
      'Signaler un problème',
      'Voulez-vous signaler un problème avec cette transaction ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Signaler', onPress: () => Alert.alert('Problème signalé', 'Votre signalement a été envoyé.') }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la transaction</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Montant principal */}
        <View style={styles.montantContainer}>
          <Text style={styles.montantPrincipal}>
            {transactionData.montant ? transactionData.montant.toLocaleString() : '0'} {transactionData.devise || 'F'}
          </Text>
          <Text style={styles.montantStatus}>
            {transactionData.statut === 'complet' ? 'Paiement effectué' : 
             transactionData.statut === 'partiel' ? 'Paiement partiel' : 
             transactionData.statut || 'En attente'}
          </Text>
        </View>
        
        {/* Détails de la transaction */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>DÉTAILS DE LA TRANSACTION</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>RÉFÉRENCE</Text>
            <Text style={styles.detailValue}>{transactionData.referencePaiement || 'N/A'}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>DATE ET HEURE</Text>
            <Text style={styles.detailValue}>
              {transactionData.datePaiement ? formatDate(transactionData.datePaiement) : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>MÉTHODE DE PAIEMENT</Text>
            <Text style={styles.detailValue}>
              {transactionData.methode === 'espece' ? 'Espèces' : 
               transactionData.methode === 'virement' ? 'Virement bancaire' : 
               transactionData.methode === 'mobile' ? 'Mobile Money' : 
               transactionData.methode || 'Non spécifiée'}
            </Text>
          </View>
          
          <View style={styles.separator} />
          
          {transactionData.estPaiementGlobal && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>TYPE DE PAIEMENT</Text>
                <Text style={styles.detailValue}>Paiement global</Text>
              </View>
              
              <View style={styles.separator} />
            </>
          )}
          
          {transactionData.trancheNom && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>TRANCHE</Text>
                <Text style={styles.detailValue}>{transactionData.trancheNom}</Text>
              </View>
              
              <View style={styles.separator} />
            </>
          )}
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>MONTANT PAYÉ</Text>
            <Text style={styles.detailValue}>
              {transactionData.montant ? transactionData.montant.toLocaleString() : '0'} {transactionData.devise || 'F'}
            </Text>
          </View>
          
          {transactionData.frais && (
            <>
              <View style={styles.separator} />
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>FRAIS DE TRANSACTION</Text>
                <Text style={styles.detailValue}>
                  {transactionData.frais.toLocaleString()} {transactionData.devise || 'F'}
                </Text>
              </View>
            </>
          )}
          
          {transactionData.details && (
            <>
              <View style={styles.separator} />
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>PAYÉ PAR</Text>
                <Text style={styles.detailValue}>{transactionData.details.nomPayeur || 'N/A'}</Text>
              </View>
              
              <View style={styles.separator} />
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>COMMENTAIRE</Text>
                <Text style={styles.detailValue}>{transactionData.details.commentaire || 'Aucun'}</Text>
              </View>
            </>
          )}
        </View>
        {/* Bouton Télécharger le reçu */}
        <TouchableOpacity style={styles.telechargerButton}>
          <Ionicons name="download-outline" size={20} color="#007AFF" />
          <Text style={styles.telechargerButtonText}>Télécharger le reçu</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 25
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44, // Pour équilibrer avec le bouton back
  },
  content: {
    flex: 1,
  },
  montantContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  montantPrincipal: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  montantStatus: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 5,
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 20,
  },
  detailItem: {
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  signalerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  signalerButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '500',
    marginLeft: 10,
  },
  telechargerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  telechargerButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 10,
  },
});

export default TransactionDetailsScreen;