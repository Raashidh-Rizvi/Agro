import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Alert, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { useAppColors, useAppTheme } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { DiagnosisResult, DiagnosisService } from '../../services/DiagnosisService';
import { ScanResultModal } from '@/components/ScanResultModal';
import { PremiumSelectionModal, SelectionOption } from '@/components/PremiumSelectionModal';
import { API_URL } from '@/constants/Config';
import { AdvisoryAlert, ALERT_META } from '@/features/alerts/AlertsScreen';

const quickActions = [
  { id: '1', title: 'Scan Disease', icon: 'camera-outline',     lib: 'ion', color: '#0F9D58', bg: '#E6F4EA' },
  { id: '2', title: 'Ask Expert',   icon: 'people-outline',      lib: 'ion', color: '#3B82F6', bg: '#EFF6FF' },
  { id: '3', title: 'My Crops',    icon: 'leaf-outline',        lib: 'ion', color: '#0B6B3A', bg: '#D4EDDA' },
  { id: '4', title: 'Prices',      icon: 'trending-up-outline', lib: 'ion', color: '#F59E0B', bg: '#FEF3C7' },
];

const metrics = [
  { id: '1', label: 'SOIL HEALTH', value: '87%',  delta: '+3%',  icon: 'analytics-outline' as const,  good: true  },
  { id: '2', label: 'RAINFALL',    value: '12mm', delta: '-4mm', icon: 'water-outline' as const,      good: false },
  { id: '3', label: 'CROP SCORE',  value: '9.2',  delta: '+0.4', icon: 'ribbon-outline' as const,     good: true  },
];

