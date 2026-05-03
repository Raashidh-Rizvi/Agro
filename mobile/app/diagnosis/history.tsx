import React, { useState, useEffect } from 'react';
import {
  StyleSheet, FlatList, TouchableOpacity, View,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing } from '@/constants/theme';
import { DiagnosisResult, DiagnosisService } from '../../services/DiagnosisService';
import { BASE_URL } from '@/constants/Config';
import { ScanResultModal } from '@/components/ScanResultModal';

export default function DiagnosisHistoryScreen() {
  const C = useAppColors();
  const [history, setHistory] = useState<DiagnosisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchHistory = async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const data = await DiagnosisService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleScan = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setSelectedImage(uri);
    setSelectedDiagnosis(null);
    setModalVisible(true);
    setIsScanning(true);

    try {
      const diagnosis = await DiagnosisService.predict(uri);
      setSelectedDiagnosis(diagnosis);
      fetchHistory(false);
    } catch (error: any) {
      setModalVisible(false);
      Alert.alert('Scan Failed', error.message || 'Could not analyze the image. Make sure the ML service is running.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCamera = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Camera is not supported in the browser. Please use the Expo Go app on your iPhone.');
      return;
    }
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setSelectedImage(uri);
    setSelectedDiagnosis(null);
    setModalVisible(true);
    setIsScanning(true);

    try {
      const diagnosis = await DiagnosisService.predict(uri);
      setSelectedDiagnosis(diagnosis);
      fetchHistory(false);
    } catch (error: any) {
      setModalVisible(false);
      Alert.alert('Scan Failed', error.message || 'Could not analyze the image.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleItemPress = (item: DiagnosisResult) => {
    const imageUrl = item.imageUrl
      ? item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}`
      : null;
    setSelectedImage(imageUrl);
    setSelectedDiagnosis(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: DiagnosisResult }) => {
    const date = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    const imageUrl = item.imageUrl
      ? item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}`
      : null;
    const confidence = (item.confidenceScore * 100).toFixed(0);
    const isHealthy = item.diseaseName.toLowerCase().includes('healthy');

    return (
      <TouchableOpacity
        style={[styles.historyCard, { backgroundColor: C.card, borderColor: C.border }]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.thumbnailWrap, { backgroundColor: C.surface }]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.thumbnail} contentFit="cover" />
          ) : (
            <Ionicons name="leaf-outline" size={28} color={C.muted} />
          )}
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <ThemedText style={[styles.diseaseName, { color: C.text }]} numberOfLines={1}>
              {item.diseaseName.replace(/_/g, ' ')}
            </ThemedText>
            <View style={[styles.statusDot, { backgroundColor: isHealthy ? '#22C55E' : '#EF4444' }]} />
          </View>
          <ThemedText style={[styles.dateText, { color: C.muted }]}>{date}</ThemedText>
          <View style={styles.confidenceRow}>
            <View style={[styles.confidenceBar, { backgroundColor: C.border }]}>
              <View style={[styles.confidenceFill, { backgroundColor: C.primary, width: `${confidence}%` as any }]} />
            </View>
            <ThemedText style={[styles.confidenceText, { color: C.primary }]}>{confidence}%</ThemedText>
          </View>
          {item.isMock && (
            <View style={[styles.mockBadge, { backgroundColor: C.dangerDim }]}>
              <ThemedText style={[styles.mockBadgeText, { color: C.danger }]}>SIMULATION</ThemedText>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <Stack.Screen
        options={{
          title: 'Disease Scanner',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.text,
        }}
      />
      <StatusBar style={C.statusBar} />

      {/* Scan Buttons */}
      <View style={[styles.scanSection, { backgroundColor: C.card, borderBottomColor: C.border }]}>
        <ThemedText style={[styles.scanTitle, { color: C.text }]}>Scan a Crop Leaf</ThemedText>
        <ThemedText style={[styles.scanSubtitle, { color: C.muted }]}>
          Upload or take a photo to detect diseases
        </ThemedText>
        <View style={styles.scanButtons}>
          <TouchableOpacity
            style={[styles.scanBtn, { backgroundColor: C.primary }, Shadows.colored(C.primary)]}
            onPress={handleCamera}
            activeOpacity={0.85}
          >
            <Ionicons name="camera" size={20} color="#FFF" />
            <ThemedText style={styles.scanBtnText}>Take Photo</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.scanBtnOutline, { borderColor: C.primary, backgroundColor: C.card }]}
            onPress={handleScan}
            activeOpacity={0.85}
          >
            <Ionicons name="images-outline" size={20} color={C.primary} />
            <ThemedText style={[styles.scanBtnText, { color: C.primary }]}>Upload Image</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* History */}
      <View style={styles.historyHeader}>
        <ThemedText style={[styles.historyTitle, { color: C.text }]}>Scan History</ThemedText>
        <ThemedText style={[styles.historyCount, { color: C.muted }]}>{history.length} scans</ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={C.primary} />
          <ThemedText style={[styles.loadingText, { color: C.muted }]}>Loading history...</ThemedText>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={56} color={C.border} />
          <ThemedText style={[styles.emptyTitle, { color: C.text }]}>No scans yet</ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: C.muted }]}>
            Use the buttons above to scan your first crop leaf.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item: any) => item._id || item.id || item.createdAt}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchHistory(true)} tintColor={C.primary} />
          }
        />
      )}

      <ScanResultModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setSelectedImage(null); }}
        result={selectedDiagnosis}
        isLoading={isScanning}
        selectedImage={selectedImage}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanSection: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  scanTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  scanSubtitle: { fontSize: 13, marginBottom: Spacing.md },
  scanButtons: { flexDirection: 'row', gap: 12 },
  scanBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: Radius.lg,
  },
  scanBtnOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: Radius.lg, borderWidth: 1.5,
  },
  scanBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  historyTitle: { fontSize: 16, fontWeight: '700' },
  historyCount: { fontSize: 13 },
  listContent: { padding: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 100 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { marginTop: Spacing.md, fontSize: 14, fontWeight: '600' },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: Spacing.lg, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  historyCard: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: Radius.lg, borderWidth: 1, marginBottom: 12, ...Shadows.xs,
  },
  thumbnailWrap: {
    width: 64, height: 64, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  thumbnail: { width: 64, height: 64 },
  cardInfo: { flex: 1, marginLeft: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  diseaseName: { flex: 1, fontSize: 15, fontWeight: '700', textTransform: 'capitalize' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  mockBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  mockBadgeText: { fontSize: 9, fontWeight: '900' },
  dateText: { fontSize: 12, marginBottom: 6 },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confidenceBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  confidenceFill: { height: '100%', borderRadius: 2 },
  confidenceText: { fontSize: 11, fontWeight: '800', width: 35 },
});
