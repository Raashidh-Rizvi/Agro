import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows } from '@/constants/theme';
import ValidationModal from '@/components/ValidationModal';

export default function UnitsScreen() {
    const router = useRouter();
    const C = useAppColors();
    const [system, setSystem] = useState('metric');

    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'error' as 'error' | 'success' });

    const showModal = (title: string, message: string, type: 'error' | 'success' = 'error') => {
        setModalConfig({ title, message, type });
        setModalVisible(true);
    };

    const handleSave = () => {
        showModal('Success', 'Measurement units updated successfully!', 'success');
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'Units & Measurements',
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
                    <MaterialCommunityIcons name="scale" size={60} color={C.primary} />
                    <ThemedText style={styles.title}>Unit System</ThemedText>
                    <ThemedText style={[styles.subtitle, { color: C.muted }]}>
                        Choose how you want to see measurements for land area, weight, and volume.
                    </ThemedText>
                </View>

                <View style={styles.list}>
                    <TouchableOpacity 
                        style={[
                            styles.item, 
                            { backgroundColor: C.card, borderColor: system === 'metric' ? C.primary : C.border }
                        ]}
                        onPress={() => setSystem('metric')}
                    >
                        <View style={styles.itemHeader}>
                            <ThemedText style={styles.label}>Metric System</ThemedText>
                            {system === 'metric' && <Ionicons name="checkmark-circle" size={24} color={C.primary} />}
                        </View>
                        <ThemedText style={[styles.description, { color: C.muted }]}>
                            Hectares, Kilograms, Liters, Celsius
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[
                            styles.item, 
                            { backgroundColor: C.card, borderColor: system === 'imperial' ? C.primary : C.border }
                        ]}
                        onPress={() => setSystem('imperial')}
                    >
                        <View style={styles.itemHeader}>
                            <ThemedText style={styles.label}>Imperial System</ThemedText>
                            {system === 'imperial' && <Ionicons name="checkmark-circle" size={24} color={C.primary} />}
                        </View>
                        <ThemedText style={[styles.description, { color: C.muted }]}>
                            Acres, Pounds, Gallons, Fahrenheit
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={[styles.saveBtn, { backgroundColor: C.primary }]} 
                    onPress={handleSave}
                >
                    <ThemedText style={styles.saveBtnText}>Save Settings</ThemedText>
                </TouchableOpacity>
            </ScrollView>
            <ValidationModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onClose={() => {
                    setModalVisible(false);
                    if (modalConfig.type === 'success') {
                        router.back();
                    }
                }}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: Spacing.lg },
    header: { alignItems: 'center', marginBottom: Spacing.xl, gap: 10 },
    title: { fontSize: 24, fontWeight: '800' },
    subtitle: { fontSize: 14, textAlign: 'center', color: '#6B7280' },
    list: { gap: Spacing.md },
    item: { padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5, ...Shadows.sm },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    label: { fontSize: 18, fontWeight: '700' },
    description: { fontSize: 13 },
    saveBtn: { height: 55, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xxl, ...Shadows.md },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
