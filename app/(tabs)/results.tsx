import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';
import * as Print from 'expo-print';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';

const { width } = Dimensions.get('window');

export default function ResultsScreen() {
  const { user, showErrorToast, showSuccessToast } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'notes' | 'bulletins'>('notes');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [notesData, setNotesData] = useState<any>(null);
  const [bulletinsData, setBulletinsData] = useState<any>(null);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [showDownloadSheet, setShowDownloadSheet] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<any>(null);
  const [downloadYear, setDownloadYear] = useState('');
  const [downloadPeriod, setDownloadPeriod] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Nouveaux états pour les bottom sheets
  const [showYearSheet, setShowYearSheet] = useState(false);
  const [showPeriodSheet, setShowPeriodSheet] = useState(false);
  const [showTeachersSheet, setShowTeachersSheet] = useState(false);
  
  const bulletinRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Charger les données
  const loadNotesData = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/notes/eleve/${user.id}`);
      if (response.data?.data?.notes) {
        const notes = response.data.data.notes;
        setNotesData(notes);
        const years = [...new Set(notes.map((item: any) => item.anneeScolaire.nom))].sort((a, b) => b.localeCompare(a));
        setAvailableYears(years);
        if (years.length > 0 && !selectedYear) setSelectedYear(years[0]);
      } else {
        setNotesData(null);
      }
    } catch (error: any) {
      console.error('Erreur notes:', error);
      showErrorToast(t('common.error'), t('results.notesError'));
      setNotesData(null);
    }
  };

  const loadBulletinsData = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/bulletins/eleve/${user.id}`);
      setBulletinsData(response.data);
    } catch (error: any) {
      console.error('Erreur bulletins:', error);
      showErrorToast(t('common.error'), t('results.bulletinsError'));
      setBulletinsData(null);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadNotesData(), loadBulletinsData()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (notesData && selectedYear) {
      const yearData = notesData.find((item: any) => item.anneeScolaire.nom === selectedYear);
      if (yearData?.periodes) {
        const periods = yearData.periodes.map((p: any) => p.periode.nom);
        setAvailablePeriods(periods);
        if (periods.length > 0 && !selectedPeriod) setSelectedPeriod(periods[0]);
      } else {
        setAvailablePeriods([]);
        setSelectedPeriod('');
      }
    }
  }, [selectedYear, notesData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatPeriodDates = (periode: any) => {
    if (!periode?.dateDebut || !periode?.dateFin) return '';
    const start = new Date(periode.dateDebut);
    const end = new Date(periode.dateFin);
    const startMonth = start.toLocaleString('fr-FR', { month: 'short' });
    const endMonth = end.toLocaleString('fr-FR', { month: 'short' });
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    return startYear === endYear ? `${startMonth} - ${endMonth} ${startYear}` : `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setSelectedPeriod('');
    setShowYearSheet(false);
  };

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    setShowPeriodSheet(false);
  };

  const checkInscription = (yearData: any) => {
    return yearData?.periodes?.some((p: any) => p.notes?.length > 0 && p.notes[0].classe);
  };

  const getCurrentData = () => {
    if (!notesData || !selectedYear || !selectedPeriod) return null;
    const yearData = notesData.find((item: any) => item.anneeScolaire.nom === selectedYear);
    const periodData = yearData?.periodes?.find((p: any) => p.periode.nom === selectedPeriod);
    if (!periodData?.notes) return null;

    const notesByMatiere = periodData.notes.reduce((acc: any, note: any) => {
      const id = note.matiere._id;
      if (!acc[id]) {
        acc[id] = { 
          matiere: note.matiere, 
          ccNotes: [], 
          examNotes: [], 
          enseignant: note.enseignant || null 
        };
      }
      if (note.typeEvaluation === 'devoir') acc[id].ccNotes.push(note);
      else if (note.typeEvaluation === 'examen') acc[id].examNotes.push(note);
      return acc;
    }, {});

    Object.values(notesByMatiere).forEach((m: any) => {
      const { controleContinu = 40, examen = 60 } = m.matiere.systemeNotation || {};
      const ccSum = m.ccNotes.reduce((s: number, n: any) => s + n.valeur * n.coefficient, 0);
      const ccCoeff = m.ccNotes.reduce((s: number, n: any) => s + n.coefficient, 0);
      m.moyCC = ccCoeff > 0 ? ccSum / ccCoeff : 0;

      const examSum = m.examNotes.reduce((s: number, n: any) => s + n.valeur * n.coefficient, 0);
      const examCoeff = m.examNotes.reduce((s: number, n: any) => s + n.coefficient, 0);
      m.moyExam = examCoeff > 0 ? examSum / examCoeff : 0;

      m.moyGenerale = (m.moyCC * (controleContinu / 100)) + (m.moyExam * (examen / 100));
    });

    const moyennes = Object.values(notesByMatiere).map((m: any) => m.moyGenerale).filter((m: number) => m > 0);
    const moyenneGlobale = moyennes.length > 0 ? moyennes.reduce((a: number, b: number) => a + b, 0) / moyennes.length : 0;

    // Calcul des stats avancées
    const notesValides = Object.values(notesByMatiere).filter((m: any) => m.moyGenerale > 0);
    const meilleuresMatieres = notesValides
      .sort((a: any, b: any) => b.moyGenerale - a.moyGenerale)
      .slice(0, 3);
    const matieresAProgresser = notesValides
      .sort((a: any, b: any) => a.moyGenerale - b.moyGenerale)
      .slice(0, 3);

    // Récupérer la liste des enseignants uniques
    const enseignantsUniques = Object.values(notesByMatiere)
      .filter((m: any) => m.enseignant)
      .reduce((acc: any[], m: any) => {
        if (!acc.find((e: any) => e._id === m.enseignant._id)) {
          acc.push(m.enseignant);
        }
        return acc;
      }, []);

    return {
      periode: periodData.periode,
      notesParMatiere: notesByMatiere,
      stats: { 
        moyenne: moyenneGlobale, 
        meilleureNote: Math.max(...moyennes, 0), 
        moinsBonneNote: Math.min(...moyennes, 20),
        totalMatieres: Object.keys(notesByMatiere).length,
        matieresAvecNotes: notesValides.length,
        meilleuresMatieres,
        matieresAProgresser
      },
      enseignants: enseignantsUniques,
    };
  };

  // Générer le PDF du bulletin
  const generateBulletinPDF = async (bulletin: any) => {
    if (bulletin.statut !== 'publie') {
      Alert.alert(t('common.warning'), t('results.bulletinNotPublished'));
      return;
    }

    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #007AFF; }
            .subtitle { font-size: 16px; color: #666; }
            .info { display: flex; justify-content: space-between; margin: 20px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: 600; }
            .moyenne { background-color: #007AFF; color: white; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: '#999'; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${t('results.reportCard')} - ${bulletin.periode.nom}</h1>
            <p class="subtitle">${user?.nomComplet} • ${bulletin.classe.nom}</p>
          </div>
          <div class="info">
            <div><strong>${t('results.schoolYear')}:</strong> ${bulletin.anneeScolaire.nom}</div>
            <div><strong>${t('results.generatedOn')}:</strong> ${new Date().toLocaleDateString('fr-FR')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>${t('results.subject')}</th>
                <th>${t('results.grade')}</th>
                <th>${t('results.classAverage')}</th>
                <th>${t('results.appreciation')}</th>
              </tr>
            </thead>
            <tbody>
              ${bulletin.details.map((d: any) => `
                <tr>
                  <td>${d.matiere.nom}</td>
                  <td><strong>${d.note.toFixed(2)}</strong></td>
                  <td>${d.moyenneClasse.toFixed(2)}</td>
                  <td>${d.appreciation}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 20px; font-size: 16px;">
            <p><strong>${t('results.generalAverage')}:</strong> <span class="moyenne">${bulletin.moyenne.toFixed(2)}/20</span></p>
            <p><strong>${t('results.rank')}:</strong> ${bulletin.rang}/${bulletin.effectifClasse}</p>
            <p><strong>${t('results.decision')}:</strong> ${bulletin.decision}</p>
            <p><strong>${t('results.appreciation')}:</strong> ${bulletin.appreciationGenerale}</p>
          </div>
          <div class="footer">
            Généré par ENT App • ${new Date().toLocaleString('fr-FR')}
          </div>
        </body>
      </html>
    `;

    try {
      setIsGeneratingPDF(true);
      await Print.printAsync({ html });
      showSuccessToast(t('common.success'), t('results.bulletinPrinted'));
    } catch (error) {
      console.error('Erreur PDF:', error);
      showErrorToast(t('common.error'), t('results.pdfGenerationError'));
    } finally {
      setIsGeneratingPDF(false);
      setShowDownloadSheet(false);
    }
  };

  const openDownloadSheet = (bulletin: any) => {
    setSelectedBulletin(bulletin);
    setDownloadYear(bulletin.anneeScolaire.nom);
    setDownloadPeriod(bulletin.periode.nom);
    setShowDownloadSheet(true);
  };

  const confirmDownload = () => {
    if (!selectedBulletin) return;
    generateBulletinPDF(selectedBulletin);
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return '#4CAF50';
    if (grade >= 14) return '#8BC34A';
    if (grade >= 12) return '#FFC107';
    if (grade >= 10) return '#FF9800';
    return '#F44336';
  };

  const getGradeEmoji = (grade: number) => {
    if (grade >= 16) return '🎯';
    if (grade >= 14) return '👍';
    if (grade >= 12) return '😊';
    if (grade >= 10) return '😐';
    return '📉';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('results.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentData = getCurrentData();
  const yearData = notesData?.find((item: any) => item.anneeScolaire.nom === selectedYear);
  const isInscrit = checkInscription(yearData);

  const renderInscriptionRequired = () => (
    <View style={styles.inscriptionRequiredContainer}>
      <Ionicons name="alert-circle-outline" size={48} color="#FF5252" />
      <Text style={styles.inscriptionRequiredTitle}>{t('results.inscriptionRequired')}</Text>
      <Text style={styles.inscriptionRequiredText}>
        {t('results.inscriptionRequiredText')}
      </Text>
      <TouchableOpacity style={styles.inscriptionButton} onPress={() => router.push('contact')}>
        <Text style={styles.inscriptionButtonText}>{t('results.contactAdmin')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderYearSheet = () => (
    <Modal visible={showYearSheet} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{t('results.selectYear')}</Text>
          
          <ScrollView style={styles.sheetScrollView}>
            {availableYears.map((year, index) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.sheetItem,
                  selectedYear === year && styles.sheetItemSelected
                ]}
                onPress={() => handleYearSelect(year)}
              >
                <Text style={[
                  styles.sheetItemText,
                  selectedYear === year && styles.sheetItemTextSelected
                ]}>
                  {year}
                </Text>
                {selectedYear === year && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => setShowYearSheet(false)}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPeriodSheet = () => (
    <Modal visible={showPeriodSheet} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{t('results.selectPeriod')}</Text>
          
          <ScrollView style={styles.sheetScrollView}>
            {availablePeriods.map((period, index) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.sheetItem,
                  selectedPeriod === period && styles.sheetItemSelected
                ]}
                onPress={() => handlePeriodSelect(period)}
              >
                <Text style={[
                  styles.sheetItemText,
                  selectedPeriod === period && styles.sheetItemTextSelected
                ]}>
                  {period}
                </Text>
                {selectedPeriod === period && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => setShowPeriodSheet(false)}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderTeachersSheet = () => (
    <Modal visible={showTeachersSheet} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{t('results.yourTeachers')}</Text>
          
          <ScrollView style={styles.sheetScrollView}>
            {currentData?.enseignants?.length > 0 ? (
              currentData.enseignants.map((enseignant: any, index: number) => (
                <View key={enseignant._id} style={styles.teacherItem}>
                  <View style={styles.teacherAvatar}>
                    <Ionicons name="person-circle-outline" size={40} color="#007AFF" />
                  </View>
                  <View style={styles.teacherInfo}>
                    <Text style={styles.teacherName}>
                      {enseignant.prenom} {enseignant.nom}
                    </Text>
                    <Text style={styles.teacherSubject}>
                      {Object.values(currentData.notesParMatiere)
                        .filter((m: any) => m.enseignant?._id === enseignant._id)
                        .map((m: any) => m.matiere.nom)
                        .join(', ')}
                    </Text>
                    {enseignant.email && (
                      <Text style={styles.teacherEmail}>{enseignant.email}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noTeachersContainer}>
                <Ionicons name="people-outline" size={48} color="#ccc" />
                <Text style={styles.noTeachersText}>{t('results.noTeachersAvailable')}</Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => setShowTeachersSheet(false)}
          >
            <Text style={styles.cancelButtonText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderNotesTab = () => {
    if (!isInscrit) return renderInscriptionRequired();

    return (
      <Animated.ScrollView 
        style={[styles.tabContent, { opacity: fadeAnim }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Sélecteurs améliorés */}
        <View style={styles.selectorContainer}>
          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>{t('results.schoolYear')}</Text>
            <TouchableOpacity 
              style={styles.selectorButton} 
              onPress={() => setShowYearSheet(true)}
            >
              <View style={styles.selectorButtonContent}>
                <Ionicons name="school-outline" size={18} color="#666" />
                <Text style={styles.selectorValue}>
                  {selectedYear || t('results.selectYear')}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>{t('results.period')}</Text>
            <TouchableOpacity 
              style={[
                styles.selectorButton,
                !selectedYear && styles.selectorButtonDisabled
              ]} 
              onPress={() => setShowPeriodSheet(true)}
              disabled={!selectedYear}
            >
              <View style={styles.selectorButtonContent}>
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={[
                  styles.selectorValue,
                  !selectedYear && styles.selectorValueDisabled
                ]}>
                  {selectedPeriod || t('results.selectPeriod')}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {!currentData ? (
          <View style={styles.noDataContainer}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.noDataText}>{t('results.noDataAvailable')}</Text>
            <Text style={styles.noDataSubtext}>
              {t('results.selectYearAndPeriod')}
            </Text>
          </View>
        ) : (
          <>
            {/* En-tête de période */}
            <View style={styles.periodHeader}>
              <View style={styles.periodIcon}>
                <Ionicons name="trophy-outline" size={24} color="#FF6B35" />
              </View>
              <View style={styles.periodInfo}>
                <Text style={styles.periodTitle}>{selectedPeriod}</Text>
                <Text style={styles.periodDate}>
                  {formatPeriodDates(currentData.periode)}
                </Text>
              </View>
              
              {/* Bouton enseignants */}
              {currentData.enseignants && currentData.enseignants.length > 0 && (
                <TouchableOpacity 
                  style={styles.teachersButton}
                  onPress={() => setShowTeachersSheet(true)}
                >
                  <Ionicons name="people-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Statistiques principales */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.mainStatCard]}>
                <View style={styles.statHeader}>
                  <Ionicons name="stats-chart" size={20} color="white" />
                  <Text style={styles.statLabel}>{t('results.generalAverage')}</Text>
                </View>
                <View style={styles.statValueContainer}>
                  <Text style={styles.mainStatValue}>
                    {currentData.stats.moyenne.toFixed(2)}
                  </Text>
                  <Text style={styles.statUnit}>/20</Text>
                </View>
                <View style={styles.statTrend}>
                  <Text style={styles.statTrendText}>
                    {getGradeEmoji(currentData.stats.moyenne)} 
                    {currentData.stats.moyenne >= 10 ? t('results.aboveAverage') : t('results.belowAverage')}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statCard, styles.miniStatCard]}>
                  <Ionicons name="trending-up" size={16} color="#4CAF50" />
                  <Text style={styles.miniStatValue}>
                    {currentData.stats.meilleureNote.toFixed(1)}
                  </Text>
                  <Text style={styles.miniStatLabel}>{t('results.bestNote')}</Text>
                </View>

                <View style={[styles.statCard, styles.miniStatCard]}>
                  <Ionicons name="trending-down" size={16} color="#F44336" />
                  <Text style={styles.miniStatValue}>
                    {currentData.stats.moinsBonneNote.toFixed(1)}
                  </Text>
                  <Text style={styles.miniStatLabel}>{t('results.worstNote')}</Text>
                </View>

                <View style={[styles.statCard, styles.miniStatCard]}>
                  <Ionicons name="library-outline" size={16} color="#2196F3" />
                  <Text style={styles.miniStatValue}>
                    {currentData.stats.matieresAvecNotes}
                  </Text>
                  <Text style={styles.miniStatLabel}>{t('results.subjects')}</Text>
                </View>
              </View>
            </View>

            {/* Enseignants rapide */}
            {currentData.enseignants && currentData.enseignants.length > 0 && (
              <View style={styles.teachersQuickView}>
                <View style={styles.teachersHeader}>
                  <Text style={styles.sectionTitle}>👨‍🏫 {t('results.yourTeachers')}</Text>
                  <TouchableOpacity onPress={() => setShowTeachersSheet(true)}>
                    <Text style={styles.seeAllText}>{t('results.seeAll')}</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.teachersScrollView}
                >
                  {currentData.enseignants.slice(0, 5).map((enseignant: any, index: number) => (
                    <View key={enseignant._id} style={styles.teacherQuickCard}>
                      <View style={styles.teacherQuickAvatar}>
                        <Ionicons name="person-circle-outline" size={32} color="#007AFF" />
                      </View>
                      <Text style={styles.teacherQuickName} numberOfLines={1}>
                        {enseignant.prenom?.charAt(0)}. {enseignant.nom}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Meilleures performances */}
            {currentData.stats.meilleuresMatieres.length > 0 && (
              <View style={styles.highlightsSection}>
                <Text style={styles.sectionTitle}>🎯 {t('results.strongPoints')}</Text>
                <View style={styles.highlightsGrid}>
                  {currentData.stats.meilleuresMatieres.map((matiere: any, index: number) => (
                    <View key={index} style={styles.highlightCard}>
                      <View style={styles.highlightHeader}>
                        <Text style={styles.highlightSubject} numberOfLines={1}>
                          {matiere.matiere.nom}
                        </Text>
                        <View style={[
                          styles.highlightGrade,
                          { backgroundColor: getGradeColor(matiere.moyGenerale) }
                        ]}>
                          <Text style={styles.highlightGradeText}>
                            {matiere.moyGenerale.toFixed(1)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.highlightLabel}>{t('results.excellentPerformance')}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tableau des notes */}
            <View style={styles.gradesSection}>
              <Text style={styles.sectionTitle}>📊 {t('results.subjectDetails')}</Text>
              <View style={styles.gradesTable}>
                {Object.values(currentData.notesParMatiere).map((m: any, i) => (
                  <View key={i} style={styles.subjectCard}>
                    <View style={styles.subjectHeader}>
                      <View style={styles.subjectInfo}>
                        <Text style={styles.subjectName}>{m.matiere.nom}</Text>
                        {m.enseignant && (
                          <Text style={styles.teacherNameSmall}>
                            {m.enseignant.prenom} {m.enseignant.nom}
                          </Text>
                        )}
                      </View>
                      <View style={[
                        styles.subjectMoyenne,
                        { backgroundColor: getGradeColor(m.moyGenerale) }
                      ]}>
                        <Text style={styles.subjectMoyenneText}>
                          {m.moyGenerale.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.gradeDetails}>
                      <View style={styles.gradeDetail}>
                        <Text style={styles.gradeDetailLabel}>{t('results.continuousAssessment')}</Text>
                        <Text style={styles.gradeDetailValue}>
                          {m.moyCC > 0 ? m.moyCC.toFixed(2) : '-'}
                        </Text>
                      </View>
                      <View style={styles.gradeDetail}>
                        <Text style={styles.gradeDetailLabel}>{t('results.exam')}</Text>
                        <Text style={styles.gradeDetailValue}>
                          {m.moyExam > 0 ? m.moyExam.toFixed(2) : '-'}
                        </Text>
                      </View>
                    </View>

                    {m.ccNotes.length > 0 && (
                      <View style={styles.notesList}>
                        <Text style={styles.notesLabel}>{t('results.grades')}:</Text>
                        <View style={styles.notesContainer}>
                          {m.ccNotes.map((note: any, noteIndex: number) => (
                            <View key={noteIndex} style={styles.noteBubble}>
                              <Text style={styles.noteValue}>{note.valeur}</Text>
                              <Text style={styles.noteCoeff}>×{note.coefficient}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </Animated.ScrollView>
    );
  };

  const renderBulletinsTab = () => {
    if (!isInscrit) return renderInscriptionRequired();

    const bulletins = bulletinsData?.data?.bulletins || [];

    return (
      <ScrollView style={styles.tabContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.selectorContainer}>
          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>{t('results.schoolYear')}</Text>
            <TouchableOpacity style={styles.selectorButton} onPress={() => setShowYearSheet(true)}>
              <Text style={styles.selectorValue}>{selectedYear || t('results.selectYear')}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {bulletins.length > 0 ? (
          bulletins.map((bulletin: any) => (
            <View key={bulletin._id} ref={bulletinRef} style={styles.bulletinItem}>
              <View style={styles.bulletinIcon}>
                <Ionicons name="document-outline" size={24} color="#FF5252" />
              </View>
              <View style={styles.bulletinInfo}>
                <View style={styles.bulletinHeader}>
                  <Text style={styles.bulletinTitle}>
                    {t('results.reportCard')} {bulletin.periode.nom}
                  </Text>
                  <View style={[styles.newBadge, { backgroundColor: bulletin.statut === 'publie' ? '#4CAF50' : '#FF9800' }]}>
                    <Text style={styles.newBadgeText}>
                      {bulletin.statut === 'publie' ? t('results.published') : t('results.draft')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.bulletinPages}>
                  {bulletin.moyenne.toFixed(2)}/20 • {t('results.classAverage')}: {bulletin.moyenneClasse.toFixed(2)}/20
                </Text>
                <Text style={styles.bulletinPages}>
                  {t('results.rank')}: {bulletin.rang}/{bulletin.effectifClasse}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => openDownloadSheet(bulletin)}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Ionicons name="download-outline" size={22} color="#007AFF" />
                )}
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.noDataText}>{t('results.noReportCards')}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('results.title')}</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]} 
          onPress={() => setActiveTab('notes')}
        >
          <Ionicons 
            name="school-outline" 
            size={18} 
            color={activeTab === 'notes' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
            {t('results.gradeTable')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bulletins' && styles.activeTab]} 
          onPress={() => setActiveTab('bulletins')}
        >
          <Ionicons 
            name="document-text-outline" 
            size={18} 
            color={activeTab === 'bulletins' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'bulletins' && styles.activeTabText]}>
            {t('results.reportCards')}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'notes' ? renderNotesTab() : renderBulletinsTab()}

      {/* Bottom Sheets */}
      {renderYearSheet()}
      {renderPeriodSheet()}
      {renderTeachersSheet()}

      {/* Bottom Sheet Téléchargement */}
      <Modal visible={showDownloadSheet} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t('results.downloadBulletin')}</Text>

            <View style={styles.sheetSelector}>
              <Text style={styles.sheetLabel}>{t('results.year')}</Text>
              <Text style={styles.sheetValue}>{downloadYear}</Text>
            </View>

            <View style={styles.sheetSelector}>
              <Text style={styles.sheetLabel}>{t('results.period')}</Text>
              <Text style={styles.sheetValue}>{downloadPeriod}</Text>
            </View>

            {selectedBulletin?.statut !== 'publie' ? (
              <View style={styles.unavailableContainer}>
                <Ionicons name="lock-closed-outline" size={32} color="#FF9800" />
                <Text style={styles.unavailableText}>{t('results.bulletinNotPublishedText')}</Text>
                <Text style={styles.unavailableSubtext}>{t('results.bulletinNotPublishedSubtext')}</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.downloadActionButton} onPress={confirmDownload} disabled={isGeneratingPDF}>
                {isGeneratingPDF ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="download" size={20} color="white" />
                    <Text style={styles.downloadActionText}>{t('results.downloadPDF')}</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDownloadSheet(false)}>
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white', marginBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  headerActions: { flexDirection: 'row' },
  headerButton: { marginLeft: 15 },
  tabsContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#f5f5f5', 
    marginHorizontal: 20, 
    borderRadius: 12, 
    padding: 4, 
    marginBottom: 20 
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row',
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 8,
    justifyContent: 'center',
    gap: 6,
  },
  activeTab: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#007AFF', fontWeight: '600' },
  tabContent: { flex: 1 },
  
  // Sélecteurs améliorés
  selectorContainer: { paddingHorizontal: 20, marginBottom: 20 },
  selector: { marginBottom: 15 },
  selectorLabel: { fontSize: 12, color: '#666', marginBottom: 5, fontWeight: '500' },
  selectorButton: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectorButtonDisabled: { opacity: 0.6 },
  selectorButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectorValue: { fontSize: 16, color: '#333', fontWeight: '500' },
  selectorValueDisabled: { color: '#999' },
  
  // En-tête de période
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  periodIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#FFF5F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  periodInfo: { flex: 1 },
  periodTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 4 },
  periodDate: { fontSize: 14, color: '#666' },
  teachersButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F0F7FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  
  // Grille de statistiques
  statsGrid: { paddingHorizontal: 20, marginBottom: 25 },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  mainStatCard: {
    backgroundColor: '#007AFF',
    marginBottom: 12,
  },
  miniStatCard: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  mainStatValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: '700',
  },
  statUnit: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.8,
    marginLeft: 4,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTrendText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  // Vue rapide des enseignants
  teachersQuickView: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  teachersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  teachersScrollView: {
    marginHorizontal: -5,
  },
  teacherQuickCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 5,
    width: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  teacherQuickAvatar: {
    marginBottom: 8,
  },
  teacherQuickName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Section des points forts
  highlightsSection: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 15 },
  highlightsGrid: { gap: 12 },
  highlightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  highlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  highlightGrade: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  highlightGradeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  highlightLabel: {
    fontSize: 12,
    color: '#666',
  },
  
  // Section des notes détaillées
  gradesSection: { paddingHorizontal: 20, marginBottom: 30 },
  gradesTable: { gap: 12 },
  subjectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  teacherNameSmall: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  subjectMoyenne: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    marginLeft: 10,
  },
  subjectMoyenneText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  gradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gradeDetail: {
    flex: 1,
  },
  gradeDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  gradeDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notesList: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  notesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  noteValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  noteCoeff: {
    fontSize: 12,
    color: '#666',
  },
  
  // Bottom Sheets
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20, 
    paddingBottom: 40,
    maxHeight: '80%',
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  sheetTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 20 },
  sheetScrollView: { maxHeight: 300 },
  sheetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sheetItemSelected: {
    backgroundColor: '#f8f9fa',
  },
  sheetItemText: {
    fontSize: 16,
    color: '#333',
  },
  sheetItemTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  
  // Enseignants dans bottom sheet
  teacherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  teacherAvatar: {
    marginRight: 12,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  teacherSubject: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  teacherEmail: {
    fontSize: 12,
    color: '#007AFF',
  },
  noTeachersContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noTeachersText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  
  sheetSelector: { marginBottom: 15 },
  sheetLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
  sheetValue: { fontSize: 16, color: '#333' },
  unavailableContainer: { alignItems: 'center', paddingVertical: 30 },
  unavailableText: { fontSize: 16, fontWeight: '600', color: '#FF9800', marginTop: 10 },
  unavailableSubtext: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 5 },
  downloadActionButton: { flexDirection: 'row', backgroundColor: '#007AFF', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  downloadActionText: { color: 'white', fontWeight: '600', marginLeft: 8 },
  cancelButton: { marginTop: 10, padding: 15, alignItems: 'center' },
  cancelButtonText: { color: '#666', fontSize: 16 },
  
  // Éléments existants
  noDataContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  noDataText: { fontSize: 16, color: '#666', marginTop: 10, textAlign: 'center' },
  noDataSubtext: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 5, lineHeight: 20 },
  inscriptionRequiredContainer: { flex: 1, backgroundColor: '#FFF5F5', borderRadius: 12, padding: 20, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 30 },
  inscriptionRequiredTitle: { fontSize: 18, fontWeight: '600', color: '#FF5252', marginTop: 10 },
  inscriptionRequiredText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  inscriptionButton: { backgroundColor: '#FF5252', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  inscriptionButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  bulletinItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15 },
  bulletinIcon: { marginRight: 15 },
  bulletinInfo: { flex: 1 },
  bulletinHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  bulletinTitle: { fontSize: 16, fontWeight: '500', color: '#333', flex: 1 },
  newBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  newBadgeText: { fontSize: 10, color: 'white', fontWeight: '600' },
  bulletinPages: { fontSize: 14, color: '#666' },
  downloadButton: { padding: 10 },
});