// (Removed hardcoded recentAlerts)

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useAppTheme();
  const C = useAppColors();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AdvisoryAlert[]>([]);
  const [isAlertsLoading, setIsAlertsLoading] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [recentScans, setRecentScans] = useState<DiagnosisResult[]>([]);
  const [isScansLoading, setIsScansLoading] = useState(false);

  useEffect(() => {
    fetchRealAlerts();
    fetchRecentScans();
  }, []);

  const fetchRecentScans = async () => {
    setIsScansLoading(true);
    try {
      const data = await DiagnosisService.getHistory();
      setRecentScans(data.slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch home scans:', err);
    } finally {
      setIsScansLoading(false);
    }
  };

  const fetchRealAlerts = async () => {
    setIsAlertsLoading(true);
    try {
      const resp = await axios.get(`${API_URL}/alerts`);
      // Take only top 3 most recent
      const fetched = (resp.data.alerts || []).slice(0, 3);
      setAlerts(fetched);
    } catch (err) {
      console.error('Failed to fetch home alerts:', err);
    } finally {
      setIsAlertsLoading(false);
    }
  };

  const navigateToAlerts = () => {
    router.push('/(tabs)/alerts');
  };

  const handleScan = async () => {
    setPickerModalVisible(true);
  };

  const openPicker = async (useCamera: boolean) => {
    try {
      let permissionResult;
      if (useCamera) {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (permissionResult.granted === false) {
        Alert.alert('Permission Denied', `We need access to your ${useCamera ? 'camera' : 'gallery'} to scan plant diseases.`);
        return;
      }

      const pickerResult = useCamera 
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!pickerResult.canceled) {
        const imageUri = pickerResult.assets[0].uri;
        setSelectedImage(imageUri);
        processDiagnosis(imageUri);
      }
    } catch (error) {
      console.error('Picker error:', error);
      Alert.alert('Error', 'Something went wrong while choosing an image.');
    }
  };

  const processDiagnosis = async (uri: string) => {
    setIsLoading(true);
    setResult(null);
    setModalVisible(true);

    try {
      const diagnosis = await DiagnosisService.predict(uri);
      setResult(diagnosis);
    } catch (error: any) {
      console.error('Diagnosis error:', error);
      Alert.alert('Analysis Failed', error.message || 'Could not connect to the analysis service.');
      setModalVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar style={C.statusBar} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ──────────────────────────── */}
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.greeting, { color: C.subtext }]}>Good morning 🌤️</ThemedText>
            <ThemedText style={[styles.userName, { color: C.text }]}>{user?.name || 'Farmer'} 👋</ThemedText>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={toggleTheme}
            >
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={C.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={navigateToAlerts}
            >
              <Ionicons name="notifications-outline" size={20} color={C.text} />
              {alerts.length > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}>
              <Ionicons name="log-out-outline" size={20} color={C.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── AI Hero Card (Scan Disease) ─────────── */}
        <TouchableOpacity 
          style={[styles.heroCard, Shadows.colored(C.primary)]}
          onPress={handleScan}
          activeOpacity={0.9}
        >
          <View 
            pointerEvents={Platform.OS === 'web' ? undefined : 'none'}
            style={[styles.heroOverlay, { backgroundColor: C.heroOverlay }, Platform.OS === 'web' ? { pointerEvents: 'none' } : {}]} 
          />
          <View style={styles.heroLeft}>
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="chip" size={11} color="#FFFFFF" />
              <ThemedText style={styles.aiBadgeText}>DIAGNOSTIC AI</ThemedText>
            </View>
            <ThemedText style={styles.heroTitle}>🌱 Scan for Diseases</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Capture a photo of your crop for an instant diagnostic report and treatment plan.
            </ThemedText>
          </View>
          <View 
            pointerEvents={Platform.OS === 'web' ? undefined : 'none'} 
            style={[styles.heroIcon, Platform.OS === 'web' ? { pointerEvents: 'none' } : {}]}
          >
            <MaterialCommunityIcons name="camera-plus" size={46} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* ── Metrics Row ────────────────────────── */}
        <View style={styles.metricsRow}>
          {metrics.map((m) => (
            <TouchableOpacity 
              key={m.id} 
              style={[styles.metricCard, { backgroundColor: C.card, borderColor: C.border }]}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Available Soon', `Detailed ${m.label.toLowerCase()} analysis will be available soon.`)}
            >
              <View style={styles.metricHeader}>
                <Ionicons name={m.icon} size={15} color={C.primary} />
                <ThemedText style={[styles.metricDelta, { color: m.good ? C.accent : C.danger }]}>
                  {m.delta}
                </ThemedText>
              </View>
              <ThemedText style={[styles.metricValue, { color: C.text }]}>{m.value}</ThemedText>
              <ThemedText style={[styles.metricLabel, { color: C.muted }]}>{m.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Quick Actions ──────────────────────── */}
        <ThemedText style={[styles.sectionTitle, { color: C.text }]}>Quick Actions</ThemedText>
        <View style={styles.actionsGrid}>
          {quickActions.filter(a => !(user?.role === 'Expert' && a.id === '2')).map((a) => (
            <TouchableOpacity
              key={a.id}
              style={[styles.actionCard, { backgroundColor: C.card, borderColor: C.border }]}
              activeOpacity={0.8}
              onPress={
                a.id === '1' ? handleScan
                : a.id === '2' ? () => router.push('/(tabs)/expert-queries')
                : a.id === '3' ? () => router.push('/(tabs)/crops')
                : a.id === '4' ? () => router.push('/(tabs)/explore')
                : undefined
              }
            >
              <View style={[styles.actionIconWrap, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon as any} size={26} color={a.color} />
              </View>
              <ThemedText style={[styles.actionText, { color: C.text }]}>{a.title}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Recent Scans ────────────────────────── */}
        <View style={styles.sectionRow}>
          <ThemedText style={[styles.sectionTitle, { color: C.text }]}>Recent Scans</ThemedText>
          <TouchableOpacity onPress={() => router.push('/diagnosis/history')}>
            <ThemedText style={[styles.viewAll, { color: C.primary }]}>View History</ThemedText>
          </TouchableOpacity>
        </View>

        {isScansLoading ? (
          <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: 20 }} />
        ) : recentScans.length === 0 ? (
          <View style={[styles.alertCard, { backgroundColor: C.card, borderColor: C.border, borderLeftColor: C.muted, justifyContent: 'center', opacity: 0.7, marginBottom: Spacing.lg }]}>
            <ThemedText style={{ color: C.muted, fontSize: 13, textAlign: 'center', width: '100%' }}>No recent scans</ThemedText>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scansScroll}>
            {recentScans.map((s: any) => (
              <TouchableOpacity 
                key={s._id || s.id} 
                style={[styles.scanMiniCard, { backgroundColor: C.card, borderColor: C.border }]}
                onPress={() => {
                  setResult(s);
                  setSelectedImage(s.imageUrl.startsWith('http') ? s.imageUrl : `${API_URL.replace('/api', '')}${s.imageUrl}`);
                  setModalVisible(true);
                }}
              >
                <Image 
                  source={{ uri: s.imageUrl.startsWith('http') ? s.imageUrl : `${API_URL.replace('/api', '')}${s.imageUrl}` }} 
                  style={styles.scanMiniThumb} 
                  contentFit="cover"
                />
                <View style={styles.scanMiniInfo}>
                  <ThemedText style={[styles.scanMiniTitle, { color: C.text }]} numberOfLines={1}>
                    {s.diseaseName.replace(/_/g, ' ')}
                  </ThemedText>
                  <ThemedText style={[styles.scanMiniDate, { color: C.muted }]}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Recent Alerts ──────────────────────── */}
        <View style={styles.sectionRow}>
          <ThemedText style={[styles.sectionTitle, { color: C.text }]}>Recent Alerts</ThemedText>
          <TouchableOpacity onPress={navigateToAlerts}>
            <ThemedText style={[styles.viewAll, { color: C.primary }]}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        {isAlertsLoading ? (
          <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: 20 }} />
        ) : alerts.length === 0 ? (
          <View style={[styles.alertCard, { backgroundColor: C.card, borderColor: C.border, borderLeftColor: C.muted, justifyContent: 'center', opacity: 0.7 }]}>
            <ThemedText style={{ color: C.muted, fontSize: 13, textAlign: 'center', width: '100%' }}>No recent alerts</ThemedText>
          </View>
        ) : (
          alerts.map((a) => {
            const meta = ALERT_META[a.alertType] || ALERT_META.general;
            return (
              <TouchableOpacity
                key={a._id}
                style={[styles.alertCard, { backgroundColor: C.card, borderColor: C.border, borderLeftColor: meta.color }]}
                activeOpacity={0.85}
                onPress={navigateToAlerts}
              >
                <View style={[styles.alertDot, { backgroundColor: meta.color }]} />
                <View style={styles.alertBody}>
                  <ThemedText style={[styles.alertTitle, { color: C.text }]}>{a.title}</ThemedText>
                  <ThemedText style={[styles.alertDesc, { color: C.subtext }]} numberOfLines={2}>{a.message}</ThemedText>
                  <ThemedText style={[styles.alertTime, { color: C.muted }]}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={17} color={C.muted} />
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Disease Analysis Modal */}
      <ScanResultModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        result={result} 
        isLoading={isLoading} 
        selectedImage={selectedImage}
      />

      {/* Premium Photo Source Selection Modal */}
      <PremiumSelectionModal
        visible={pickerModalVisible}
        onClose={() => setPickerModalVisible(false)}
        title="Scan Disease"
        description="Select the source of the leaf image for diagnosis"
        recentHistory={recentScans.map(s => ({
          ...s,
          imageUrl: s.imageUrl.startsWith('http') ? s.imageUrl : `${API_URL.replace('/api', '')}${s.imageUrl}`
        }))}
        onHistoryItemPress={(item) => {
          setResult(item);
          setSelectedImage(item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL.replace('/api', '')}${item.imageUrl}`);
          setModalVisible(true);
        }}
        options={[
          {
            id: 'camera',
            label: 'Take Photo',
            icon: 'camera-outline',
            color: C.primary,
            onPress: () => openPicker(true),
          },
          {
            id: 'gallery',
            label: 'Choose from Gallery',
            icon: 'images-outline',
            color: '#3B82F6',
            onPress: () => openPicker(false),
          },
          {
            id: 'history',
            label: 'View Full History',
            icon: 'time-outline',
            color: '#8B5CF6',
            onPress: () => router.push('/diagnosis/history'),
          },
        ]}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingTop: Spacing.xxl + Spacing.sm },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting: { fontSize: 13 },
  userName: { ...Typography.h2, fontSize: 22 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    padding: 10, borderRadius: Radius.sm, borderWidth: 1,
    position: 'relative', ...Shadows.xs,
  },
  notifDot: {
    position: 'absolute', top: 7, right: 7, width: 8, height: 8,
    borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#FFF',
  },

  heroCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: Radius.xl,
    padding: Spacing.lg, marginBottom: Spacing.lg, overflow: 'hidden',
    backgroundColor: '#0F9D58',
  },
  heroOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: Radius.xl },
  heroLeft: { flex: 1 },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.20)', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: Radius.pill, alignSelf: 'flex-start', marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.30)',
  },
  aiBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: '#FFFFFF' },
  heroTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 18 },
  heroIcon: {
    width: 68, height: 68, borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center',
    justifyContent: 'center', marginLeft: Spacing.md,
  },

  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  metricCard: {
    flex: 1, borderRadius: Radius.md, padding: 12,
    borderTopWidth: 3, borderTopColor: '#0F9D58',
    borderWidth: 1, ...Shadows.sm,
  },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  metricDelta: { fontSize: 10, fontWeight: '700' },
  metricValue: { fontSize: 20, fontWeight: '800' },
  metricLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 3 },

  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewAll: { fontSize: 13, fontWeight: '700' },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.lg },
  actionCard: {
    width: '47%', padding: Spacing.md, borderRadius: Radius.lg,
    alignItems: 'center', borderWidth: 1, ...Shadows.sm,
  },
  actionIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionText: { fontSize: 13, fontWeight: '700' },

  alertCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, borderRadius: Radius.md, borderLeftWidth: 4,
    marginBottom: 10, gap: 12, borderWidth: 1, ...Shadows.xs,
  },
  alertDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  alertBody: { flex: 1 },
  alertTitle: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  alertDesc: { fontSize: 12, lineHeight: 17, marginBottom: 3 },
  alertTime: { fontSize: 10, fontWeight: '600' },

  scansScroll: { gap: 12, paddingBottom: Spacing.lg },
  scanMiniCard: {
    width: 160, borderRadius: Radius.lg, borderWidth: 1,
    overflow: 'hidden', ...Shadows.xs,
  },
  scanMiniThumb: { width: '100%', height: 90, backgroundColor: '#EEE' },
  scanMiniInfo: { padding: 10 },
  scanMiniTitle: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize', marginBottom: 2 },
  scanMiniDate: { fontSize: 10, fontWeight: '600' },
});
