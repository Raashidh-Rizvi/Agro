import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing } from '@/constants/theme';

export default function AboutScreen() {
    const router = useRouter();
    const C = useAppColors();

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'About AgriSense',
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
                    <View style={[styles.logoWrap, { backgroundColor: C.primary }]}>
                        <Ionicons name="leaf" size={60} color="#FFF" />
                    </View>
                    <ThemedText style={styles.appName}>AgriSense Lanka</ThemedText>
                    <ThemedText style={[styles.version, { color: C.muted }]}>Version 1.0.0 (Build 104)</ThemedText>
                </View>

                <View style={styles.content}>
                    <ThemedText style={styles.sectionTitle}>Our Mission</ThemedText>
                    <ThemedText style={[styles.text, { color: C.subtext }]}>
                        AgriSense Lanka is dedicated to empowering Sri Lankan farmers through cutting-edge technology. Our goal is to bridge the gap between traditional agricultural wisdom and modern AI insights, ensuring food security and economic prosperity for our nation's growers.
                    </ThemedText>

                    <ThemedText style={styles.sectionTitle}>Key Features</ThemedText>
                    <View style={styles.featureList}>
                        {[
                            { icon: 'scan', text: 'AI Disease Diagnosis' },
                            { icon: 'stats-chart', text: 'Real-time Market Prices' },
                            { icon: 'people', text: 'Expert Consultations' },
                            { icon: 'notifications', text: 'Weather & Pest Alerts' },
                        ].map((f) => (
                            <View key={f.text} style={styles.featureItem}>
                                <Ionicons name={f.icon as any} size={20} color={C.primary} />
                                <ThemedText style={[styles.featureText, { color: C.text }]}>{f.text}</ThemedText>
                            </View>
                        ))}
                    </View>

                    <ThemedText style={styles.sectionTitle}>Follow Us</ThemedText>
                    <View style={styles.socials}>
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: C.card }]}>
                            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: C.card }]}>
                            <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: C.card }]}>
                            <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: C.card }]}>
                            <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ThemedText style={[styles.footer, { color: C.muted }]}>
                    © 2026 AgriSense Lanka (Pvt) Ltd. All rights reserved.
                </ThemedText>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: Spacing.lg },
    header: { alignItems: 'center', marginVertical: Spacing.xl },
    logoWrap: { width: 100, height: 100, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    appName: { fontSize: 28, fontWeight: '800' },
    version: { fontSize: 14, marginTop: 4 },
    content: { gap: Spacing.lg },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
    text: { fontSize: 15, lineHeight: 22 },
    featureList: { gap: 12 },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    featureText: { fontSize: 15, fontWeight: '500' },
    socials: { flexDirection: 'row', gap: 16, marginTop: 8 },
    socialBtn: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#00000010' },
    footer: { textAlign: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.xl, fontSize: 12 }
});
