import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows } from '@/constants/theme';

export default function HelpScreen() {
    const router = useRouter();
    const C = useAppColors();

    const HELP_ITEMS = [
        { title: 'Farmer Dashboard Guide', icon: 'book-outline', color: '#0F9D58', route: '/profile/help/dashboard' },
        { title: 'Marketplace FAQ', icon: 'cart-outline', color: '#3B82F6', route: '/profile/help/marketplace' },
        { title: 'Disease Diagnosis Help', icon: 'medical-outline', color: '#EF4444', route: '/profile/help/diagnosis' },
        { title: 'Expert Consultation', icon: 'chatbubbles-outline', color: '#8B5CF6', route: '/profile/help/expert' },
    ];

    const handleTopicPress = (item: any) => {
        if (item.route) {
            router.push(item.route as any);
        }
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'Help & Support',
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
                    <MaterialCommunityIcons name="face-agent" size={64} color={C.primary} />
                    <ThemedText style={styles.title}>How can we help?</ThemedText>
                    <ThemedText style={[styles.subtitle, { color: C.muted }]}>
                        Find answers to your questions or get in touch with our team.
                    </ThemedText>
                </View>

                <ThemedText style={[styles.sectionTitle, { color: C.muted }]}>POPULAR TOPICS</ThemedText>
                <View style={[styles.group, { backgroundColor: C.card, borderColor: C.border }]}>
                    {HELP_ITEMS.map((item, idx) => (
                        <TouchableOpacity 
                            key={item.title} 
                            style={[styles.item, idx < HELP_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.divider }]}
                            onPress={() => handleTopicPress(item)}
                        >
                            <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
                                <Ionicons name={item.icon as any} size={20} color={item.color} />
                            </View>
                            <ThemedText style={styles.itemLabel}>{item.title}</ThemedText>
                            <Ionicons name="chevron-forward" size={16} color={C.muted} />
                        </TouchableOpacity>
                    ))}
                </View>

                <ThemedText style={[styles.sectionTitle, { color: C.muted, marginTop: 24 }]}>CONTACT US</ThemedText>
                <TouchableOpacity 
                    style={[styles.contactBtn, { backgroundColor: C.primaryDim, borderColor: C.primary + '30' }]}
                    onPress={() => Linking.openURL('mailto:support@agrisense.lk')}
                >
                    <Ionicons name="mail-outline" size={22} color={C.primary} />
                    <View style={styles.contactInfo}>
                        <ThemedText style={[styles.contactLabel, { color: C.text }]}>Email Support</ThemedText>
                        <ThemedText style={[styles.contactValue, { color: C.muted }]}>support@agrisense.lk</ThemedText>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.contactBtn, { backgroundColor: C.primaryDim, borderColor: C.primary + '30', marginTop: 12 }]}
                    onPress={() => Linking.openURL('tel:+94112345678')}
                >
                    <Ionicons name="call-outline" size={22} color={C.primary} />
                    <View style={styles.contactInfo}>
                        <ThemedText style={[styles.contactLabel, { color: C.text }]}>Hotline</ThemedText>
                        <ThemedText style={[styles.contactValue, { color: C.muted }]}>+94 11 234 5678</ThemedText>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: Spacing.lg },
    header: { alignItems: 'center', marginBottom: Spacing.xxl, gap: 12 },
    title: { fontSize: 24, fontWeight: '800' },
    subtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 30 },
    sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
    group: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
    item: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
    iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    itemLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
    contactBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: Radius.lg, borderWidth: 1, gap: 14 },
    contactInfo: { gap: 2 },
    contactLabel: { fontSize: 15, fontWeight: '700' },
    contactValue: { fontSize: 13 }
});
