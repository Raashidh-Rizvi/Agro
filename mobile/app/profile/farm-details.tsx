import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows } from '@/constants/theme';
import ValidationModal from '@/components/ValidationModal';

export default function FarmDetailsScreen() {
    const { user, updateProfile } = useAuth();
    const router = useRouter();
    const C = useAppColors();

    const [farmName, setFarmName] = useState(user?.farmName || '');
    const [location, setLocation] = useState(user?.location || '');
    const [farmSize, setFarmSize] = useState(user?.farmSize?.toString() || '');
    const [farmType, setFarmType] = useState(user?.farmType || '');
    const [loading, setLoading] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'error' as 'error' | 'success' });

    const showModal = (title: string, message: string, type: 'error' | 'success' = 'error') => {
        setModalConfig({ title, message, type });
        setModalVisible(true);
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await updateProfile({ 
                farmName, 
                location, 
                farmSize: farmSize ? parseFloat(farmSize) : undefined, 
                farmType 
            });
            showModal('Success', 'Farm details updated successfully', 'success');
        } catch (error: any) {
            showModal('Error', error.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'Farm Details',
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
                    <MaterialCommunityIcons name="home-outline" size={60} color={C.primary} />
                    <ThemedText style={styles.headerTitle}>Manage Your Farm</ThemedText>
                    <ThemedText style={[styles.headerSubtitle, { color: C.muted }]}>
                        Tell us more about your agricultural setup to get better AI insights.
                    </ThemedText>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={[styles.label, { color: C.muted }]}>FARM NAME</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
                            value={farmName}
                            onChangeText={setFarmName}
                            placeholder="e.g. Green Valley Farm"
                            placeholderTextColor={C.muted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={[styles.label, { color: C.muted }]}>LOCATION</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="e.g. Anuradhapura, Sri Lanka"
                            placeholderTextColor={C.muted}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <ThemedText style={[styles.label, { color: C.muted }]}>SIZE (ACRES)</ThemedText>
                            <TextInput
                                style={[styles.input, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
                                value={farmSize}
                                onChangeText={setFarmSize}
                                placeholder="0.0"
                                placeholderTextColor={C.muted}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1.5 }]}>
                            <ThemedText style={[styles.label, { color: C.muted }]}>FARM TYPE</ThemedText>
                            <TextInput
                                style={[styles.input, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
                                value={farmType}
                                onChangeText={setFarmType}
                                placeholder="e.g. Mixed Cropping"
                                placeholderTextColor={C.muted}
                            />
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.saveBtn, { backgroundColor: C.primary }]} 
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <ThemedText style={styles.saveBtnText}>Save Farm Details</ThemedText>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <ValidationModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onClose={() => {
                    setModalVisible(false);
                    if (modalConfig.type === 'success') router.back();
                }}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: Spacing.lg },
    header: { alignItems: 'center', marginBottom: Spacing.xl, gap: 10 },
    headerTitle: { fontSize: 24, fontWeight: '800' },
    headerSubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
    form: { gap: Spacing.lg },
    inputGroup: { gap: 8 },
    row: { flexDirection: 'row', gap: 15 },
    label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    input: { height: 50, borderRadius: Radius.md, paddingHorizontal: 16, borderWidth: 1, fontSize: 16 },
    saveBtn: { height: 55, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg, ...Shadows.md },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
