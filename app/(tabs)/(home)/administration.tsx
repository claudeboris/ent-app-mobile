import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import api from '../../../services/api';

export default function AdministrationScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données de l'administration
  const loadAdministrationData = async () => {
    if (!user || !user.etablissementActif) return;
    
    try {
      setIsLoading(true);
      const response = await api.get(`/admin-etablissement/etablissement/${user.etablissementActif}`);
      const filteredMembers = response.data.data.membres.filter(
        (membre) => membre.role !== "enseignant"
      );

      setStaffMembers(filteredMembers);
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'administration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdministrationData();
  }, [user]);

  // Rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdministrationData();
    setRefreshing(false);
  };

  // Appeler un membre du personnel
  const handleCall = (telephone) => {
    if (telephone) {
      Linking.openURL(`tel:${telephone}`);
    }
  };

  // Envoyer un email à un membre du personnel
  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('administration.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" onPress={() => router.push('home')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('administration.title')}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {staffMembers.length > 0 ? (
          staffMembers.map((member) => (
            <View key={member.id} style={styles.staffItem}>
              <Image
                source={{ 
                  uri: member.photo && member.photo !== 'default-avatar.png' 
                    ? member.photo 
                    : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face'
                }}
                style={styles.staffImage}
              />
              <View style={styles.staffInfo}>
                <Text style={styles.staffName}>{member.nomComplet}</Text>
                <Text style={styles.staffRole}>
                  {member.informationsSpecifiques.poste || member.role}
                  {member.informationsSpecifiques.departement && ` - ${member.informationsSpecifiques.departement}`}
                </Text>
                {member.informationsSpecifiques.specialite && (
                  <Text style={styles.staffSpecialty}>{t('administration.staffSpecialty')}: {member.informationsSpecifiques.specialite}</Text>
                )}
                {member.informationsSpecifiques.grade && (
                  <Text style={styles.staffGrade}>{t('administration.staffGrade')}: {member.informationsSpecifiques.grade}</Text>
                )}
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.callButton]}
                  onPress={() => handleCall(member.telephone)}
                  disabled={!member.telephone}
                >
                  <Ionicons name="call" size={16} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.emailButton]}
                  onPress={() => handleEmail(member.email)}
                  disabled={!member.email}
                >
                  <Ionicons name="mail-outline" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.noDataText}>{t('administration.noData')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginTop: 25
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  staffImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  staffRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  staffSpecialty: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 2,
  },
  staffGrade: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  callButton: {
    backgroundColor: '#007AFF',
  },
  emailButton: {
    backgroundColor: '#f0f0f0',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});