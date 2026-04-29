import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing, Typography } from '@/constants/theme';
import { DiagnosisResult, DiagnosisService } from '../../services/DiagnosisService';
import { BASE_URL } from '@/constants/Config';
import { ScanResultModal } from '@/components/ScanResultModal';

export default function DiagnosisHistoryScreen() {
  const C = useAppColors();
  const router = useRouter();
  const [history, setHistory] = useState<DiagnosisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleItemPress = (item: DiagnosisResult) => {
    setSelectedDiagnosis(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: DiagnosisResult }) => {
    const date = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const imageUrl = item.imageUrl && item.imageUrl.startsWith('http') 
      ? item.imageUrl 
      : item.imageUrl ? `${BASE_URL}${item.imageUrl}` : 'https://via.placeholder.com/150';

    return (
      <TouchableOpacity
        style={[styles.historyCard, { backgroundColor: C.card, borderColor: C.border }]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <ThemedText style={[styles.diseaseName, { color: C.text }]} numberOfLines={1}>
              {item.diseaseName.replace(/_/g, ' ')}
            </ThemedText>
            {item.isMock && (
              <View style={[styles.mockBadge, { backgroundColor: C.dangerDim }]}>
                <ThemedText style={[styles.mockBadgeText, { color: C.danger }]}>MOCK</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={[styles.dateText, { color: C.muted }]}>{date}</ThemedText>
          <View style={styles.confidenceRow}>
            <View style={[styles.confidenceBar, { backgroundColor: C.border }]}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    backgroundColor: C.primary, 
                    width: `${item.confidenceScore * 100}%` 
                  }
                ]} 
              />
            </View>
            <ThemedText style={[styles.confidenceText, { color: C.primary }]}>
              {(item.confidenceScore * 100).toFixed(0)}%
            </ThemedText>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <Stack.Screen 
        options={{ 
          title: 'Diagnosis History',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.text,
        }} 
      />
      <StatusBar style={C.statusBar} />

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={C.primary} />
          <ThemedText style={[styles.loadingText, { color: C.muted }]}>Loading history...</ThemedText>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={C.border} />
          <ThemedText style={[styles.emptyTitle, { color: C.text }]}>No diagnoses yet</ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: C.muted }]}>
            Scan a crop leaf to see its health report here.
          </ThemedText>
          <TouchableOpacity 
            style={[styles.scanBtn, { backgroundColor: C.primary }]}
            onPress={() => router.push('/(tabs)/')}
          >
            <ThemedText style={styles.scanBtnText}>Start Scanning</ThemedText>
          </TouchableOpacity>
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
        onClose={() => setModalVisible(false)}
        result={selectedDiagnosis}
        isLoading={false}
        selectedImage={selectedDiagnosis ? (selectedDiagnosis.imageUrl.startsWith('http') ? selectedDiagnosis.imageUrl : `${BASE_URL}${selectedDiagnosis.imageUrl}`) : null}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { marginTop: Spacing.md, fontSize: 14, fontWeight: '600' },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: Spacing.lg, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 20 },
  scanBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.pill, ...Shadows.md },
  scanBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  
  historyCard: {
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: Radius.lg,
    borderWidth: 1, marginBottom: 12, ...Shadows.xs,
  },
  thumbnail: { width: 60, height: 60, borderRadius: Radius.md, backgroundColor: '#EEE' },
  cardInfo: { flex: 1, marginLeft: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  diseaseName: { fontSize: 16, fontWeight: '700', textTransform: 'capitalize' },
  mockBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  mockBadgeText: { fontSize: 9, fontWeight: '900' },
  dateText: { fontSize: 12, marginBottom: 6 },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confidenceBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  confidenceFill: { height: '100%', borderRadius: 2 },
  confidenceText: { fontSize: 11, fontWeight: '800', width: 35 },
});
