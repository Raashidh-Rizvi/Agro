import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { useAppColors, useAppTheme } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing } from '@/constants/theme';
import api from '../../services/api';
import ValidationModal from '@/components/ValidationModal';

const SETTINGS = [
  {
    section: 'Account',
    items: [
      { id: 'edit',   icon: 'person-outline',             label: 'Edit Profile',         color: '#0F9D58', route: '/profile/edit' },
      { id: 'history',icon: 'time-outline',               label: 'Diagnosis History',    color: '#0F9D58', route: '/diagnosis/history' },
      { id: 'farm',   icon: 'leaf-outline',               label: 'Farm Details',         color: '#0F9D58', route: '/profile/farm-details' },
      { id: 'pass',   icon: 'lock-closed-outline',        label: 'Change Password',      color: '#3B82F6', route: '/profile/change-password' },
    ],
  },
  {
    section: 'Preferences',
    items: [
      { id: 'theme',  icon: 'moon-outline',               label: 'Dark Mode',            color: '#8B5CF6' },
      { id: 'notif',  icon: 'notifications-outline',      label: 'Notifications',        color: '#F59E0B', route: '/profile/notifications' },
      { id: 'lang',   icon: 'language-outline',           label: 'Language',             color: '#3B82F6', route: '/profile/language' },
      { id: 'unit',   icon: 'scale-outline',              label: 'Units & Measurements', color: '#6B7280', route: '/profile/units' },
    ],
  },
  {
    section: 'Support',
    items: [
      { id: 'help',   icon: 'help-circle-outline',        label: 'Help & Support',       color: '#6B7280', route: '/profile/help' },
      { id: 'about',  icon: 'information-circle-outline', label: 'About AgriSense',      color: '#6B7280', route: '/profile/about' },
      { id: 'privacy',icon: 'shield-checkmark-outline',   label: 'Privacy Policy',       color: '#6B7280', route: '/profile/privacy' },
    ],
  },
];

const ADMIN_SETTINGS = {
  section: 'Administration',
  items: [
    { id: 'users',  icon: 'people-outline',             label: 'User Management',      color: '#8B5CF6', route: '/admin/users' },
    { id: 'system', icon: 'settings-outline',           label: 'System Health',        color: '#6B7280' },
  ],
};

