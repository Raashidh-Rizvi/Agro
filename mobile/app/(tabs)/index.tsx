import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';


import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { useAppColors, useAppTheme } from '@/context/AppThemeContext';
import api from '@/services/api';
import { Shadows, Radius, Spacing, Typography } from '@/constants/theme';
import {
  ALERT_META,
  type AdvisoryAlert,
  formatAlertRelativeTime,
  getAlertErrorMessage,
} from '@/features/alerts/alertSupport';
import ValidationModal from '@/components/ValidationModal';

const quickActions = [
  { id: '1', title: 'Scan Disease', icon: 'camera-outline', color: '#0F9D58', bg: '#E6F4EA', route: '/diagnosis' },
  { id: '2', title: 'Ask Expert', icon: 'people-outline', color: '#3B82F6', bg: '#EFF6FF', route: '/(tabs)/expert-queries' },
  { id: '3', title: 'My Crops', icon: 'leaf-outline', color: '#0B6B3A', bg: '#D4EDDA', route: '/(tabs)/crops' },
  { id: '4', title: 'Prices', icon: 'trending-up-outline', color: '#F59E0B', bg: '#FEF3C7', route: '/(tabs)/explore' },
] as const;

const metrics = [
  { id: '1', label: 'SOIL HEALTH', value: '87%', delta: '+3%', icon: 'analytics-outline' as const, good: true },
  { id: '2', label: 'RAINFALL', value: '12mm', delta: '-4mm', icon: 'water-outline' as const, good: false },
  { id: '3', label: 'CROP SCORE', value: '9.2', delta: '+0.4', icon: 'ribbon-outline' as const, good: true },
];

