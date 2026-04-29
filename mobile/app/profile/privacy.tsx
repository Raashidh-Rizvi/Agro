import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Spacing } from '@/constants/theme';

export default function PrivacyScreen() {
    const router = useRouter();
    const C = useAppColors();

    const SECTIONS = [
        {
            title: '1. Information We Collect',
            content: 'We collect information you provide directly to us, such as when you create or modify your account, request support, or otherwise communicate with us. This includes your name, email, farm details, and any images you upload for crop diagnosis.'
        },
        {
            title: '2. Use of Information',
            content: 'We use the information we collect to provide, maintain, and improve our services, such as analyzing crop images to provide health insights, connecting you with agricultural experts, and personalizing your experience.'
        },
        {
            title: '3. Sharing of Information',
            content: 'We do not share your personal information with third parties except as described in this policy, such as when you consult with an expert or if required by law.'
        },
        {
            title: '4. Data Security',
            content: 'We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.'
        },
        {
            title: '5. Your Choices',
            content: 'You may update your account information at any time by logging into your account settings. You can also delete your account by contacting us.'
        }
    ];

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'Privacy Policy',
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
                <ThemedText style={styles.title}>Privacy Policy</ThemedText>
                <ThemedText style={[styles.lastUpdated, { color: C.muted }]}>Last Updated: April 29, 2026</ThemedText>
                
                <ThemedText style={[styles.intro, { color: C.subtext }]}>
                    AgriSense Lanka values your privacy. This policy explains how we collect, use, and protect your information when you use our mobile application.
                </ThemedText>

                <View style={styles.content}>
                    {SECTIONS.map((s) => (
                        <View key={s.title} style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>{s.title}</ThemedText>
                            <ThemedText style={[styles.sectionContent, { color: C.subtext }]}>{s.content}</ThemedText>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <ThemedText style={[styles.footerText, { color: C.muted }]}>
                        If you have any questions about this Privacy Policy, please contact us at privacy@agrisense.lk
                    </ThemedText>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: Spacing.lg },
    title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
    lastUpdated: { fontSize: 13, marginBottom: 16 },
    intro: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.xl },
    content: { gap: Spacing.xl },
    section: { gap: 8 },
    sectionTitle: { fontSize: 17, fontWeight: '700' },
    sectionContent: { fontSize: 14, lineHeight: 20 },
    footer: { marginTop: Spacing.xxl, marginBottom: Spacing.xxl, padding: 16, backgroundColor: '#00000005', borderRadius: 12 },
    footerText: { fontSize: 13, textAlign: 'center', fontStyle: 'italic' }
});
