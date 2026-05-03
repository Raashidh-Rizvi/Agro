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



  const handleItemPress = (item: DiagnosisResult) => {
    const imageUrl = item.imageUrl
      ? item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}`
      : null;
    setSelectedImage(imageUrl);
    setSelectedDiagnosis(item);
    setModalVisible(true);
  };

  const handleDeleteHistory = (id: string) => {
    console.log('--- [DEBUG] handleDeleteHistory called for ID:', id);
    if (!id || id === 'undefined') {
      const msg = 'Invalid record ID. Cannot delete.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
      return;
    }

    const performDelete = async () => {
      console.log('--- [DEBUG] Delete confirmed for ID:', id);
      try {
        await DiagnosisService.deleteDiagnosis(id);
        console.log('--- [DEBUG] Delete API call successful ---');
        setHistory(prev => prev.filter(item => {
          const itemId = ((item as any)._id || (item as any).id)?.toString();
          return itemId !== id;
        }));
        if (Platform.OS === 'web') alert('Record deleted successfully.');
      } catch (error: any) {
        console.error('--- [ERROR] Delete API call failed ---', error);
        const message = error.response?.data?.message || error.message || 'Failed to delete the record.';
        if (Platform.OS === 'web') alert('Delete Failed: ' + message);
        else Alert.alert('Delete Failed', message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this diagnosis record?')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Record',
        'Are you sure you want to delete this diagnosis record?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };

  const renderItem = ({ item }: { item: DiagnosisResult }) => {
    const id = (item as any)._id || (item as any).id;
    const date = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    const imageUrl = item.imageUrl
      ? item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}`
      : null;
    const confidence = (item.confidenceScore * 100).toFixed(0);
    const isHealthy = item.diseaseName.toLowerCase().includes('healthy');

    return (
      <View style={[styles.historyCard, { backgroundColor: C.card, borderColor: C.border }]}>
        <TouchableOpacity
          style={styles.cardContent}
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
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => handleDeleteHistory(id)}
          activeOpacity={0.6}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="trash-outline" size={22} color={C.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <Stack.Screen
        options={{
          title: 'Scan History',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.text,
        }}
      />
      <StatusBar style={C.statusBar} />


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
        isLoading={false}
        selectedImage={selectedImage}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

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
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.lg, borderWidth: 1, marginBottom: 12, ...Shadows.xs,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  deleteBtn: {
    padding: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.05)',
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
