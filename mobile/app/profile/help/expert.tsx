import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Spacing, Radius } from '@/constants/theme';

export default function ExpertHelpScreen() {
    const router = useRouter();
    const C = useAppColors();

    const PROCESS = [
        { title: 'Submit a Query', content: 'Describe the issue you are facing and upload 1-3 photos of your crops.' },
        { title: 'Expert Review', content: 'Our verified agricultural experts will review your query within 24-48 hours.' },
        { title: 'Receive Advice', content: 'You will receive a notification once an expert has responded with a recommended treatment plan.' },
    ];

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'Expert Consultation',
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
                    <Ionicons name="chatbubbles-outline" size={48} color="#8B5CF6" />
                    <ThemedText style={styles.title}>Talking to Experts</ThemedText>
                </View>

                <ThemedText style={[styles.intro, { color: C.subtext }]}>
                    Connect with real agricultural experts to get personalized advice for your farm.
                </ThemedText>

                <View style={styles.processList}>
                    {PROCESS.map((p, idx) => (
                        <View key={p.title} style={styles.processItem}>
                            <View style={styles.processLeft}>
                                <View style={[styles.dot, { backgroundColor: C.primary }]} />
                                {idx < PROCESS.length - 1 && <View style={[styles.line, { backgroundColor: C.divider }]} />}
                            </View>
                            <View style={styles.processRight}>
                                <ThemedText style={styles.processTitle}>{p.title}</ThemedText>
                                <ThemedText style={[styles.processText, { color: C.subtext }]}>{p.content}</ThemedText>
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: C.primary }]}
                    onPress={() => router.push('/(tabs)/expert-queries')}
                >
                    <ThemedText style={styles.actionBtnText}>Start a Consultation</ThemedText>
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: Spacing.lg },
    header: { alignItems: 'center', marginBottom: Spacing.md, gap: 10 },
    title: { fontSize: 22, fontWeight: '800' },
    intro: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: Spacing.xxl, paddingHorizontal: 20 },
    processList: { paddingHorizontal: 10 },
    processItem: { flexDirection: 'row', gap: 20 },
    processLeft: { alignItems: 'center' },
    dot: { width: 12, height: 12, borderRadius: 6 },
    line: { width: 2, flex: 1, marginVertical: 4 },
    processRight: { flex: 1, paddingBottom: 30 },
    processTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
    processText: { fontSize: 14, lineHeight: 20 },
    actionBtn: { height: 55, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg },
    actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
