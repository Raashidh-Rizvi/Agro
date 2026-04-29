import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { useAppColors, useAppTheme } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing } from '@/constants/theme';
import axios from 'axios';
import { API_URL } from '@/constants/Config';

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

  const fetchStats = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      Alert.alert('Coming Soon', `${item.label} feature is currently under development.`);
    }
  };

  const navigateToTab = (tab: string) => {
    router.push(`/(tabs)/${tab}` as any);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar style={C.statusBar} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarRing, Shadows.colored('#0F9D58')]}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{initials}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.userName, { color: C.text }]}>{user?.name || 'User'}</ThemedText>
          <ThemedText style={[styles.userEmail, { color: C.muted }]}>{user?.email || 'user@agrisense.lk'}</ThemedText>
          <View style={[styles.roleBadge, { backgroundColor: C.primaryDim, borderColor: C.primary + '40' }]}>
            <MaterialCommunityIcons 
              name={user?.role === 'Expert' ? 'school-outline' : user?.role === 'Admin' ? 'shield-account' : 'tractor'} 
              size={13} 
              color={C.primary} 
            />
            <ThemedText style={[styles.roleBadgeText, { color: C.primary }]}>{user?.role || 'Farmer'}</ThemedText>
          </View>
        </View>

        {/* Farm Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Crops',   value: stats.crops.toString(),   icon: 'leaf-outline'          as const, tab: 'crops' },
            { label: 'Queries', value: stats.queries.toString(), icon: 'chatbubble-outline'    as const, tab: 'expert-queries' },
            { label: 'Alerts',  value: stats.alerts.toString(),  icon: 'notifications-outline' as const, tab: 'alerts' },
          ].map((stat) => (

            <TouchableOpacity 
              key={stat.label} 
              style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() => navigateToTab(stat.tab)}
              activeOpacity={0.7}
            >
              <Ionicons name={stat.icon} size={18} color={C.primary} />
              <ThemedText style={[styles.statValue, { color: C.text }]}>{stat.value}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: C.muted }]}>{stat.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Advisor Banner */}
        <TouchableOpacity 
          style={[styles.aiBanner, { backgroundColor: C.primaryDim, borderColor: C.primary + '40' }]}
          onPress={() => Alert.alert('Available Soon', 'The AgriSense Pro subscription will be available soon!')}
          activeOpacity={0.8}
        >
          <View style={styles.aiBannerLeft}>
            <View style={[styles.aiBadge, { backgroundColor: C.primary + '20' }]}>
              <MaterialCommunityIcons name="chip" size={11} color={C.primary} />
              <ThemedText style={[styles.aiBadgeText, { color: C.primary }]}>AI ADVISOR</ThemedText>
            </View>
            <ThemedText style={[styles.aiBannerTitle, { color: C.text }]}>Upgrade to Pro</ThemedText>
            <ThemedText style={[styles.aiBannerSubtitle, { color: C.subtext }]}>
              Get unlimited AI insights, expert consultations & price alerts.
            </ThemedText>
          </View>
          <MaterialCommunityIcons name="robot-happy-outline" size={52} color={C.primary} style={{ opacity: 0.3 }} />
        </TouchableOpacity>

        {/* Admin Section */}
        {user?.role === 'Admin' && (
          <View style={styles.settingsSection}>
            <ThemedText style={[styles.settingsSectionTitle, { color: C.muted }]}>{ADMIN_SETTINGS.section}</ThemedText>
            <View style={[styles.settingsGroup, { backgroundColor: C.card, borderColor: C.border }]}>
              {ADMIN_SETTINGS.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.settingsItem, idx < ADMIN_SETTINGS.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.divider }]}
                  activeOpacity={0.7}
                  onPress={() => handlePress(item)}
                >
                  <View style={[styles.settingsIconWrap, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={19} color={item.color} />
                  </View>
                  <ThemedText style={[styles.settingsLabel, { color: C.text }]}>{item.label}</ThemedText>
                  <Ionicons name="chevron-forward" size={16} color={C.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Expert Section */}
        {(user?.role === 'Expert' || user?.role === 'Admin') && (
          <View style={styles.settingsSection}>
            <ThemedText style={[styles.settingsSectionTitle, { color: C.muted }]}>{EXPERT_SETTINGS.section}</ThemedText>
            <View style={[styles.settingsGroup, { backgroundColor: C.card, borderColor: C.border }]}>
              {EXPERT_SETTINGS.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.settingsItem, idx < EXPERT_SETTINGS.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.divider }]}
                  activeOpacity={0.7}
                  onPress={() => handlePress(item)}
                >
                  <View style={[styles.settingsIconWrap, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={19} color={item.color} />
                  </View>
                  <ThemedText style={[styles.settingsLabel, { color: C.text }]}>{item.label}</ThemedText>
                  <Ionicons name="chevron-forward" size={16} color={C.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Settings */}
        {SETTINGS.map((section) => (
          <View key={section.section} style={styles.settingsSection}>
            <ThemedText style={[styles.settingsSectionTitle, { color: C.muted }]}>{section.section}</ThemedText>
            <View style={[styles.settingsGroup, { backgroundColor: C.card, borderColor: C.border }]}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.settingsItem, idx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.divider }]}
                  activeOpacity={0.7}
                  onPress={() => handlePress(item)}
                >
                  <View style={[styles.settingsIconWrap, { backgroundColor: item.color + '15' }]}>
                    <Ionicons 
                      name={item.id === 'theme' ? (mode === 'dark' ? 'sunny-outline' : 'moon-outline') : item.icon as any} 
                      size={19} 
                      color={item.color} 
                    />
                  </View>
                  <ThemedText style={[styles.settingsLabel, { color: C.text }]}>
                    {item.id === 'theme' ? (mode === 'dark' ? 'Light Mode' : 'Dark Mode') : item.label}
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={16} color={C.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
        </TouchableOpacity>

        <ThemedText style={[styles.version, { color: C.muted }]}>AgriSense Lanka v1.0.0</ThemedText>
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: Spacing.xxl + Spacing.sm },
  profileHeader: { alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  avatarRing: { width: 96, height: 96, borderRadius: 48, padding: 3, backgroundColor: '#0F9D58', marginBottom: Spacing.md },
  avatar: { flex: 1, borderRadius: 44, backgroundColor: '#0B6B3A', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  userName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  userEmail: { fontSize: 13, marginBottom: Spacing.sm },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 5, borderRadius: Radius.pill, borderWidth: 1 },
  roleBadgeText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.lg },
  statCard: { flex: 1, borderRadius: Radius.md, padding: 14, alignItems: 'center', borderWidth: 1, ...Shadows.sm },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: 6 },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  aiBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1.5, marginBottom: Spacing.lg, overflow: 'hidden' },
  aiBannerLeft: { flex: 1 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.pill, alignSelf: 'flex-start', marginBottom: 6 },
  aiBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  aiBannerTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  aiBannerSubtitle: { fontSize: 12, lineHeight: 17 },
  settingsSection: { marginBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  settingsSectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  settingsGroup: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden', ...Shadows.xs },
  settingsItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: Spacing.md, gap: 14 },
  settingsIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: Spacing.lg, paddingVertical: 15, borderRadius: Radius.pill, borderWidth: 1.5, borderColor: '#EF444440', backgroundColor: '#FEE2E2' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
  version: { fontSize: 11, textAlign: 'center', marginTop: Spacing.lg },
});
