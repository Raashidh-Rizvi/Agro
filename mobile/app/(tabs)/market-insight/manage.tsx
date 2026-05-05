import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Pressable, FlatList } from 'react-native';
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
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [showDistrictModal, setShowDistrictModal] = useState(false);

    const showError = (title: string, message: string) => {
        setModalTitle(title);
        setModalMessage(message);
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
            Alert.alert('Error', 'Failed to load price details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.cropName || !formData.district || !formData.price || !formData.unit || !formData.trend) {
            showError('Missing Fields', 'Please fill in all required fields');
            return;
        }

        const priceValue = parseFloat(formData.price);
        if (isNaN(priceValue) || priceValue <= 0) {
            showError('Invalid Price', 'Price must be a positive number');
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
                Alert.alert('Success', 'Market price updated successfully');
            } else {
                await MarketPriceService.create(payload);
                Alert.alert('Success', 'Market price added successfully');
            }
            router.push('/(tabs)/market-insight');
        } catch (error: any) {
            console.error('Error saving:', error);
            showError('Error', error.message || 'Failed to save market price');
        } finally {
            setSubmitting(false);
        }
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
                <View style={{ width: 30 }} />
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
                    <TouchableOpacity 
                        style={[styles.dropdownTrigger, { backgroundColor: C.card, borderColor: C.border }]}
                        onPress={() => setShowDistrictModal(true)}
                    >
                        <ThemedText style={[
                            styles.dropdownText, 
                            { color: formData.district ? C.text : C.muted }
                        ]}>
                            {formData.district || 'Select a district'}
                        </ThemedText>
                        <Ionicons name="chevron-down" size={20} color={C.muted} />
                    </TouchableOpacity>
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
                title={modalTitle}
                message={modalMessage}
                onClose={() => setModalVisible(false)}
            />

            {/* District Selector Modal */}
            <Modal
                visible={showDistrictModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDistrictModal(false)}
            >
                <Pressable 
                    style={styles.modalOverlay} 
                    onPress={() => setShowDistrictModal(false)}
                >
                    <ThemedView style={[styles.modalContent, { backgroundColor: C.card }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Select District</ThemedText>
                            <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                                <Ionicons name="close" size={24} color={C.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={DISTRICTS}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[
                                        styles.districtOption, 
                                        { borderBottomColor: C.border },
                                        formData.district === item && { backgroundColor: C.primary + '15' }
                                    ]}
                                    onPress={() => {
                                        setFormData(prev => ({ ...prev, district: item }));
                                        setShowDistrictModal(false);
                                    }}
                                >
                                    <ThemedText style={[
                                        styles.districtOptionText, 
                                        formData.district === item && { color: C.primary, fontWeight: '700' }
                                    ]}>{item}</ThemedText>
                                    {formData.district === item && <Ionicons name="checkmark" size={20} color={C.primary} />}
                                </TouchableOpacity>
                            )}
                        />
                    </ThemedView>
                </Pressable>
            </Modal>
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
    dropdownTrigger: {
        height: 50,
        borderRadius: Radius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownText: { fontSize: 16 },
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
    
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '70%',
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        padding: Spacing.lg,
        ...Shadows.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    districtOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: Spacing.sm,
        borderBottomWidth: 1,
    },
    districtOptionText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
