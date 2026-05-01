import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Spacing, Radius } from '@/constants/theme';

export default function DashboardGuideScreen() {
    const router = useRouter();
    const C = useAppColors();

    const STEPS = [
        { title: 'Home Overview', content: 'The home screen gives you a snapshot of your farm, including current weather, active alerts, and quick actions.' },
        { title: 'Crops Management', content: 'Track your planting cycles, set reminders for fertilizer application, and record harvest data.' },
        { title: 'Market Insights', content: 'Check real-time prices for your produce and manage your listings in the marketplace.' },
        { title: 'Expert Help', content: 'If you see something unusual with your crops, use the AI Diagnosis or talk to an Expert.' },
    ];

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'Dashboard Guide',
                headerShown: true,
                headerStyle: { backgroundColor: C.card },
                headerTintColor: C.text,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                        <Ionicons name="arrow-back" size={24} color={C.text} />
                    </TouchableOpacity>
                )
            }} />
            
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Ionicons name="speedometer-outline" size={48} color={C.primary} />
                    <ThemedText style={styles.title}>Using your Dashboard</ThemedText>
                </View>

                {STEPS.map((step, idx) => (
                    <View key={step.title} style={[styles.stepCard, { backgroundColor: C.card, borderColor: C.border }]}>
                        <View style={[styles.stepNumber, { backgroundColor: C.primary }]}>
                            <ThemedText style={styles.stepNumberText}>{idx + 1}</ThemedText>
                        </View>
                        <View style={styles.stepContent}>
                            <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
                            <ThemedText style={[styles.stepText, { color: C.subtext }]}>{step.content}</ThemedText>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: Spacing.lg },
    header: { alignItems: 'center', marginBottom: Spacing.xl, gap: 10 },
    title: { fontSize: 22, fontWeight: '800' },
    stepCard: { flexDirection: 'row', padding: 16, borderRadius: Radius.lg, borderWidth: 1, marginBottom: 16, gap: 16 },
    stepNumber: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    stepNumberText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
    stepContent: { flex: 1, gap: 4 },
    stepTitle: { fontSize: 17, fontWeight: '700' },
    stepText: { fontSize: 14, lineHeight: 20 }
});
