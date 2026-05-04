import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Platform, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing, Typography } from '@/constants/theme';
import { DiagnosisResult, DiagnosisService } from '../../services/DiagnosisService';
import { ScanResultModal } from '@/components/ScanResultModal';
import ValidationModal from '@/components/ValidationModal';

export default function DiagnosisLandingScreen() {
  const C = useAppColors();
  const router = useRouter();

  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [validationVisible, setValidationVisible] = useState(false);
  const [validationConfig, setValidationConfig] = useState<{
      title: string;
      message: string;
      type: 'error' | 'success';
  }>({
      title: '',
      message: '',
      type: 'error'
  });

  const showValidation = (title: string, message: string, type: 'error' | 'success' = 'error') => {
      setValidationConfig({ title, message, type });
      setValidationVisible(true);
  };

  const handlePickImage = async (useCamera: boolean) => {
    try {
      let permissionResult;
      if (useCamera) {
        if (Platform.OS === 'web') {
          showValidation('Not Supported', 'Camera is not supported in the browser. Please use the Expo Go app.');
          return;
        }
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        const msg = `We need ${useCamera ? 'camera' : 'gallery'} permissions to analyze your crop.`;
        showValidation('Permission Denied', msg);
        return;
      }

      const pickerResult = useCamera 
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (pickerResult.canceled) return;

      const uri = pickerResult.assets[0].uri;
      setSelectedImage(uri);
      setResult(null);
      setModalVisible(true);
      setIsScanning(true);

      const diagnosis = await DiagnosisService.predict(uri);
      setResult(diagnosis);
    } catch (error: any) {
      setModalVisible(false);
      console.error('Diagnosis Error:', error);
      const msg = error.message || 'Could not analyze the image. Please try again.';
      showValidation('Analysis Failed', msg);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <Stack.Screen
        options={{
          title: 'AI Disease Scanner',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.text,
        }}
      />
      <StatusBar style={C.statusBar} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: C.primaryDim }]}>
            <MaterialCommunityIcons name="leaf" size={80} color={C.primary} />
          </View>
          <ThemedText style={styles.title}>Instant Diagnosis</ThemedText>
          <ThemedText style={[styles.subtitle, { color: C.subtext }]}>
            Identify plant diseases in seconds. Our AI analyzes leaf patterns to provide treatment advice.
          </ThemedText>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: C.primary }, Shadows.md]}
            onPress={() => handlePickImage(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={24} color="#FFFFFF" />
            <ThemedText style={styles.buttonText}>Take a Photo</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineButton, { borderColor: C.primary }]}
            onPress={() => handlePickImage(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="images-outline" size={24} color={C.primary} />
            <ThemedText style={[styles.outlineButtonText, { color: C.primary }]}>Upload from Gallery</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={[styles.tipsContainer, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color={C.accent} />
            <ThemedText style={styles.tipsTitle}>Scanning Tips</ThemedText>
          </View>
          <View style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: C.primary }]} />
            <ThemedText style={[styles.tipText, { color: C.subtext }]}>Focus on a single leaf with symptoms</ThemedText>
          </View>
          <View style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: C.primary }]} />
            <ThemedText style={[styles.tipText, { color: C.subtext }]}>Ensure bright, natural lighting</ThemedText>
          </View>
          <View style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: C.primary }]} />
            <ThemedText style={[styles.tipText, { color: C.subtext }]}>Keep the camera steady and close</ThemedText>
          </View>
        </View>

        {/* History Access */}
        <TouchableOpacity
          style={styles.historyLink}
          onPress={() => router.push('/diagnosis/history')}
        >
          <Ionicons name="time-outline" size={18} color={C.primary} />
          <ThemedText style={[styles.historyLinkText, { color: C.primary }]}>View Scan History</ThemedText>
          <Ionicons name="chevron-forward" size={16} color={C.primary} />
        </TouchableOpacity>
      </ScrollView>

      <ScanResultModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setSelectedImage(null); }}
        result={result}
        isLoading={isScanning}
        selectedImage={selectedImage}
      />
      <ValidationModal
        visible={validationVisible}
        title={validationConfig.title}
        message={validationConfig.message}
        type={validationConfig.type}
        onClose={() => setValidationVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.xl, alignItems: 'center' },
  heroSection: { alignItems: 'center', marginBottom: Spacing.xxl, marginTop: Spacing.lg },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: { ...Typography.h1, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 10 },
  
  actionSection: { width: '100%', gap: 16, marginBottom: Spacing.xxl },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: Radius.lg,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: Radius.lg,
    borderWidth: 2,
  },
  outlineButtonText: { fontSize: 18, fontWeight: '800' },

  tipsContainer: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  tipsTitle: { fontSize: 16, fontWeight: '800' },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  tipDot: { width: 6, height: 6, borderRadius: 3 },
  tipText: { fontSize: 14, fontWeight: '500' },

  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  historyLinkText: { fontSize: 15, fontWeight: '700' },
});
