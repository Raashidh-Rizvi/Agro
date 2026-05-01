import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows } from '@/constants/theme';
import api from '@/services/api';

interface ExpertDashboardProps {
    onQueriesPress?: () => void;
}

export default function ExpertDashboard({ onQueriesPress }: ExpertDashboardProps) {
    const { user, token } = useAuth();
    const router = useRouter();
    const C = useAppColors();

    const [stats, setStats] = useState({
        pendingQueries: 0,
        totalAnswers: 0,
        activeAlerts: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        if (!token) return;
        try {
            const queryRes = await api.get('/expert-query');
            const allQueries = queryRes.data.data || [];
            const pending = allQueries.filter((q: any) => q.status === 'pending').length;
            const answeredByMe = allQueries.filter((q: any) => q.status === 'answered').length; 

            const alertRes = await api.get('/alerts');
            const allAlerts = alertRes.data.alerts || [];
            
            setStats({
                pendingQueries: pending,
                totalAnswers: answeredByMe,
                activeAlerts: allAlerts.length
            });
        } catch (error) {
            console.error('Stats fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [token])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const QUICK_ACTIONS = [
        { id: 'queries', label: 'Farmer Queries', icon: 'chatbubbles-outline', color: '#8B5CF6', action: onQueriesPress || (() => {}) }, 
        { id: 'alerts',  label: 'Manage Alerts', icon: 'notifications-outline', color: '#F59E0B', route: '/(tabs)/alerts' },
        { id: 'profile', label: 'My Expert Profile', icon: 'person-outline', color: '#3B82F6', route: '/profile/edit' },
    ];

    if (loading && !refreshing) {
        return (
            <View style={[styles.center, { backgroundColor: C.bg }]}>
                <ActivityIndicator size="large" color={C.primary} />
            </View>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <ScrollView 
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <View style={[styles.welcomeBox, { backgroundColor: C.primary }]}>
                        <View>
                            <ThemedText style={styles.welcomeTitle}>Expert Workspace,</ThemedText>
                            <ThemedText style={styles.expertName}>{user?.name}</ThemedText>
                        </View>
                        <MaterialCommunityIcons name="shield-check-outline" size={40} color="#FFFFFF" opacity={0.8} />
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <View style={[styles.statBox, { backgroundColor: C.card, borderColor: C.border }]}>
                        <ThemedText style={[styles.statValue, { color: '#8B5CF6' }]}>{stats.pendingQueries}</ThemedText>
                        <ThemedText style={[styles.statLabel, { color: C.muted }]}>Pending</ThemedText>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: C.card, borderColor: C.border }]}>
                        <ThemedText style={[styles.statValue, { color: '#F59E0B' }]}>{stats.activeAlerts}</ThemedText>
                        <ThemedText style={[styles.statLabel, { color: C.muted }]}>Alerts</ThemedText>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: C.card, borderColor: C.border }]}>
                        <ThemedText style={[styles.statValue, { color: '#0F9D58' }]}>{stats.totalAnswers}</ThemedText>
                        <ThemedText style={[styles.statLabel, { color: C.muted }]}>Answered</ThemedText>
                    </View>
                </View>

                <ThemedText style={[styles.sectionTitle, { color: C.muted }]}>EXPERT TOOLS</ThemedText>
                <View style={styles.actionsList}>
                    {QUICK_ACTIONS.map((action) => (
                        <TouchableOpacity 
                            key={action.id} 
                            style={[styles.actionCard, { backgroundColor: C.card, borderColor: C.border }]}
                            onPress={() => action.route ? router.push(action.route as any) : action.action?.()}
                        >
                            <View style={[styles.iconWrap, { backgroundColor: action.color + '15' }]}>
                                <Ionicons name={action.icon as any} size={24} color={action.color} />
                            </View>
                            <View style={styles.actionInfo}>
                                <ThemedText style={styles.actionLabel}>{action.label}</ThemedText>
                                <ThemedText style={[styles.actionDesc, { color: C.muted }]}>
                                    {action.id === 'queries' ? 'View and respond to farmers' : 
                                     action.id === 'alerts' ? 'Post agricultural advisories' : 
                                     'Manage your credentials'}
                                </ThemedText>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={C.muted} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.activityCard}>
                    <ThemedText style={[styles.sectionTitle, { color: C.muted, paddingHorizontal: 0 }]}>COMMUNITY IMPACT</ThemedText>
                    <View style={[styles.impactBox, { backgroundColor: C.primaryDim, borderColor: C.primary + '30' }]}>
                        <MaterialCommunityIcons name="medal-outline" size={32} color={C.primary} />
                        <View style={{ flex: 1 }}>
                            <ThemedText style={styles.impactTitle}>Top Contributor</ThemedText>
                            <ThemedText style={[styles.impactText, { color: C.subtext }]}>
                                Your advice has helped farmers across Sri Lanka.
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { paddingBottom: Spacing.xl },
    header: { padding: Spacing.lg },
    welcomeBox: { 
        padding: 24, 
        borderRadius: Radius.xl, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        ...Shadows.md
    },
    welcomeTitle: { fontSize: 14, color: '#FFFFFF', opacity: 0.9 },
    expertName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
    statsGrid: { flexDirection: 'row', gap: 10, paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
    statBox: { flex: 1, padding: 12, borderRadius: Radius.lg, borderWidth: 1, alignItems: 'center', ...Shadows.xs },
    statValue: { fontSize: 20, fontWeight: '800' },
    statLabel: { fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
    sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1, paddingHorizontal: Spacing.lg, marginBottom: 12 },
    actionsList: { paddingHorizontal: Spacing.lg, gap: 12 },
    actionCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: Radius.lg, borderWidth: 1, gap: 14, ...Shadows.sm },
    iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionInfo: { flex: 1 },
    actionLabel: { fontSize: 15, fontWeight: '700' },
    actionDesc: { fontSize: 11, marginTop: 2 },
    activityCard: { padding: Spacing.lg },
    impactBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: Radius.lg, borderWidth: 1, gap: 14 },
    impactTitle: { fontSize: 15, fontWeight: '700' },
    impactText: { fontSize: 12, lineHeight: 18, marginTop: 2 }
});