const EXPERT_SETTINGS = {
  section: 'Expert Tools',
  items: [
    { id: 'dashboard', icon: 'speedometer-outline',      label: 'Expert Dashboard',     color: '#0F9D58', route: '/expert/dashboard' },
    { id: 'queries',   icon: 'chatbubbles-outline',      label: 'Farmer Queries',       color: '#8B5CF6', route: '/(tabs)/expert-queries' },
    { id: 'alerts',    icon: 'notifications-outline',    label: 'Manage Alerts',        color: '#F59E0B', route: '/(tabs)/alerts' },
  ],
};

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const { mode, toggleTheme } = useAppTheme();
  const C = useAppColors();
  const router = useRouter();

  const [stats, setStats] = useState({ crops: 0, queries: 0, alerts: 0 });
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '' });

  const showInfoModal = (title: string, message: string) => {
    setModalConfig({ title, message });
    setModalVisible(true);
  };

  const fetchStats = async () => {
    if (!token) return;
    try {
      const response = await api.get('/stats/summary');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Fetch profile stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [token])
  );

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AS';

  const handlePress = (item: any) => {
    if (item.id === 'theme') {
      toggleTheme();
    } else if (item.route) {
      router.push(item.route as any);
    } else {
      showInfoModal('Coming Soon', `${item.label} feature is currently under development.`);
    }
  };

  const navigateToTab = (tab: string) => {
    router.push(`/(tabs)/${tab}` as any);
  };

  const statsData = [
    { label: 'Crops',   value: stats.crops.toString(),   icon: 'leaf-outline'          as const, tab: 'crops',          color: '#0F9D58', bg: 'rgba(15,157,88,0.12)' },
    { label: 'Queries', value: stats.queries.toString(), icon: 'chatbubble-outline'    as const, tab: 'expert-queries',  color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Alerts',  value: stats.alerts.toString(),  icon: 'notifications-outline' as const, tab: 'alerts',          color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar style={C.statusBar} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Profile Header ── */}
        <View style={[styles.profileHeaderBg, { backgroundColor: C.card, borderColor: C.border }]}>
          {/* Decorative bubbles */}
          <View style={[styles.headerBubble1, { backgroundColor: C.primary + '12' }]} />
          <View style={[styles.headerBubble2, { backgroundColor: C.primary + '08' }]} />

          <View style={[styles.avatarOuterRing, Shadows.glow(C.primary)]}>
            <View style={[styles.avatarInnerRing, { borderColor: C.primary + '50' }]}>
              <View style={[styles.avatar, { backgroundColor: '#096040' }]}>
                <ThemedText style={styles.avatarText}>{initials}</ThemedText>
              </View>
            </View>
          </View>

          <ThemedText style={[styles.userName, { color: C.text }]}>{user?.name || 'User'}</ThemedText>
          <ThemedText style={[styles.userEmail, { color: C.muted }]}>{user?.email || 'user@agrisense.lk'}</ThemedText>
          <View style={[styles.roleBadge, { backgroundColor: C.primaryDim, borderColor: C.primary + '35' }]}>
            <MaterialCommunityIcons
              name={user?.role === 'Expert' ? 'school-outline' : user?.role === 'Admin' ? 'shield-account' : 'tractor'}
              size={13}
              color={C.primary}
            />
            <ThemedText style={[styles.roleBadgeText, { color: C.primary }]}>{user?.role || 'Farmer'}</ThemedText>
          </View>
        </View>

        {/* ── Farm Stats ── */}
        <View style={styles.statsRow}>
          {statsData.map((stat) => (
            <TouchableOpacity
              key={stat.label}
              style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }, Shadows.sm]}
              onPress={() => navigateToTab(stat.tab)}
              activeOpacity={0.7}>
              <View style={[styles.statIconWrap, { backgroundColor: stat.bg }]}>
                <Ionicons name={stat.icon} size={18} color={stat.color} />
              </View>
              <ThemedText style={[styles.statValue, { color: C.text }]}>{stat.value}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: C.muted }]}>{stat.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── AI Advisor Banner ── */}
        <TouchableOpacity
          style={[styles.aiBanner, Shadows.colored(C.primary)]}
          onPress={() => showInfoModal('Available Soon', 'The AgriSense Pro subscription will be available soon!')}
          activeOpacity={0.85}>
          {/* Banner decorative circles */}
          <View style={styles.bannerBubble1} />
          <View style={styles.bannerBubble2} />

          <View style={styles.aiBannerLeft}>
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="chip" size={11} color="#FFFFFF" />
              <ThemedText style={styles.aiBadgeText}>AI ADVISOR</ThemedText>
            </View>
            <ThemedText style={styles.aiBannerTitle}>Upgrade to Pro</ThemedText>
            <ThemedText style={styles.aiBannerSubtitle}>
              Unlimited AI insights, expert consultations & price alerts.
            </ThemedText>
          </View>
          <View style={styles.aiBannerRight}>
            <MaterialCommunityIcons name="robot-happy-outline" size={56} color="rgba(255,255,255,0.35)" />
          </View>
        </TouchableOpacity>

        {/* ── Admin Section ── */}
        {user?.role === 'Admin' && (
          <View style={styles.settingsSection}>
            <ThemedText style={[styles.settingsSectionTitle, { color: C.muted }]}>{ADMIN_SETTINGS.section}</ThemedText>
            <View style={[styles.settingsGroup, { backgroundColor: C.card, borderColor: C.border }, Shadows.sm]}>
              {ADMIN_SETTINGS.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.settingsItem, idx < ADMIN_SETTINGS.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.divider }]}
                  activeOpacity={0.7}
                  onPress={() => handlePress(item)}>
                  <View style={[styles.settingsIconWrap, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon as any} size={19} color={item.color} />
                  </View>
                  <ThemedText style={[styles.settingsLabel, { color: C.text }]}>{item.label}</ThemedText>
                  <View style={[styles.chevronWrap, { backgroundColor: C.surface }]}>
                    <Ionicons name="chevron-forward" size={14} color={C.muted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Expert Section ── */}
        {(user?.role === 'Expert' || user?.role === 'Admin') && (
          <View style={styles.settingsSection}>
            <ThemedText style={[styles.settingsSectionTitle, { color: C.muted }]}>{EXPERT_SETTINGS.section}</ThemedText>
            <View style={[styles.settingsGroup, { backgroundColor: C.card, borderColor: C.border }, Shadows.sm]}>
              {EXPERT_SETTINGS.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.settingsItem, idx < EXPERT_SETTINGS.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.divider }]}
                  activeOpacity={0.7}
                  onPress={() => handlePress(item)}>
                  <View style={[styles.settingsIconWrap, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon as any} size={19} color={item.color} />
                  </View>
                  <ThemedText style={[styles.settingsLabel, { color: C.text }]}>{item.label}</ThemedText>
                  <View style={[styles.chevronWrap, { backgroundColor: C.surface }]}>
                    <Ionicons name="chevron-forward" size={14} color={C.muted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Settings ── */}
        {SETTINGS.map((section) => (
          <View key={section.section} style={styles.settingsSection}>
            <ThemedText style={[styles.settingsSectionTitle, { color: C.muted }]}>{section.section}</ThemedText>
            <View style={[styles.settingsGroup, { backgroundColor: C.card, borderColor: C.border }, Shadows.sm]}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.settingsItem, idx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.divider }]}
                  activeOpacity={0.7}
                  onPress={() => handlePress(item)}>
                  <View style={[styles.settingsIconWrap, { backgroundColor: item.color + '18' }]}>
                    <Ionicons
                      name={item.id === 'theme' ? (mode === 'dark' ? 'sunny-outline' : 'moon-outline') : item.icon as any}
                      size={19}
                      color={item.color}
                    />
                  </View>
                  <ThemedText style={[styles.settingsLabel, { color: C.text }]}>
                    {item.id === 'theme' ? (mode === 'dark' ? 'Light Mode' : 'Dark Mode') : item.label}
                  </ThemedText>
                  <View style={[styles.chevronWrap, { backgroundColor: C.surface }]}>
                    <Ionicons name="chevron-forward" size={14} color={C.muted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── Logout ── */}
        <TouchableOpacity style={[styles.logoutBtn, Shadows.xs]} onPress={logout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
        </TouchableOpacity>

        <ThemedText style={[styles.version, { color: C.muted }]}>AgriSense Lanka v1.0.0</ThemedText>
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
  scroll: { paddingTop: Spacing.xxl + Spacing.md },

  // ── Profile Header ──────────────────────────────
  profileHeaderBg: {
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Radius.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  headerBubble1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    top: -60, right: -40,
  },
  headerBubble2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    bottom: -30, left: -20,
  },
  avatarOuterRing: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: '#0F9D58',
    padding: 3,
    marginBottom: Spacing.md,
  },
  avatarInnerRing: {
    flex: 1,
    borderRadius: 50,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#FFFFFF' },
  userName: { fontSize: 22, fontWeight: '800', marginBottom: 4, letterSpacing: -0.3 },
  userEmail: { fontSize: 13, marginBottom: Spacing.sm },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: Radius.pill, borderWidth: 1,
  },
  roleBadgeText: { fontSize: 12, fontWeight: '700' },

  // ── Stats ──────────────────────────────────────
  statsRow: { flexDirection: 'row', marginHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.lg },
  statCard: {
    flex: 1, borderRadius: Radius.lg, padding: 14,
    alignItems: 'center', borderWidth: 1,
  },
  statIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // ── AI Banner ─────────────────────────────────
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: '#0F9D58',
    overflow: 'hidden',
    position: 'relative',
  },
  bannerBubble1: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: 40,
  },
  bannerBubble2: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: -30, left: -20,
  },
  aiBannerLeft: { flex: 1, zIndex: 1 },
  aiBannerRight: { zIndex: 1 },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.pill, alignSelf: 'flex-start', marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.30)',
  },
  aiBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2, color: '#FFFFFF' },
  aiBannerTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', marginBottom: 5, letterSpacing: -0.3 },
  aiBannerSubtitle: { fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.82)' },

  // ── Settings ──────────────────────────────────
  settingsSection: { marginBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  settingsSectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.0,
    textTransform: 'uppercase', marginBottom: 8,
  },
  settingsGroup: {
    borderRadius: Radius.xl, borderWidth: 1,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 15, paddingHorizontal: Spacing.md, gap: 14,
  },
  settingsIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  settingsLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  chevronWrap: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Logout ────────────────────────────────────
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: Spacing.lg, paddingVertical: 16,
    borderRadius: Radius.pill, borderWidth: 1.5,
    borderColor: '#EF444440', backgroundColor: '#FEE2E2',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
  version: { fontSize: 11, textAlign: 'center', marginTop: Spacing.lg },
});