const truncateText = (value: string, maxLength = 88) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
};

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useAppTheme();
  const C = useAppColors();
  const router = useRouter();

  const [recentAlerts, setRecentAlerts] = useState<AdvisoryAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '' });

  const showInfoModal = (title: string, message: string) => {
    setModalConfig({ title, message });
    setModalVisible(true);
  };

  const openAlerts = () => {
    router.push('/(tabs)/alerts');
  };

  const fetchRecentAlerts = useCallback(async () => {
    setIsLoadingAlerts(true);

    try {
      setAlertsError(null);
      const response = await api.get('/alerts', {
        params: { limit: 3 },
      });
      setRecentAlerts(response.data.alerts || []);
    } catch (error) {
      setAlertsError(getAlertErrorMessage(error));
      setRecentAlerts([]);
    } finally {
      setIsLoadingAlerts(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecentAlerts();
    }, [fetchRecentAlerts])
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar style={C.statusBar} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.greeting, { color: C.subtext }]}>Good morning</ThemedText>
            <ThemedText style={[styles.userName, { color: C.text }]}>{user?.name || 'Farmer'}</ThemedText>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={toggleTheme}
              activeOpacity={0.85}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={C.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={openAlerts}
              activeOpacity={0.85}>
              <Ionicons name="notifications-outline" size={20} color={C.text} />
              <View style={styles.notifDot} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={logout}
              style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}
              activeOpacity={0.85}>
              <Ionicons name="log-out-outline" size={20} color={C.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.heroCard, Shadows.colored(C.primary)]}
          activeOpacity={0.9}
          onPress={() => router.push('/diagnosis')}>
          <View style={[styles.heroOverlay, { backgroundColor: C.heroOverlay }]} />
          <View style={styles.heroLeft}>
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="chip" size={11} color="#FFFFFF" />
              <ThemedText style={styles.aiBadgeText}>AI INSIGHT</ThemedText>
            </View>
            <ThemedText style={styles.heroTitle}>AI Disease Diagnosis</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Scan your crop leaves to detect pests and diseases instantly with AI.
            </ThemedText>
          </View>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="camera-iris" size={46} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.metricsRow}>
          {metrics.map((metric) => (
            <TouchableOpacity
              key={metric.id}
              style={[styles.metricCard, { backgroundColor: C.card, borderColor: C.border }]}
              activeOpacity={0.7}
              onPress={() => showInfoModal('Available Soon', 'This feature will be available soon')}>
              <View style={styles.metricHeader}>
                <Ionicons name={metric.icon} size={15} color={C.primary} />
                <ThemedText style={[styles.metricDelta, { color: metric.good ? C.accent : C.danger }]}>
                  {metric.delta}
                </ThemedText>
              </View>
              <ThemedText style={[styles.metricValue, { color: C.text }]}>{metric.value}</ThemedText>
              <ThemedText style={[styles.metricLabel, { color: C.muted }]}>{metric.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <ThemedText style={[styles.sectionTitle, { color: C.text }]}>Quick Actions</ThemedText>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { backgroundColor: C.card, borderColor: C.border }]}
              activeOpacity={0.8}
              onPress={() => router.push(action.route as any)}>
              <View style={[styles.actionIconWrap, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon as any} size={26} color={action.color} />
              </View>
              <ThemedText style={[styles.actionText, { color: C.text }]}>{action.title}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <ThemedText style={[styles.sectionTitle, { color: C.text }]}>Recent Alerts</ThemedText>
          <TouchableOpacity onPress={openAlerts} activeOpacity={0.8}>
            <ThemedText style={[styles.viewAll, { color: C.primary }]}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        {isLoadingAlerts ? (
          <View style={[styles.alertStateCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <ActivityIndicator size="small" color={C.primary} />
            <ThemedText style={[styles.alertStateText, { color: C.subtext }]}>Loading live advisory alerts...</ThemedText>
          </View>
        ) : alertsError ? (
          <TouchableOpacity
            style={[styles.alertStateCard, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={fetchRecentAlerts}
            activeOpacity={0.85}>
            <Ionicons name="alert-circle-outline" size={18} color={C.danger} />
            <ThemedText style={[styles.alertStateText, { color: C.subtext }]}>
              Could not load alerts. Tap to retry.
            </ThemedText>
          </TouchableOpacity>
        ) : recentAlerts.length === 0 ? (
          <TouchableOpacity
            style={[styles.alertStateCard, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={openAlerts}
            activeOpacity={0.85}>
            <Ionicons name="notifications-off-outline" size={18} color={C.muted} />
            <ThemedText style={[styles.alertStateText, { color: C.subtext }]}>
              No advisory alerts have been posted yet.
            </ThemedText>
          </TouchableOpacity>
        ) : (
          recentAlerts.map((alert) => {
            const meta = ALERT_META[alert.alertType];
            const summary = truncateText(alert.message);

            return (
              <TouchableOpacity
                key={alert._id}
                style={[styles.alertCard, { backgroundColor: C.card, borderColor: C.border, borderLeftColor: meta.color }]}
                activeOpacity={0.85}
                onPress={openAlerts}>
                <View style={[styles.alertDot, { backgroundColor: meta.color }]} />
                <View style={styles.alertBody}>
                  <View style={styles.alertHeaderRow}>
                    <ThemedText style={[styles.alertTitle, { color: C.text }]}>{alert.title}</ThemedText>
                    <View style={[styles.alertTypePill, { backgroundColor: meta.bg }]}>
                      <ThemedText style={[styles.alertTypeText, { color: meta.color }]}>{meta.label}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.alertDesc, { color: C.subtext }]}>
                    {alert.cropType} | {alert.district}
                  </ThemedText>
                  <ThemedText style={[styles.alertMessage, { color: C.subtext }]}>{summary}</ThemedText>
                  <ThemedText style={[styles.alertTime, { color: C.muted }]}>
                    {formatAlertRelativeTime(alert.createdAt)}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={17} color={C.muted} />
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
      <ValidationModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
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
    padding: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    position: 'relative',
    ...Shadows.xs,
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    backgroundColor: '#0F9D58',
  },
  heroOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: Radius.xl },
  heroLeft: { flex: 1 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.20)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  aiBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: '#FFFFFF' },
  heroTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 18 },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },

  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  metricCard: {
    flex: 1,
    borderRadius: Radius.md,
    padding: 12,
    borderTopWidth: 3,
    borderTopColor: '#0F9D58',
    borderWidth: 1,
    ...Shadows.sm,
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
    width: '47%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.sm,
  },
  actionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionText: { fontSize: 13, fontWeight: '700' },

  alertStateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 10,
    ...Shadows.xs,
  },
  alertStateText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    ...Shadows.xs,
  },
  alertDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  alertBody: { flex: 1 },
  alertHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 },
  alertTitle: { flex: 1, fontWeight: '700', fontSize: 14 },
  alertTypePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  alertTypeText: { fontSize: 10, fontWeight: '800' },
  alertDesc: { fontSize: 12, lineHeight: 17, marginBottom: 3, fontWeight: '600' },
  alertMessage: { fontSize: 12, lineHeight: 17, marginBottom: 3 },
  alertTime: { fontSize: 10, fontWeight: '600' },

});
