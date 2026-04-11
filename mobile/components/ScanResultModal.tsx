import React from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows, Typography } from '@/constants/theme';
import { DiagnosisResult } from '../services/DiagnosisService';

interface ScanResultModalProps {
    visible: boolean;
    onClose: () => void;
    result: DiagnosisResult | null;
    isLoading: boolean;
}

export function ScanResultModal({ visible, onClose, result, isLoading }: ScanResultModalProps) {
    const C = useAppColors();

    if (!visible) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <ThemedView style={[styles.modalView, { backgroundColor: C.card }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText style={styles.modalTitle}>Scan Analysis</ThemedText>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={C.text} />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <MaterialCommunityIcons name="molecule" size={60} color={C.primary} style={styles.loadingIcon} />
                            <ThemedText style={styles.loadingText}>Analyzing leaf patterns...</ThemedText>
                            <ThemedText style={[styles.subText, { color: C.muted }]}>Our AI is diagnosing the condition</ThemedText>
                        </View>
                    ) : result ? (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                            {/* Status and Confidence Badges */}
                            <View style={styles.badgeRow}>
                                <View style={[
                                    styles.confidenceBadge, 
                                    { backgroundColor: result.isMock ? C.dangerDim : C.primaryDim }
                                ]}>
                                    <ThemedText style={[
                                        styles.confidenceText, 
                                        { color: result.isMock ? C.danger : C.primary }
                                    ]}>
                                        {result.isMock ? 'SIMULATION' : 'REAL AI'}
                                    </ThemedText>
                                </View>
                                
                                <View style={[styles.confidenceBadge, { backgroundColor: C.primaryDim }]}>
                                    <ThemedText style={[styles.confidenceText, { color: C.primary }]}>
                                        Confidence: {(result.confidenceScore * 100).toFixed(1)}%
                                    </ThemedText>
                                </View>
                            </View>

                            <ThemedText style={[styles.diseaseName, { color: C.primary }]}>
                                {result.diseaseName.replace(/_/g, ' ')}
                            </ThemedText>

                            <View style={[styles.divider, { backgroundColor: C.border }]} />

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="shield-checkmark-outline" size={20} color={C.primary} />
                                    <ThemedText style={styles.sectionTitle}>Management Recommendation</ThemedText>
                                </View>
                                <ThemedText style={[styles.recommendationText, { color: C.subtext }]}>
                                    {result.recommendation}
                                </ThemedText>
                            </View>

                            <View style={[
                                styles.infoBox, 
                                { backgroundColor: result.isMock ? C.dangerDim : C.primaryDim }
                            ]}>
                                <Ionicons 
                                    name={result.isMock ? "alert-circle-outline" : "information-circle-outline"} 
                                    size={20} 
                                    color={result.isMock ? C.danger : C.primary} 
                                />
                                <ThemedText style={[
                                    styles.infoText, 
                                    { color: result.isMock ? C.danger : C.primary }
                                ]}>
                                    {result.isMock 
                                        ? "This is a SIMULATED result because the Real AI Model (.onnx) is not yet loaded. Follow the RUN_GUIDE to enable Real AI."
                                        : "This result was generated by an AI model. For critical crops, we recommend consultation with a local agronomist."
                                    }
                                </ThemedText>
                            </View>

                            <TouchableOpacity 
                                style={[styles.actionButton, { backgroundColor: C.primary }]}
                                onPress={onClose}
                            >
                                <ThemedText style={styles.buttonText}>Got it</ThemedText>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={50} color={C.danger} />
                            <ThemedText style={styles.errorText}>No result available</ThemedText>
                        </View>
                    )}
                </ThemedView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        padding: Spacing.lg,
        height: '75%',
        ...Shadows.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    modalTitle: {
        ...Typography.h3,
        fontWeight: '800',
    },
    closeButton: {
        padding: 5,
    },
    scrollContent: {
        paddingBottom: Spacing.xl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingIcon: {
        marginBottom: Spacing.md,
    },
    loadingText: {
        ...Typography.h3,
        marginBottom: 8,
    },
    subText: {
        fontSize: 14,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    confidenceBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: Radius.pill,
        marginBottom: Spacing.sm,
    },
    confidenceText: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    diseaseName: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: Spacing.md,
        textTransform: 'capitalize',
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: Spacing.lg,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    recommendationText: {
        fontSize: 14,
        lineHeight: 22,
    },
    infoBox: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderRadius: Radius.md,
        gap: 12,
        alignItems: 'flex-start',
        marginBottom: Spacing.xl,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        fontStyle: 'italic',
    },
    actionButton: {
        paddingVertical: 16,
        borderRadius: Radius.lg,
        alignItems: 'center',
        ...Shadows.md,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    errorText: {
        fontSize: 16,
        fontWeight: '600',
    }
});
