import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
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
  { id: '1', title: 'Scan Disease', icon: 'camera-outline', color: '#0F9D58', bg: '#E6F4EA', bgDark: 'rgba(15,157,88,0.15)', route: '/diagnosis' },
  { id: '2', title: 'Ask Expert',  icon: 'people-outline',  color: '#3B82F6', bg: '#EFF6FF', bgDark: 'rgba(59,130,246,0.15)', route: '/(tabs)/expert-queries' },
  { id: '3', title: 'My Crops',   icon: 'leaf-outline',    color: '#0B6B3A', bg: '#D4EDDA', bgDark: 'rgba(11,107,58,0.20)', route: '/(tabs)/crops' },
  { id: '4', title: 'Prices',     icon: 'trending-up-outline', color: '#F59E0B', bg: '#FEF3C7', bgDark: 'rgba(245,158,11,0.15)', route: '/(tabs)/explore' },
] as const;

const metrics = [
  { id: '1', label: 'Soil Health', value: '87%',  delta: '+3%',  icon: 'analytics-outline'  as const, good: true  },
  { id: '2', label: 'Rainfall',    value: '12mm',  delta: '-4mm', icon: 'water-outline'       as const, good: false },
  { id: '3', label: 'Crop Score',  value: '9.2',   delta: '+0.4', icon: 'ribbon-outline'      as const, good: true  },
];

