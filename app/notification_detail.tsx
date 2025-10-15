import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotificationDetailsScreen() {
  const { notification } = useLocalSearchParams();
  const { t } = useLanguage();
  const notificationData = notification ? JSON.parse(notification) : null;

  if (!notificationData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF5252" />
          <Text style={styles.errorText}>{t('notificationDetails.error')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notificationDetails.title')}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{notificationData.titre}</Text>
            <Text style={styles.cardDate}>
              {formatDate(notificationData.dateEnvoi)}
            </Text>
          </View>
          
          <View style={styles.cardBody}>
            <Text style={styles.message}>{notificationData.message}</Text>
            
            {notificationData.donnees && (
              <View style={styles.dataSection}>
                <Text style={styles.dataTitle}>{t('notificationDetails.additionalInfo')}</Text>
                {Object.entries(notificationData.donnees).map(([key, value]) => (
                  <View key={key} style={styles.dataItem}>
                    <Text style={styles.dataKey}>{key}:</Text>
                    <Text style={styles.dataValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.metaSection}>
              <Text style={styles.metaItem}>
                <Text style={styles.metaLabel}>{t('notificationDetails.meta.type')}: </Text>
                <Text style={styles.metaValue}>
                  {t(`notifications.notificationTypes.${notificationData.type}`) || notificationData.type}
                </Text>
              </Text>
              <Text style={styles.metaItem}>
                <Text style={styles.metaLabel}>{t('notificationDetails.meta.priority')}: </Text>
                <Text style={styles.metaValue}>{notificationData.priorite}</Text>
              </Text>
              <Text style={styles.metaItem}>
                <Text style={styles.metaLabel}>{t('notificationDetails.meta.channels')}: </Text>
                <Text style={styles.metaValue}>
                  {notificationData.canaux?.join(', ') || 'Application'}
                </Text>
              </Text>
            </View>
          </View>
        </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FF5252',
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 14,
    color: '#999',
  },
  cardBody: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  dataSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  dataItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dataKey: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    width: 120,
  },
  dataValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  metaSection: {
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 15,
  },
  metaItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});