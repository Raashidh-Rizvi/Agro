import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Spacing, Radius } from '@/constants/theme';
import { API_URL } from '@/constants/Config';

export default function ViewCropScreen() {
  const C = useAppColors();
  const { token } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [crop, setCrop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const authHeader = () => ({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    const fetchCrop = async () => {
      if (!id || !token) return;
      try {
        const res = await axios.get(`${API_URL}/crops/${id}`, authHeader());
        setCrop(res.data.data);
      } catch (err: any) {
        Alert.alert('Error', err.response?.data?.message || 'Failed to fetch crop');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchCrop();
  }, [id, token]);

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: '#00A36C' }]}>
        <ActivityIndicator size="large" color="#FFF" />
      </ThemedView>
    );
  }

  if (!crop) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: '#00A36C' }]}>
        <ThemedText style={{ color: '#FFF' }}>Crop not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#0f5132' }]}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <ThemedText style={styles.title}>Crop Details</ThemedText>

          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Crop Name:</ThemedText>
            <ThemedText style={styles.value}>{crop.cropName}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Crop Type:</ThemedText>
            <ThemedText style={styles.value}>{crop.cropType || 'N/A'}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>District:</ThemedText>
            <ThemedText style={styles.value}>{crop.district}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Planted Date:</ThemedText>
            <ThemedText style={styles.value}>{crop.plantedDate}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Crop Age:</ThemedText>
            <ThemedText style={styles.value}>{crop.cropAge} days</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Growth Stage:</ThemedText>
            <ThemedText style={styles.value}>{crop.growthStage}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Progress:</ThemedText>
            <ThemedText style={styles.value}>{crop.progressPercent}%</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Harvest Date:</ThemedText>
            <ThemedText style={styles.value}>{crop.expectedHarvestDate || 'N/A'}</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingTop: Spacing.xxl + Spacing.sm },
  card: { backgroundColor: '#FFF', borderRadius: Radius.lg, padding: Spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: '#00A36C', marginBottom: Spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
  value: { fontSize: 16, color: '#666' },
});