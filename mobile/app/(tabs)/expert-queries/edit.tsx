import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Tabs, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../constants/Config';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function MyQueryEdit() {
  const { id } = useLocalSearchParams();
  const { user, token } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newImage, setNewImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0]);
      setRemovePhoto(false);
    }
  };

  const fetchQuery = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/expert-query/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setQuery(data.data);
        setEditingTitle(data.data.title);
        setEditingDescription(data.data.description);
        setNewImage(null);
        setRemovePhoto(false);
      } else {
        Alert.alert('Error', 'Query not editable or not found');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchQuery();
  }, [fetchQuery]);

  const handleUpdate = async () => {
    if (!editingTitle.trim() || !editingDescription.trim()) {
      Alert.alert('Error', 'Title and description required');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', editingTitle);
      formData.append('description', editingDescription);
      if (newImage) {
        const uri = newImage.uri;
        const type = newImage.mimeType || 'image/jpeg';
        const name = newImage.fileName || `edit_${Date.now()}.jpg`;

        if (Platform.OS === 'web') {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append('image', blob, name);
        } else {
          formData.append('image', {
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            type,
            name,
          } as any);
        }
      }
      if (removePhoto && !newImage && query?.imageUrl) {
        formData.append('removeImage', 'true');
      }

      const res = await fetch(`${API_URL}/expert-query/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Updated', 'Query updated successfully');
        router.back();
      } else {
        Alert.alert('Error', data.message || 'Update failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const executeDelete = async () => {
      setSubmitting(true);
      try {
        const res = await fetch(`${API_URL}/expert-query/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          Alert.alert('Deleted', 'Query deleted');
          router.back();
        } else {
          Alert.alert('Error', data.message || 'Delete failed');
        }
      } catch (err) {
        Alert.alert('Error', 'Network error while deleting');
      } finally {
        setSubmitting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete Query: Are you sure?')) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Delete Query',
        'Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: executeDelete
          }
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A5C36" />
      </View>
    );
  }

  if (!query) return null;

  const SERVER_BASE = API_URL.replace('/api', '');
  const isAnswered = query.status === 'answered';

  return (
    <ScrollView style={styles.container}>
      <Tabs.Screen 
        options={{ 
          title: 'Edit My Query',
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={styles.headerDeleteBtn}>
              <IconSymbol name="trash" size={22} color="#FF3B30" />
            </TouchableOpacity>
          )
        }} 
      />

      {query.imageUrl && !removePhoto && (
        <Image 
          source={{ uri: query.imageUrl.startsWith('http') ? query.imageUrl : `${SERVER_BASE}${query.imageUrl.startsWith('/') ? '' : '/'}${query.imageUrl}` }} 
          style={styles.image} 
          contentFit="contain"
          onError={(e) => console.log('Edit Image Load Error:', (e as any)?.nativeEvent?.error || (e as any)?.error || 'Unknown error')}
        />
      )}

      {!isAnswered && (
        <View style={styles.field}>
          <Text style={styles.label}>Photo of the Problem</Text>
          {newImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: newImage.uri }} style={styles.imagePreview} contentFit="cover" />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setNewImage(null)}>
                <IconSymbol name="xmark.circle.fill" size={28} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : query.imageUrl ? (
            <View>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Current photo shown above</Text>
              <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                <IconSymbol name="camera.fill" size={32} color="#0A5C36" />
                <Text style={styles.uploadText}>Tap to change photo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.removeBtn} 
                onPress={() => {
                  setRemovePhoto(!removePhoto);
                }}
              >
                <Text style={styles.removeBtnText}>
                  {removePhoto ? 'Cancel Remove' : 'Remove Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
              <IconSymbol name="camera.fill" size={32} color="#0A5C36" />
              <Text style={styles.uploadText}>Tap to add photo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        {isAnswered ? (
          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>{query.title}</Text>
          </View>
        ) : (
          <TextInput
            style={styles.input}
            value={editingTitle}
            onChangeText={setEditingTitle}
            placeholder="Query title"
          />
        )}

        <Text style={styles.label}>Description</Text>
        {isAnswered ? (
          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>{query.description}</Text>
          </View>
        ) : (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editingDescription}
            onChangeText={setEditingDescription}
            multiline
            numberOfLines={4}
            placeholder="Describe your query..."
          />
        )}

        {query.cropId && (
          <View style={styles.cropTag}>
            <Text style={styles.cropText}>Crop: {typeof query.cropId === 'object' ? query.cropId.name : query.cropId}</Text>
          </View>
        )}

        {isAnswered && query.reply && (
          <View style={styles.replyBox}>
            <Text style={styles.replyLabel}>Expert&apos;s Reply:</Text>
            <Text style={styles.replyText}>{query.reply}</Text>
          </View>
        )}

        {isAnswered ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.deleteBtnInline, { borderStyle: 'dashed' }]} 
              onPress={handleDelete}
              disabled={submitting}
            >
              <Text style={styles.deleteBtnText}>Delete History</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.updateBtn, submitting && styles.disabledBtn]} 
              onPress={handleUpdate}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.updateBtnText}>Update</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteBtnInline} 
              onPress={handleDelete}
              disabled={submitting}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
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
  imagePreviewContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 14,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#0A5C36',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    marginBottom: 12,
  },
  uploadText: {
    marginTop: 12,
    color: '#0A5C36',
    fontWeight: '600',
    fontSize: 15,
  },
  removeBtn: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  removeBtnText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  photoField: {
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  form: {
    padding: 20,
    gap: 16,
  },
  readOnlyBox: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  readOnlyText: {
    fontSize: 16,
    color: '#374151',
  },
  replyBox: {
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#A3CFBB',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  replyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A5C36',
    marginBottom: 8,
  },
  replyText: {
    fontSize: 16,
    color: '#11181C',
    lineHeight: 24,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  cropTag: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
  },
  cropText: {
    color: '#0A5C36',
    fontWeight: '600',
  },
  updateBtn: {
    backgroundColor: '#0A5C36',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  disabledBtn: {
    backgroundColor: '#7DBA9B',
  },
  updateBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerDeleteBtn: {
    padding: 8,
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  deleteBtnInline: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    flex: 1,
  },
  deleteBtnText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

