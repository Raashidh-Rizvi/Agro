import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { useAppColors } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing } from '@/constants/theme';

const SETTINGS = [
  {
    section: 'Account',
    items: [
      { id: 'edit',   icon: 'person-outline',             label: 'Edit Profile',         color: '#0F9D58' },
      { id: 'farm',   icon: 'leaf-outline',               label: 'Farm Details',         color: '#0F9D58' },
      { id: 'pass',   icon: 'lock-closed-outline',        label: 'Change Password',      color: '#3B82F6' },
    ],
  },
  {
    section: 'Preferences',
    items: [
      { id: 'notif',  icon: 'notifications-outline',      label: 'Notifications',        color: '#F59E0B' },
      { id: 'lang',   icon: 'language-outline',           label: 'Language',             color: '#3B82F6' },
      { id: 'unit',   icon: 'scale-outline',              label: 'Units & Measurements', color: '#6B7280' },
    ],
  },
  {
    section: 'Support',
    items: [
      { id: 'help',   icon: 'help-circle-outline',        label: 'Help & Support',       color: '#6B7280' },
      { id: 'about',  icon: 'information-circle-outline', label: 'About AgriSense',      color: '#6B7280' },
      { id: 'privacy',icon: 'shield-checkmark-outline',   label: 'Privacy Policy',       color: '#6B7280' },
    ],
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const C = useAppColors();

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AS';

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
          <ThemedText style={[styles.userName, { color: C.text }]}>{user?.name || 'Farmer'}</ThemedText>
          <ThemedText style={[styles.userEmail, { color: C.muted }]}>{user?.email || 'farmer@agrisense.lk'}</ThemedText>
          <View style={[styles.roleBadge, { backgroundColor: C.primaryDim, borderColor: C.primary + '40' }]}>
            <MaterialCommunityIcons name="tractor" size={13} color={C.primary} />
            <ThemedText style={[styles.roleBadgeText, { color: C.primary }]}>{user?.role || 'Farmer'}</ThemedText>
          </View>
        </View>

        {/* Farm Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Crops',   value: '5',  icon: 'leaf-outline'          as const },
            { label: 'Queries', value: '12', icon: 'chatbubble-outline'    as const },
            { label: 'Alerts',  value: '8',  icon: 'notifications-outline' as const },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Ionicons name={stat.icon} size={18} color={C.primary} />
              <ThemedText style={[styles.statValue, { color: C.text }]}>{stat.value}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: C.muted }]}>{stat.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* AI Advisor Banner */}
        <View style={[styles.aiBanner, { backgroundColor: C.primaryDim, borderColor: C.primary + '40' }]}>
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
        </View>

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