const truncateText = (value: string, maxLength = 88) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
};

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useAppTheme();
  const C = useAppColors();
  const router = useRouter();

  const [recentAlerts, setRecentAlerts]   = useState<AdvisoryAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [alertsError, setAlertsError]     = useState<string | null>(null);
  const [modalVisible, setModalVisible]   = useState(false);
  const [modalConfig, setModalConfig]     = useState({ title: '', message: '' });

  const showInfoModal = (title: string, message: string) => {
    setModalConfig({ title, message });
    setModalVisible(true);
  };

  const openAlerts = () => router.push('/(tabs)/alerts');

  const fetchRecentAlerts = useCallback(async () => {
    setIsLoadingAlerts(true);
    try {
      setAlertsError(null);
      const response = await api.get('/alerts', { params: { limit: 3 } });
      setRecentAlerts(response.data.alerts || []);
    } catch (error) {
      setAlertsError(getAlertErrorMessage(error));
      setRecentAlerts([]);
    } finally {
      setIsLoadingAlerts(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { fetchRecentAlerts(); }, [fetchRecentAlerts])
  );

  const greeting = () => {
    if (!user) return 'Welcome';
    const createdAt = (user as any).createdAt;
    if (createdAt) {
      const isNew = Date.now() - new Date(createdAt).getTime() < 60_000;
      if (isNew) return 'Welcome';
    }
    return 'Welcome back';
  };

  const firstName = (user?.name || 'Farmer').split(' ')[0];

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar style={C.statusBar} />

      {/* Top gradient band */}
      <View
        style={[
          styles.topBand,
          { backgroundColor: isDark ? '#081208' : '#EAF5EE' },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Avatar circle */}
            <View style={[styles.avatar, { backgroundColor: C.primary + '22', borderColor: C.primary + '44' }]}>
              <ThemedText style={[styles.avatarLetter, { color: C.primary }]}>
                {firstName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <View>
              <ThemedText style={[styles.greeting, { color: C.subtext }]}>
                {greeting()} 👋
              </ThemedText>
              <ThemedText style={[styles.userName, { color: C.text }]}>
                {firstName}
              </ThemedText>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={toggleTheme}
              activeOpacity={0.8}
            >
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={C.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={openAlerts}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={18} color={C.text} />
              <View style={[styles.notifDot, { borderColor: C.card }]} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={logout}
              style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={18} color={C.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero Card ────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.heroCard, Shadows.glow(C.primary)]}
          activeOpacity={0.88}
          onPress={() => router.push('/diagnosis')}
        >
          {/* Decorative blobs */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />
          <View style={styles.blob3} />

          <View style={styles.heroContent}>
            {/* Badge */}
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="chip" size={10} color="#fff" />
              <ThemedText style={styles.heroBadgeText}>AI INSIGHT</ThemedText>
            </View>

            <ThemedText style={styles.heroTitle}>AI Disease{'\n'}Diagnosis</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Scan crop leaves to detect pests & diseases instantly.
            </ThemedText>

            <View style={styles.heroCta}>
              <ThemedText style={styles.heroCtaText}>Scan now</ThemedText>
              <Ionicons name="arrow-forward" size={13} color="rgba(255,255,255,0.9)" />
            </View>
          </View>

          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="camera-iris" size={46} color="#FFFFFF" />
            <View style={styles.heroIconRing} />
          </View>
        </TouchableOpacity>

        {/* ── Stats Strip ─────────────────────────────── */}
        <View style={styles.statsRow}>
          {metrics.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }, Shadows.xs]}
              activeOpacity={0.75}
              onPress={() => showInfoModal('Available Soon', 'This feature will be available soon')}
            >
              {/* Top row: icon + delta */}
              <View style={styles.statTop}>
                <View style={[styles.statIconBox, { backgroundColor: C.primary + '18' }]}>
                  <Ionicons name={m.icon} size={13} color={C.primary} />
                </View>
                <ThemedText style={[styles.statDelta, { color: m.good ? C.accent : C.danger }]}>
                  {m.delta}
                </ThemedText>
              </View>
              <ThemedText style={[styles.statValue, { color: C.text }]}>{m.value}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: C.muted }]}>{m.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Quick Actions ────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: C.text }]}>Quick Actions</ThemedText>
          <View style={[styles.sectionPill, { backgroundColor: C.primary + '18' }]}>
            <ThemedText style={[styles.sectionPillText, { color: C.primary }]}>4 tools</ThemedText>
          </View>
        </View>

        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionCard,
                { backgroundColor: C.card, borderColor: C.border },
                Shadows.sm,
              ]}
              activeOpacity={0.78}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[
                styles.actionIconWrap,
                { backgroundColor: isDark ? action.bgDark : action.bg },
              ]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <ThemedText style={[styles.actionLabel, { color: C.text }]}>{action.title}</ThemedText>
              <View style={[styles.actionChevron, { backgroundColor: C.surface }]}>
                <Ionicons name="chevron-forward" size={11} color={C.muted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Recent Alerts ─────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: C.text }]}>Recent Alerts</ThemedText>
          <TouchableOpacity
            onPress={openAlerts}
            activeOpacity={0.8}
            style={[styles.viewAllBtn, { backgroundColor: C.primary + '18' }]}
          >
            <ThemedText style={[styles.viewAllText, { color: C.primary }]}>View all</ThemedText>
            <Ionicons name="arrow-forward" size={11} color={C.primary} />
          </TouchableOpacity>
        </View>

        {isLoadingAlerts ? (
          <View style={[styles.alertState, { backgroundColor: C.card, borderColor: C.border }]}>
            <ActivityIndicator size="small" color={C.primary} />
            <ThemedText style={[styles.alertStateText, { color: C.subtext }]}>
              Loading live advisory alerts…
            </ThemedText>
          </View>
        ) : alertsError ? (
          <TouchableOpacity
            style={[styles.alertState, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={fetchRecentAlerts}
            activeOpacity={0.85}
          >
            <Ionicons name="alert-circle-outline" size={18} color={C.danger} />
            <ThemedText style={[styles.alertStateText, { color: C.subtext }]}>
              Could not load alerts. Tap to retry.
            </ThemedText>
          </TouchableOpacity>
        ) : recentAlerts.length === 0 ? (
          <TouchableOpacity
            style={[styles.alertState, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={openAlerts}
            activeOpacity={0.85}
          >
            <Ionicons name="notifications-off-outline" size={18} color={C.muted} />
            <ThemedText style={[styles.alertStateText, { color: C.subtext }]}>
              No advisory alerts have been posted yet.
            </ThemedText>
          </TouchableOpacity>
        ) : (
          recentAlerts.map((alert) => {
            const meta    = ALERT_META[alert.alertType];
            const summary = truncateText(alert.message);
            return (
              <TouchableOpacity
                key={alert._id}
                style={[
                  styles.alertCard,
                  { backgroundColor: C.card, borderColor: C.border },
                  Platform.select({
                    web: { boxShadow: `inset 4px 0 0 ${meta.color}` } as any,
                    default: {},
                  }),
                  Shadows.xs,
                ]}
                activeOpacity={0.85}
                onPress={openAlerts}
              >
                <View style={[styles.alertAccent, { backgroundColor: meta.color }]} />
                <View style={styles.alertBody}>
                  <View style={styles.alertRow}>
                    <ThemedText style={[styles.alertTitle, { color: C.text }]} numberOfLines={1}>
                      {alert.title}
                    </ThemedText>
                    <View style={[styles.alertTypePill, { backgroundColor: meta.bg }]}>
                      <ThemedText style={[styles.alertTypeText, { color: meta.color }]}>
                        {meta.label}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.alertMeta, { color: C.subtext }]}>
                    {alert.cropType} · {alert.district}
                  </ThemedText>
                  <ThemedText style={[styles.alertMsg, { color: C.subtext }]} numberOfLines={2}>
                    {summary}
                  </ThemedText>
                  <ThemedText style={[styles.alertTime, { color: C.muted }]}>
                    {formatAlertRelativeTime(alert.createdAt)}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={15} color={C.muted} />
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: Spacing.xxl + 32 }} />
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
  topBand: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 220, zIndex: 0,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + Spacing.md,
    paddingBottom: Spacing.lg,
  },

  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 18, fontWeight: '800' },
  greeting:   { fontSize: 12, fontWeight: '500', letterSpacing: 0.2 },
  userName:   { ...Typography.h3, fontSize: 20, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 38, height: 38,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadows.xs,
  },
  notifDot: {
    position: 'absolute', top: 7, right: 7,
    width: 7, height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
  },

  // ── Hero Card ─────────────────────────────────────────────
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    backgroundColor: '#0F9D58',
    position: 'relative',
    minHeight: 160,
  },
  blob1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -90, right: -70,
  },
  blob2: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -55, left: -35,
  },
  blob3: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.09)', top: 18, left: 48,
  },
  heroContent: { flex: 1, zIndex: 1 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.20)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  heroBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.4, color: '#FFFFFF' },
  heroTitle: {
    fontSize: 22, fontWeight: '800', color: '#FFFFFF',
    letterSpacing: -0.5, lineHeight: 28, marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 12.5, color: 'rgba(255,255,255,0.80)',
    lineHeight: 18, marginBottom: 16,
  },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroCtaText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.92)' },
  heroIcon: {
    width: 76, height: 76,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    zIndex: 1,
    position: 'relative',
  },
  heroIconRing: {
    position: 'absolute',
    width: 92, height: 92,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  // ── Stats Strip ───────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconBox: {
    width: 26, height: 26,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDelta:  { fontSize: 10, fontWeight: '700' },
  statValue:  { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  statLabel:  {
    fontSize: 9, fontWeight: '700',
    letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 3,
  },

  // ── Section headers ───────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle:   { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  sectionPill:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.pill },
  sectionPillText:{ fontSize: 11, fontWeight: '700' },
  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  viewAllText: { fontSize: 11, fontWeight: '700' },

  // ── Quick Actions ─────────────────────────────────────────
  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, marginBottom: Spacing.lg,
  },
  actionCard: {
    width: '47%',
    padding: Spacing.md,
    borderRadius: Radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  actionIconWrap: {
    width: 56, height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel:   { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  actionChevron: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Alert Cards ───────────────────────────────────────────
  alertState: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: 10,
  },
  alertStateText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  alertCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: Spacing.md,
    marginBottom: 10,
    gap: 12,
    overflow: 'hidden',
  },
  alertAccent: { display: 'none' },
  alertBody:   { flex: 1 },
  alertRow:    {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', gap: 8, marginBottom: 4,
  },
  alertTitle:    { flex: 1, fontWeight: '700', fontSize: 14 },
  alertTypePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  alertTypeText: { fontSize: 9, fontWeight: '800' },
  alertMeta:     { fontSize: 11, fontWeight: '600', marginBottom: 3, opacity: 0.8 },
  alertMsg:      { fontSize: 12, lineHeight: 17, marginBottom: 4 },
  alertTime:     { fontSize: 10, fontWeight: '600' },
});
