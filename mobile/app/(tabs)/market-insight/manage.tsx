import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing, Typography } from '@/constants/theme';
import { MarketPriceService } from '@/services/MarketPriceService';
import ValidationModal from '@/components/ValidationModal';

const DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
].sort();

const TRENDS = [
    { label: 'Stable', value: 'stable', icon: 'remove', color: '#6B7280' },
    { label: 'Rising', value: 'up', icon: 'trending-up', color: '#10B981' },
    { label: 'Falling', value: 'down', icon: 'trending-down', color: '#EF4444' },
];

export default function ManageMarketPriceScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const C = useAppColors();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        cropName: '',
        district: '',
        price: '',
        unit: 'kg',
        trend: 'stable' as 'up' | 'down' | 'stable'
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type: 'error' | 'success' | 'confirm';
        onConfirm?: () => void;
        confirmText?: string;
    }>({
        title: '',
        message: '',
        type: 'error'
    });

    const showModal = (title: string, message: string, type: 'error' | 'success' | 'confirm' = 'error', onConfirm?: () => void, confirmText?: string) => {
        setModalConfig({ title, message, type, onConfirm, confirmText });
        setModalVisible(true);
    };

    useEffect(() => {
        if (id) {
            fetchPriceDetails();
        }
    }, [id]);

    const fetchPriceDetails = async () => {
        try {
            setLoading(true);
            const data = await MarketPriceService.getById(id!);
            setFormData({
                cropName: data.cropName,
                district: data.district,
                price: data.price.toString(),
                unit: data.unit,
                trend: data.trend
            });
        } catch (error) {
            console.error('Error fetching details:', error);
            showModal('Error', 'Failed to load price details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.cropName || !formData.district || !formData.price) {
            showModal('Missing Fields', 'Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                price: parseFloat(formData.price)
            };

            if (id) {
                await MarketPriceService.update(id, payload);
                showModal('Success', 'Market price updated successfully', 'success', () => router.back());
            } else {
                await MarketPriceService.create(payload);
                showModal('Success', 'Market price added successfully', 'success', () => router.back());
            }
        } catch (error: any) {
            console.error('Error saving:', error);
            showModal('Error', error.message || 'Failed to save market price');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = () => {
        showModal(
            'Delete Price',
            'Are you sure you want to delete this market price?',
            'confirm',
            async () => {
                try {
                    setSubmitting(true);
                    await MarketPriceService.delete(id!);
                    router.back();
                } catch (error) {
                    showModal('Error', 'Failed to delete price');
                } finally {
                    setSubmitting(false);
                }
            },
            'Delete'
        );
    };

    if (loading) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ActivityIndicator size="large" color={C.primary} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={C.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>{id ? 'Edit Price' : 'Add New Price'}</ThemedText>
                {!!id && (
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                        <Ionicons name="trash-outline" size={22} color="#EF4444" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Crop Name *</ThemedText>
                    <TextInput
                        style={[styles.input, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                        placeholder="e.g., Rice, Carrot, Onion"
                        placeholderTextColor={C.muted}
                        value={formData.cropName}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, cropName: val }))}
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>District *</ThemedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
                        {DISTRICTS.map(d => (
                            <TouchableOpacity
                                key={d}
                                style={[
                                    styles.tag,
                                    { borderColor: C.border },
                                    formData.district === d && { backgroundColor: C.primary, borderColor: C.primary }
                                ]}
                                onPress={() => setFormData(prev => ({ ...prev, district: d }))}
                            >
                                <ThemedText style={[
                                    styles.tagText,
                                    formData.district === d && { color: '#FFF' }
                                ]}>{d}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                        <ThemedText style={styles.label}>Price (Rs.) *</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                            placeholder="0.00"
                            placeholderTextColor={C.muted}
                            keyboardType="numeric"
                            value={formData.price}
                            onChangeText={(val) => setFormData(prev => ({ ...prev, price: val }))}
                        />
                    </View>
                    <View style={[styles.formGroup, { flex: 0.6 }]}>
                        <ThemedText style={styles.label}>Unit</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                            placeholder="kg"
                            placeholderTextColor={C.muted}
                            value={formData.unit}
                            onChangeText={(val) => setFormData(prev => ({ ...prev, unit: val }))}
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Price Trend</ThemedText>
                    <View style={styles.trendRow}>
                        {TRENDS.map(t => (
                            <TouchableOpacity
                                key={t.value}
                                style={[
                                    styles.trendOption,
                                    { borderColor: C.border },
                                    formData.trend === t.value && { backgroundColor: t.color + '20', borderColor: t.color }
                                ]}
                                onPress={() => setFormData(prev => ({ ...prev, trend: t.value as any }))}
                            >
                                <Ionicons name={t.icon as any} size={20} color={formData.trend === t.value ? t.color : C.muted} />
                                <ThemedText style={[
                                    styles.trendOptionText,
                                    { color: formData.trend === t.value ? t.color : C.muted }
                                ]}>{t.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: C.primary }]}
                    onPress={handleSave}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <ThemedText style={styles.submitButtonText}>{id ? 'Update Insight' : 'Publish Insight'}</ThemedText>
                    )}
                </TouchableOpacity>
            </ScrollView>
            <ValidationModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
                confirmText={modalConfig.confirmText}
                onClose={() => setModalVisible(false)}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xxl + Spacing.sm,
        paddingBottom: Spacing.md,
    },
    backButton: { padding: 4 },
    headerTitle: { ...Typography.h2, flex: 1, marginLeft: Spacing.md },
    deleteButton: { padding: 4 },
    scrollContent: { padding: Spacing.lg },
    formGroup: { marginBottom: Spacing.lg },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginLeft: 2 },
    input: {
        height: 50,
        borderRadius: Radius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
    },
    row: { flexDirection: 'row' },
    tagScroll: { marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
    tag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Radius.pill,
        borderWidth: 1,
        marginRight: 8,
    },
    tagText: { fontSize: 13, fontWeight: '600' },
    trendRow: { flexDirection: 'row', gap: 10 },
    trendOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: Radius.md,
        borderWidth: 1,
        gap: 6,
    },
    trendOptionText: { fontSize: 13, fontWeight: '700' },
    submitButton: {
        height: 56,
        borderRadius: Radius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xl,
        ...Shadows.md,
    },
    submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
