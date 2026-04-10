import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing } from '@/constants/theme';

const FILTER_TABS = ['All', 'Growing', 'Harvested', 'At Risk'] as const;
type Filter = typeof FILTER_TABS[number];

const STATUS_META: Record<string, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Growing:   { color: '#0F9D58', bg: '#E6F4EA', icon: 'leaf-outline'            },
  Harvested: { color: '#059669', bg: '#D1FAE5', icon: 'checkmark-circle-outline' },
  'At Risk': { color: '#EF4444', bg: '#FEE2E2', icon: 'warning-outline'          },
};

const CROPS = [
  { id: '1', name: 'Paddy (Samba)',   area: '2.5 acres', status: 'Growing',   daysLeft: 45, health: 92 },
  { id: '2', name: 'Maize',           area: '1.2 acres', status: 'At Risk',   daysLeft: 20, health: 58 },
  { id: '3', name: 'Tomato',          area: '0.8 acres', status: 'Growing',   daysLeft: 30, health: 85 },
  { id: '4', name: 'Coconut',         area: '5.0 acres', status: 'Harvested', daysLeft: 0,  health: 100 },
  { id: '5', name: 'Banana (Ambul)',  area: '1.8 acres', status: 'Growing',   daysLeft: 60, health: 78 },
];

export default function CropsScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const C = useAppColors();

  const filtered = activeFilter === 'All' ? CROPS : CROPS.filter((c) => c.status === activeFilter);

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar style={C.statusBar} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={[styles.headerTitle, { color: C.text }]}>My Crops</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: C.muted }]}>{CROPS.length} crops registered</ThemedText>
        </View>
        <TouchableOpacity style={[styles.addBtn, Shadows.colored('#0F9D58')]} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <ThemedText style={styles.addBtnText}>Add Crop</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Growing',   value: '3', color: '#0F9D58', bg: '#E6F4EA' },
          { label: 'At Risk',   value: '1', color: '#EF4444', bg: '#FEE2E2' },
          { label: 'Harvested', value: '1', color: '#059669', bg: '#D1FAE5' },
        ].map((s) => (
          <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
            <ThemedText style={[styles.summaryValue, { color: s.color }]}>{s.value}</ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: s.color }]}>{s.label}</ThemedText>
          </View>
        ))}
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}
        contentContainerStyle={styles.filterContent}>
        {FILTER_TABS.map((tab) => {
          const active = tab === activeFilter;
          return (
            <TouchableOpacity key={tab}
              style={[styles.filterTab, { backgroundColor: active ? '#0F9D58' : C.card, borderColor: active ? '#0F9D58' : C.border }]}
              onPress={() => setActiveFilter(tab)}>
              <ThemedText style={[styles.filterText, { color: active ? '#FFFFFF' : C.subtext, fontWeight: active ? '700' : '600' }]}>
                {tab}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Crop List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map((crop) => {
          const meta = STATUS_META[crop.status];
          const barColor = crop.health > 75 ? '#0F9D58' : crop.health > 50 ? '#F59E0B' : '#EF4444';
          return (
            <TouchableOpacity key={crop.id}
              style={[styles.cropCard, { backgroundColor: C.card, borderColor: C.border }]}
              activeOpacity={0.85}>
              <View style={[styles.cropIcon, { backgroundColor: meta.bg }]}>
                <MaterialCommunityIcons name="sprout" size={28} color={meta.color} />
              </View>
              <View style={styles.cropInfo}>
                <View style={styles.cropTopRow}>
                  <ThemedText style={[styles.cropName, { color: C.text }]}>{crop.name}</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={11} color={meta.color} />
                    <ThemedText style={[styles.statusText, { color: meta.color }]}>{crop.status}</ThemedText>
                  </View>
                </View>
                <ThemedText style={[styles.cropArea, { color: C.muted }]}>📍 {crop.area}</ThemedText>
                <View style={styles.healthRow}>
                  <View style={[styles.healthBarBg, { backgroundColor: C.border }]}>
                    <View style={[styles.healthBarFill, { width: `${crop.health}%` as any, backgroundColor: barColor }]} />
                  </View>
                  <ThemedText style={[styles.healthText, { color: C.subtext }]}>{crop.health}%</ThemedText>
                </View>
                {crop.status !== 'Harvested' && (
                  <ThemedText style={[styles.daysLeft, { color: C.muted }]}>⏳ {crop.daysLeft} days to harvest</ThemedText>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.muted} />
            </TouchableOpacity>
          );
        })}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Spacing.xxl + Spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0F9D58', paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.pill },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.md },
  summaryCard: { flex: 1, borderRadius: Radius.md, padding: 12, alignItems: 'center', justifyContent: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  filterRow: { marginBottom: Spacing.md },
  filterContent: { paddingHorizontal: Spacing.lg, gap: 8 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.pill, borderWidth: 1 },
  filterText: { fontSize: 13 },
  listContent: { paddingHorizontal: Spacing.lg },
  cropCard: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, padding: Spacing.md, marginBottom: 12, borderWidth: 1, gap: 14, ...Shadows.sm },
  cropIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  cropInfo: { flex: 1 },
  cropTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  cropName: { fontSize: 15, fontWeight: '700' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  statusText: { fontSize: 10, fontWeight: '700' },
  cropArea: { fontSize: 12, marginBottom: 8 },
  healthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  healthBarBg: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  healthBarFill: { height: 5, borderRadius: 3 },
  healthText: { fontSize: 11, fontWeight: '700', width: 32 },
  daysLeft: { fontSize: 11 },
});
