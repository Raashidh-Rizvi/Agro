import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing } from '@/constants/theme';

const FILTER_TABS = ['All', 'Unread', 'Critical'] as const;
type Filter = typeof FILTER_TABS[number];

const ALERT_META: Record<string, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  danger:  { color: '#EF4444', bg: '#FEE2E2', icon: 'warning',                  label: 'Critical'  },
  warning: { color: '#F59E0B', bg: '#FEF3C7', icon: 'alert-circle-outline',      label: 'Warning'   },
  info:    { color: '#3B82F6', bg: '#EFF6FF', icon: 'information-circle-outline', label: 'Info'      },
  success: { color: '#0F9D58', bg: '#E6F4EA', icon: 'checkmark-circle-outline',  label: 'Advisory'  },
};

const ALERTS = [
  { id: '1', title: 'Pest Alert',         desc: 'Possible fall armyworm detected near your paddy fields. Take immediate action.',     time: '2h ago',  type: 'danger',  read: false },
  { id: '2', title: 'Low Rainfall',       desc: 'Rainfall below average. Consider irrigation for maize fields in the next 48 hours.', time: '4h ago',  type: 'warning', read: false },
  { id: '3', title: 'Market Update',      desc: 'Rice prices increased by 5% today. Good time to sell stored stock.',                 time: '5h ago',  type: 'info',    read: true  },
  { id: '4', title: 'Irrigation Advisory',desc: 'Recommended irrigation window: 5–7 AM tomorrow. Soil moisture at 38%.',             time: '8h ago',  type: 'success', read: true  },
  { id: '5', title: 'Disease Risk',       desc: 'High humidity detected. Risk of fungal disease in tomato crops. Apply fungicide.',   time: '1d ago',  type: 'danger',  read: true  },
  { id: '6', title: 'Weather Forecast',   desc: 'Sunny weather expected for the next 3 days. Ideal for harvesting.',                  time: '1d ago',  type: 'info',    read: true  },
];

export default function AlertsScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const C = useAppColors();

  const filtered = ALERTS.filter((a) => {
    if (activeFilter === 'Unread') return !a.read;
    if (activeFilter === 'Critical') return a.type === 'danger';
    return true;
  });
  const unreadCount = ALERTS.filter((a) => !a.read).length;

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar style={C.statusBar} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={[styles.headerTitle, { color: C.text }]}>Alerts</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: C.muted }]}>
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </ThemedText>
        </View>
        <TouchableOpacity style={[styles.markAllBtn, { backgroundColor: C.primaryDim, borderColor: C.primary + '40' }]}>
          <Ionicons name="checkmark-done-outline" size={18} color={C.primary} />
          <ThemedText style={[styles.markAllText, { color: C.primary }]}>Mark all read</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Summary chips */}
      <View style={styles.summaryRow}>
        {Object.entries(ALERT_META).map(([type, meta]) => {
          const count = ALERTS.filter((a) => a.type === type).length;
          return (
            <View key={type} style={[styles.summaryChip, { backgroundColor: meta.bg }]}>
              <Ionicons name={meta.icon} size={13} color={meta.color} />
              <ThemedText style={[styles.summaryChipText, { color: meta.color }]}>{count}</ThemedText>
            </View>
          );
        })}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => {
          const active = tab === activeFilter;
          return (
            <TouchableOpacity key={tab}
              style={[styles.filterTab, { backgroundColor: active ? C.primary : C.card, borderColor: active ? C.primary : C.border }]}
              onPress={() => setActiveFilter(tab)}>
              <ThemedText style={[styles.filterText, { color: active ? '#FFFFFF' : C.subtext }]}>{tab}</ThemedText>
              {tab === 'Unread' && unreadCount > 0 && (
                <View style={styles.filterBadge}>
                  <ThemedText style={styles.filterBadgeText}>{unreadCount}</ThemedText>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Alert List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map((alert) => {
          const meta = ALERT_META[alert.type];
          return (
            <TouchableOpacity key={alert.id}
              style={[styles.alertCard, { backgroundColor: C.card, borderColor: alert.read ? C.border : meta.color + '40' }]}
              activeOpacity={0.85}>
              <View style={[styles.alertColorBar, { backgroundColor: meta.color }]} />
              <View style={[styles.alertIcon, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon} size={20} color={meta.color} />
              </View>
              <View style={styles.alertContent}>
                <View style={styles.alertTopRow}>
                  <ThemedText style={[styles.alertTitle, { color: C.text }]}>{alert.title}</ThemedText>
                  <View style={[styles.alertTypePill, { backgroundColor: meta.bg }]}>
                    <ThemedText style={[styles.alertTypeText, { color: meta.color }]}>{meta.label}</ThemedText>
                  </View>
                </View>
                <ThemedText style={[styles.alertDesc, { color: C.subtext }]} numberOfLines={2}>{alert.desc}</ThemedText>
                <View style={styles.alertFooter}>
                  <ThemedText style={[styles.alertTime, { color: C.muted }]}>{alert.time}</ThemedText>
                  {!alert.read && <View style={[styles.unreadDot, { backgroundColor: C.primary }]} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={52} color={C.accent} />
            <ThemedText style={[styles.emptyTitle, { color: C.text }]}>All clear!</ThemedText>
            <ThemedText style={[styles.emptyText, { color: C.muted }]}>No alerts in this category.</ThemedText>
          </View>
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Spacing.xxl + Spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1 },
  markAllText: { fontSize: 12, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 8, marginBottom: Spacing.md },
  summaryChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, flex: 1, justifyContent: 'center' },
  summaryChipText: { fontSize: 13, fontWeight: '800' },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 8, marginBottom: Spacing.md },
  filterTab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },
  filterBadge: { backgroundColor: '#EF4444', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  listContent: { paddingHorizontal: Spacing.lg },
  alertCard: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, marginBottom: 12, overflow: 'hidden', borderWidth: 1, ...Shadows.sm },
  alertColorBar: { width: 4, alignSelf: 'stretch' },
  alertIcon: { width: 42, height: 42, borderRadius: 21, margin: 12, alignItems: 'center', justifyContent: 'center' },
  alertContent: { flex: 1, paddingVertical: 12, paddingRight: 14 },
  alertTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  alertTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  alertTypePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.pill },
  alertTypeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  alertDesc: { fontSize: 12, lineHeight: 17, marginBottom: 6 },
  alertFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertTime: { fontSize: 10, fontWeight: '600' },
  unreadDot: { width: 7, height: 7, borderRadius: 3.5 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptyText: { fontSize: 14, marginTop: 4 },
});
