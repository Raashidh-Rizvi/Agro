import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const quickActions = [
    { id: '1', title: 'Crop Health', icon: 'leaf', color: '#0A5C36' },
    { id: '2', title: 'Marketplace', icon: 'cart', color: '#0F5132' },
    { id: '3', title: 'Experts', icon: 'people', color: '#14452F' },
    { id: '4', title: 'Weather', icon: 'partly-sunny', color: '#18392B' },
  ];

  const recentAlerts = [
    { id: '1', title: 'Pest Alert', description: 'Possible fall armyworm detection in nearby areas.', time: '2h ago', type: 'danger' },
    { id: '2', title: 'Market Price', description: 'Rice prices increased by 5% today.', time: '5h ago', type: 'info' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>Welcome back,</ThemedText>
            <ThemedText style={styles.userName}>{user?.name || 'Farmer'}</ThemedText>
          </View>
          <TouchableOpacity onPress={logout} style={styles.profileButton}>
            <Ionicons name="log-out-outline" size={24} color={themeColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <ThemedText style={styles.statusTitle}>Optimal Planting Weather</ThemedText>
            <ThemedText style={styles.statusSubtitle}>Today is a great day for sowing paddy seeds.</ThemedText>
          </View>
          <View style={styles.statusIconContainer}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={42} color="white" />
          </View>
        </View>

        {/* Quick Actions Grid */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
        <View style={styles.grid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.gridItem}>
              <View style={[styles.iconContainer, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon as any} size={28} color={action.color} />
              </View>
              <ThemedText style={styles.gridText}>{action.title}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Alerts */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Alerts</ThemedText>
          <TouchableOpacity>
            <ThemedText style={{ color: themeColors.primary, fontWeight: '600' }}>View All</ThemedText>
          </TouchableOpacity>
        </View>
        {recentAlerts.map((alert) => (
          <TouchableOpacity key={alert.id} style={[styles.alertCard, { borderLeftColor: alert.type === 'danger' ? '#FF5252' : '#448AFF' }]}>
            <View style={styles.alertContent}>
              <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
              <ThemedText style={styles.alertDescription}>{alert.description}</ThemedText>
              <ThemedText style={styles.alertTime}>{alert.time}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    opacity: 0.6,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A5C36',
  },
  profileButton: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statusCard: {
    flexDirection: 'row',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#0A5C36', // Premium dark green background for primary status
    elevation: 8,
    shadowColor: '#0A5C36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1E293B',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
