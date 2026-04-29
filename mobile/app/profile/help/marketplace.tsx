import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Spacing, Radius } from '@/constants/theme';

export default function MarketplaceFAQScreen() {
    const router = useRouter();
    const C = useAppColors();

    const FAQS = [
        { q: 'How do I list my produce?', a: 'Go to the Market tab and click the "+" button. Provide details about your crop, quantity, price, and upload a clear photo.' },
        { q: 'Who can see my listings?', a: 'All registered users on AgriSense Lanka can see your listings. They can contact you directly if they are interested in buying.' },
        { q: 'Are there any fees?', a: 'AgriSense Lanka is currently free for farmers to list their produce. We do not charge commission on sales.' },
        { q: 'How do I update a listing?', a: 'Go to "My Listings" in the Market tab, select the item you want to change, and click Edit.' },
    ];

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'Marketplace FAQ',
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
                    <Ionicons name="cart-outline" size={48} color={C.primary} />
                    <ThemedText style={styles.title}>Marketplace FAQ</ThemedText>
                </View>

                {FAQS.map((faq) => (
                    <View key={faq.q} style={[styles.faqCard, { backgroundColor: C.card, borderColor: C.border }]}>
                        <ThemedText style={styles.question}>Q: {faq.q}</ThemedText>
                        <View style={[styles.divider, { backgroundColor: C.divider }]} />
                        <ThemedText style={[styles.answer, { color: C.subtext }]}>{faq.a}</ThemedText>
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
    faqCard: { padding: 16, borderRadius: Radius.lg, borderWidth: 1, marginBottom: 16, gap: 10 },
    question: { fontSize: 16, fontWeight: '700' },
    divider: { height: 1 },
    answer: { fontSize: 14, lineHeight: 20 }
});
