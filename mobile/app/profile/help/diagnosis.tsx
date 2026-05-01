import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Spacing, Radius } from '@/constants/theme';

export default function DiagnosisHelpScreen() {
    const router = useRouter();
    const C = useAppColors();

    const TIPS = [
        { icon: 'sunny-outline', text: 'Ensure there is plenty of natural light, but avoid direct harsh sunlight that creates strong shadows.' },
        { icon: 'camera-outline', text: 'Hold the camera about 15-20cm away from the leaf. Ensure the affected area is in focus.' },
        { icon: 'scan-outline', text: 'The AI works best when the leaf is flat and centered in the frame.' },
        { icon: 'alert-circle-outline', text: 'If the AI is unsure, you can always forward the results to an Expert for manual review.' },
    ];

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'Diagnosis Help',
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
                    <Ionicons name="medical-outline" size={48} color="#EF4444" />
                    <ThemedText style={styles.title}>Disease Diagnosis Guide</ThemedText>
                </View>
                
                <ThemedText style={[styles.intro, { color: C.subtext }]}>
                    Our AI model is trained on thousands of images to help you identify crop diseases early. Follow these tips for the most accurate results.
                </ThemedText>

                <View style={styles.tipsList}>
                    {TIPS.map((tip, idx) => (
                        <View key={idx} style={[styles.tipItem, { backgroundColor: C.card, borderColor: C.border }]}>
                            <View style={[styles.iconWrap, { backgroundColor: C.primaryDim }]}>
                                <Ionicons name={tip.icon as any} size={20} color={C.primary} />
                            </View>
                            <ThemedText style={[styles.tipText, { color: C.text }]}>{tip.text}</ThemedText>
                        </View>
                    ))}
                </View>

                <View style={[styles.warningBox, { backgroundColor: '#FEE2E2', borderColor: '#EF444430' }]}>
                    <Ionicons name="warning-outline" size={24} color="#EF4444" />
                    <ThemedText style={styles.warningText}>
                        AI diagnosis is a tool to assist you and is not a substitute for professional agricultural advice.
                    </ThemedText>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: Spacing.lg },
    header: { alignItems: 'center', marginBottom: Spacing.md, gap: 10 },
    title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
    intro: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: Spacing.xl },
    tipsList: { gap: 12 },
    tipItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: Radius.lg, borderWidth: 1, gap: 16 },
    iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    tipText: { flex: 1, fontSize: 14, lineHeight: 20 },
    warningBox: { flexDirection: 'row', padding: 16, borderRadius: Radius.lg, borderWidth: 1, marginTop: Spacing.xxl, gap: 12, alignItems: 'center' },
    warningText: { flex: 1, fontSize: 12, color: '#B91C1C', fontWeight: '500' }
});
