import React, { useState, useEffect } from 'react';
import { View, Alert, ScrollView, Image, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../constants/Config';
import { IconSymbol } from '@/components/ui/icon-symbol';

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

  if (submitted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <IconSymbol name="checkmark.circle.fill" size={64} color="#0A5C36" />
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0A5C36', marginTop: 16 }}>Submitted Successfully!</Text>
        <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>Your query is now with our experts.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Ask an Expert' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerInfo}>
          <IconSymbol name="info.circle.fill" size={24} color="#0A5C36" />
          <Text style={styles.headerInfoText}>
            Our agricultural experts will securely analyze your question and provide personalized advice.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Question Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Yellow spots on rice leaves"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Crop Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, { marginBottom: 12 }]}
              placeholder="Type crop name or select from below"
              value={cropId}
              onChangeText={setCropId}
            />
            <View style={styles.cropList}>
              {crops.map(crop => (
                <TouchableOpacity 
                  key={crop} 
                  style={[styles.cropChip, cropId === crop && styles.cropChipActive]} 
                  onPress={() => setCropId(crop)}
                >
                  <Text style={[styles.cropChipText, cropId === crop && styles.cropChipTextActive]}>
                    {crop}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Detailed Description <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Please describe the symptoms, duration, and any other relevant details..."
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Photo of the Problem</Text>
            
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
                  <IconSymbol name="xmark.circle.fill" size={28} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                <IconSymbol name="camera.fill" size={32} color="#0A5C36" />
                <Text style={styles.uploadText}>Tap to select an image</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={submitQuery} 
          disabled={loading}
        >
          {loading ? (
             <View style={styles.loadingRow}>
               <ActivityIndicator color="white" />
               <Text style={styles.submitText}>Submitting...</Text>
             </View>
          ) : (
            <Text style={styles.submitText}>Submit Query</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
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
    backgroundColor: '#E6F4EA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerInfoText: {
    flex: 1,
    marginLeft: 12,
    color: '#0A5C36',
    fontWeight: '500',
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
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
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    marginRight: 8,
  },
  cropChipActive: {
    backgroundColor: '#0A5C36',
    borderColor: '#0A5C36',
  },
  cropChipText: {
    color: '#4B5563',
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
    borderColor: '#0A5C36',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
  },
  uploadText: {
    marginTop: 8,
    color: '#0A5C36',
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#0A5C36',
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
