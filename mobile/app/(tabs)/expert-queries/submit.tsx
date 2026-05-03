import React, { useState, useEffect } from 'react';
import { View, Alert, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Shadows, Colors } from '@/constants/theme';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../constants/Config';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function SubmitQuery() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cropId, setCropId] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [crops, setCrops] = useState<string[]>([]);
  const { token } = useAuth();
  const router = useRouter();

  // In a real app we would fetch the crops from /api/crops
  useEffect(() => {
    // Mock crops for the sake of presentation
    setCrops([
      'Rice',
      'Tea',
      'Coconut',
      'Rubber',
      'Banana',
    ]);
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const submitQuery = async () => {
    if (!title || !description || !cropId) {
      Alert.alert('Missing Info', 'Please fill all the required fields (Title, Description, and Crop).');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('cropId', cropId);
      if (image) {
        const uri = image.uri;
        const type = image.mimeType || 'image/jpeg';
        const name = image.fileName || `query_${Date.now()}.jpg`;
        
        console.log('--- DEBUG: Image Prep ---');
        console.log('URI:', uri.substring(0, 30) + '...');
        console.log('Platform:', Platform.OS);
        
        if (Platform.OS === 'web') {
          try {
            const response = await fetch(uri);
            const blob = await response.blob();
            console.log('Web: Blob created successfully', { size: blob.size, type: blob.type });
            formData.append('image', blob, name);
          } catch (err) {
            console.error('Web: Blob conversion failed', err);
            // Fallback if blob conversion fails
            formData.append('image', uri);
          }
        } else {
          // On Native
          console.log('Native: Appending as object');
          formData.append('image', {
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            type,
            name,
          } as any);
        }
      }

      const response = await fetch(`${API_URL}/expert-query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // FormData handles content-type automatically
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          router.back();
        }, 2500);
      } else {
        Alert.alert('Error', data.message || 'Failed to submit query. Ensure crop exists in DB.');
      }
    } catch (error) {
      Alert.alert('Error', 'Submission failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  if (submitted) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <IconSymbol name="checkmark.circle.fill" size={64} color={colors.primary} />
        <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary, marginTop: 16 }}>Submitted Successfully!</ThemedText>
        <ThemedText style={{ fontSize: 16, color: colors.subtext, marginTop: 8 }}>Your query is now with our experts.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Ask an Expert' }} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          
          <ThemedView style={[styles.headerInfo, { backgroundColor: colors.cardTint }]}>
            <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
            <ThemedText style={[styles.headerInfoText, { color: colors.primary }]}>
              Our agricultural experts will securely analyze your question and provide personalized advice.
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedView style={[styles.field, { backgroundColor: 'transparent' }]}>
              <ThemedText style={styles.label}>Question Title <ThemedText style={styles.required}>*</ThemedText></ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="E.g., Yellow spots on rice leaves"
                placeholderTextColor={colors.placeholder}
                value={title}
                onChangeText={setTitle}
              />
            </ThemedView>

            <ThemedView style={[styles.field, { backgroundColor: 'transparent' }]}>
              <ThemedText style={styles.label}>Crop Name <ThemedText style={styles.required}>*</ThemedText></ThemedText>
              <TextInput
                style={[styles.input, { marginBottom: 12, backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Type crop name or select from below"
                placeholderTextColor={colors.placeholder}
                value={cropId}
                onChangeText={setCropId}
              />
              <ThemedView style={[styles.cropList, { backgroundColor: 'transparent' }]}>
                {crops.map(crop => (
                  <TouchableOpacity 
                    key={crop} 
                    style={[styles.cropChip, { backgroundColor: colors.surface, borderColor: colors.border }, cropId === crop && { backgroundColor: colors.primary, borderColor: colors.primary }]} 
                    onPress={() => setCropId(crop)}
                  >
                    <ThemedText style={[styles.cropChipText, { color: colors.subtext }, cropId === crop && styles.cropChipTextActive]}>
                      {crop}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedView style={[styles.field, { backgroundColor: 'transparent' }]}>
              <ThemedText style={styles.label}>Detailed Description <ThemedText style={styles.required}>*</ThemedText></ThemedText>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Please describe the symptoms, duration, and any other relevant details..."
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={6}
                value={description}
                onChangeText={setDescription}
              />
            </ThemedView>

            <ThemedView style={[styles.field, { backgroundColor: 'transparent' }]}>
              <ThemedText style={styles.label}>Photo of the Problem</ThemedText>
              
              {image ? (
                <ThemedView style={[styles.imagePreviewContainer, { backgroundColor: 'transparent' }]}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} contentFit="cover" />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
                    <IconSymbol name="xmark.circle.fill" size={28} color="#FF3B30" />
                  </TouchableOpacity>
                </ThemedView>
              ) : (
                <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.primary, backgroundColor: colors.surface }]} onPress={pickImage}>
                  <IconSymbol name="camera.fill" size={32} color={colors.primary} />
                  <ThemedText style={[styles.uploadText, { color: colors.primary }]}>Tap to select an image</ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          </ThemedView>
        </ScrollView>

        <ThemedView style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]} 
            onPress={submitQuery} 
            disabled={loading}
          >
            {loading ? (
               <View style={styles.loadingRow}>
                 <ActivityIndicator color="white" />
                 <ThemedText style={styles.submitText}>Submitting...</ThemedText>
               </View>
            ) : (
              <ThemedText style={styles.submitText}>Submit Query</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerInfo: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerInfoText: {
    flex: 1,
    marginLeft: 12,
    fontWeight: '500',
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    ...Shadows.xs,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    height: 140,
    textAlignVertical: 'top',
  },
  cropList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
  },
  cropChipActive: {
  },
  cropChipText: {
    fontWeight: '500',
  },
  cropChipTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  uploadBox: {
    width: '50%',
    height: 250,
    alignSelf: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  imagePreviewContainer: {
    width: '50%',
    alignSelf: 'center',
    position: 'relative',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 450,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 14,
    ...Shadows.xs,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#7DBA9B',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
