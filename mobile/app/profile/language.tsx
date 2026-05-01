import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows } from '@/constants/theme';

const LANGUAGES = [
    { id: 'en', label: 'English', native: 'English' },
    { id: 'si', label: 'Sinhala', native: 'සිංහල' },
    { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
];

export default function LanguageScreen() {
    const router = useRouter();
    const C = useAppColors();
    const [selected, setSelected] = useState('en');

    const handleSave = () => {
        Alert.alert('Success', 'Language settings updated successfully!', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'Language',
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
                <ThemedText style={[styles.title, { color: C.text }]}>Select Language</ThemedText>
                <ThemedText style={[styles.subtitle, { color: C.muted }]}>
                    Choose your preferred language for the application interface.
                </ThemedText>

                <View style={styles.list}>
                    {LANGUAGES.map((lang) => (
                        <TouchableOpacity 
                            key={lang.id} 
                            style={[
                                styles.item, 
                                { backgroundColor: C.card, borderColor: selected === lang.id ? C.primary : C.border }
                            ]}
                            onPress={() => setSelected(lang.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.itemInfo}>
                                <ThemedText style={styles.label}>{lang.label}</ThemedText>
                                <ThemedText style={[styles.nativeLabel, { color: C.muted }]}>{lang.native}</ThemedText>
                            </View>
                            {selected === lang.id && (
                                <Ionicons name="checkmark-circle" size={24} color={C.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity 
                    style={[styles.saveBtn, { backgroundColor: C.primary }]} 
                    onPress={handleSave}
                >
                    <ThemedText style={styles.saveBtnText}>Save Language</ThemedText>
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: Spacing.lg },
    title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
    subtitle: { fontSize: 14, marginBottom: Spacing.xl },
    list: { gap: Spacing.md },
    item: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: Spacing.md, 
        borderRadius: Radius.lg, 
        borderWidth: 1.5,
        justifyContent: 'space-between',
        ...Shadows.sm
    },
    itemInfo: { gap: 2 },
    label: { fontSize: 16, fontWeight: '700' },
    nativeLabel: { fontSize: 12 },
    saveBtn: { height: 55, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xxl, ...Shadows.md },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
