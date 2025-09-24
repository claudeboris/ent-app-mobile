import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function GuideScolaireScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" onPress={() => router.push('home')}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guide scolaire</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.documentContainer}>
          <Text style={styles.documentTitle}>LA NOTE DE SYNTHÈSE</Text>
          
          <Text style={styles.paragraph}>
            C'est un exercice technique. Il correspond en effet à l'un des exercices que les cadres de l'administration rencontrent souvent. Il vise en particulier les capacités de synthèse et d'expression écrite assortie thématique d'un dossier composé de différentes pièces en vue d'une utilisation ultérieure.
          </Text>
          
          <Text style={styles.paragraph}>
            Il s'agit par cet exercice type de note de synthèse dans des procédures d'intervention, moyens permettent d'éexercer ainsi la capacité du candidat à mener une analyse synthétique d'un dossier.
          </Text>
          
          <Text style={styles.paragraph}>
            Les administrations réalisent des dossiers multiples et "grandeurs" leur documentation. Pour prendre des décisions, elles exigent quelquefois du responsable administratif en cause de rédiger certaines réactions de fond, de cohérence d'une note de synthèse comme dans le cadre des règles idées principales: l'épreuve vise donc à pas que chaque note synthèse, rédiger des réactions analytiques d'un dossier. Toute explication des critères conforté la hiérarchisation des idées, la capacité de synthèse, l'expression écrite compte tenu du commandement de rédigée à éliminer tout ce qui est accessoire où indendant. À cette fin, la sélection des éléments, compte la hiérarchisation des idées, l'orthographe et la grammaire.
          </Text>
          
          <Text style={styles.sectionTitle}>
            DÉFINITION DE LA NOTE DE SYNTHÈSE ET PROPOSITION MÉTHODOLOGIQUES
          </Text>
          
          <Text style={styles.subSection}>1 - Essai de définition</Text>
          
          <Text style={styles.paragraph}>
            La note de synthèse correspond à une réalité professionnelle. Le chef de service, le directeur, le responsable disposé de plusieurs documents, qui, à l'égide de faits d'informations, d'articles de presse, d'extraits d'ouvrages ou de rapports, de textes juridiques... Il lui est demandé d'en extraire la substance, de résumer les faits ou de permettre de faire des conclusions pour que l'autorité chargée des documents de tous types utiles ne connaisse presque des documents de tous types utiles. de.
          </Text>
          
          <Text style={styles.subSection}>
            Il répond à une question précise.
            Dans ce point d'une représentation.
          </Text>
          
          <Text style={styles.paragraph}>
            Il s'agit de présenter, sous un document écrit et lisible et de dossier, faire le point d'une politique publique
          </Text>
          
          <Text style={styles.paragraph}>
            Disposer d'informations sur un sujet donné pour prendre une décision.
          </Text>
          
          <Text style={styles.paragraph}>
            Dans tous ces cas, il s'agit de proposer une information fiable, objective, rapidement utilisable, sur un sujet et pour problème, qui soit dil un trait dans un seul document permettant un seul regard à l'information et une compréhension est même.
          </Text>
          
          <Text style={styles.subSection}>
            Il convient poser, le rédacteur de la note doit d'avantage
          </Text>
          
          <Text style={styles.paragraph}>
            1 - ne pas se laisser impressionner par un dossier volumineux, ce qui implique d'analyser méthodiquement, un examen attentif, de recherche et de liaison temps.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  shareButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  documentContainer: {
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 16,
    color: '#333',
    marginBottom: 12,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  subSection: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
});