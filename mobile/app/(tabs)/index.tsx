import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppColors, useAppTheme } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing, Typography } from '@/constants/theme';
import { DiagnosisResult, DiagnosisService } from '../../services/DiagnosisService';
import { ScanResultModal } from '@/components/ScanResultModal';

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

const recentAlerts = [
  { id: '1', title: 'Pest Alert',    desc: 'Possible fall armyworm detected near your area.', time: '2h ago', color: '#EF4444' },
  { id: '2', title: 'Market Update', desc: 'Rice prices increased by 5% today.',               time: '5h ago', color: '#3B82F6' },
  { id: '3', title: 'Irrigation',    desc: 'Recommended window: 5–7 AM tomorrow.',            time: '8h ago', color: '#34C759' },
];
export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { toggleTheme, isDark } = useAppTheme();
  const C = useAppColors();

  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const handleScan = async () => {
    console.log('[DEBUG] handleScan triggered on', Platform.OS);
    
    if (Platform.OS === 'web') {
      const useCamera = window.confirm('Use Camera? (Cancel to choose from Gallery)');
      openPicker(useCamera);
      return;
    }

    Alert.alert(
      'Scan Disease',
      'Select the source of the leaf image',
      [
        {
          text: 'Take Photo',
          onPress: () => openPicker(true),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => openPicker(false),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
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
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>Welcome back,</ThemedText>
            <ThemedText style={styles.userName}>{user?.name || 'Farmer'}</ThemedText>
          </View>
          <TouchableOpacity onPress={logout} style={styles.profileButton}>
            <Ionicons name="log-out-outline" size={24} color={themeColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <ThemedText style={styles.statusTitle}>Optimal Planting Weather</ThemedText>
            <ThemedText style={styles.statusSubtitle}>Today is a great day for sowing paddy seeds.</ThemedText>
          </View>
          <View style={styles.statusIconContainer}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={42} color="white" />
          </View>
        </View>

        {/* AI Hero Card (Scan Disease) */}
        <TouchableOpacity 
          style={[styles.heroCard, Shadows.colored(C.primary)]}
          onPress={handleScan}
          activeOpacity={0.9}
        >
          <View style={[styles.heroOverlay, { backgroundColor: C.heroOverlay }]} pointerEvents="none" />
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
          <View style={styles.heroIcon} pointerEvents="none">
            <MaterialCommunityIcons name="camera-plus" size={46} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Metrics Grid */}
        <View style={styles.metricsRow}>
          {metrics.map((m) => (
            <View key={m.id} style={[styles.metricCard, { backgroundColor: C.card }]}>
              <Ionicons name={m.icon} size={20} color={m.good ? C.primary : '#EF4444'} />
              <ThemedText style={[styles.metricValue, { color: C.text }]}>{m.value}</ThemedText>
              <ThemedText style={[styles.metricLabel, { color: C.muted }]}>{m.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <ThemedText style={[styles.sectionTitle, { color: C.text, marginTop: 24 }]}>Quick Actions</ThemedText>
        <View style={styles.actionsGrid}>
          {quickActions.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={[styles.actionCard, { backgroundColor: C.card, borderColor: C.border }]}
              activeOpacity={0.8}
              onPress={() => {
                if (a.id === '1') handleScan();
                else if (a.id === '2') router.push('/(tabs)/expert-queries');
                else if (a.id === '3') router.push('/(tabs)/crops');
              }}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon as any} size={26} color={a.color} />
              </View>
              <ThemedText style={[styles.actionText, { color: C.text }]}>{a.title}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Alerts */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: C.text }]}>Recent Alerts</ThemedText>
          <TouchableOpacity>
            <ThemedText style={{ color: C.primary, fontWeight: '600' }}>View All</ThemedText>
          </TouchableOpacity>
        </View>
        
        {recentAlerts.map((alert) => (
          <TouchableOpacity 
            key={alert.id} 
            style={[styles.alertCard, { borderLeftColor: alert.color, backgroundColor: C.card }]}
          >
            <View style={styles.alertContent}>
              <ThemedText style={[styles.alertTitle, { color: C.text }]}>{alert.title}</ThemedText>
              <ThemedText style={[styles.alertDescription, { color: C.muted }]}>{alert.desc}</ThemedText>
              <ThemedText style={styles.alertTime}>{alert.time}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.border} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScanResultModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        result={result} 
        isLoading={isLoading} 
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    opacity: 0.6,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A5C36',
  },
  profileButton: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statusCard: {
    flexDirection: 'row',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#0A5C36',
    elevation: 8,
    shadowColor: '#0A5C36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
    backgroundColor: '#10B981',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  heroLeft: {
    flex: 1,
    zIndex: 1,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  heroIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '31%',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  alertCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    borderLeftWidth: 4,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  alertTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
});

