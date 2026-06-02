import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Tabs, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../constants/Config';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import ValidationModal from '@/components/ValidationModal';

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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
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
        showModal('Error', 'Query not editable or not found', 'error', () => router.back());
      }
    } catch (error) {
      showModal('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchQuery();
  }, [fetchQuery]);

  const handleUpdate = async () => {
    if (!editingTitle.trim() || !editingDescription.trim()) {
      showModal('Error', 'Title and description required');
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
        showModal('Updated', 'Query updated successfully', 'success', () => router.back());
      } else {
        showModal('Error', data.message || 'Update failed');
      }
    } catch (err) {
      showModal('Error', 'Network error');
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
          showModal('Deleted', 'Query deleted', 'success', () => router.back());
        } else {
          showModal('Error', data.message || 'Delete failed');
        }
      } catch (err) {
        showModal('Error', 'Network error while deleting');
      } finally {
        setSubmitting(false);
      }
    };

    showModal(
      'Delete Query',
      'Are you sure?',
      'confirm',
      executeDelete,
      'Delete'
    );
  };

  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (!query) return null;

  const SERVER_BASE = API_URL.replace('/api', '');
  const isAnswered = query.status === 'answered';

  return (
    <ThemedView style={{ flex: 1 }}>
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
            style={[styles.image, { backgroundColor: colors.surface }]} 
            contentFit="contain"
            onError={(e) => console.log('Edit Image Load Error:', (e as any)?.nativeEvent?.error || (e as any)?.error || 'Unknown error')}
          />
        )}

        {!isAnswered && (
          <ThemedView style={[styles.field, { backgroundColor: 'transparent', paddingHorizontal: 20, marginTop: 12 }]}>
            <ThemedText style={styles.label}>Photo of the Problem</ThemedText>
            {newImage ? (
              <ThemedView style={[styles.imagePreviewContainer, { backgroundColor: 'transparent' }]}>
                <Image source={{ uri: newImage.uri }} style={styles.imagePreview} contentFit="cover" />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => setNewImage(null)}>
                  <IconSymbol name="xmark.circle.fill" size={28} color="#FF3B30" />
                </TouchableOpacity>
              </ThemedView>
            ) : query.imageUrl ? (
              <View>
                <ThemedText style={{ fontSize: 14, color: colors.subtext, marginBottom: 8 }}>Current photo shown above</ThemedText>
                <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.primary, backgroundColor: colors.surface }]} onPress={pickImage}>
                  <IconSymbol name="camera.fill" size={32} color={colors.primary} />
                  <ThemedText style={[styles.uploadText, { color: colors.primary }]}>Tap to change photo</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.removeBtn, { backgroundColor: theme === 'dark' ? '#3D1A1A' : '#FFEBEE', borderColor: theme === 'dark' ? '#5A2A2A' : '#FFCDD2' }]} 
                  onPress={() => {
                    setRemovePhoto(!removePhoto);
                  }}
                >
                  <ThemedText style={styles.removeBtnText}>
                    {removePhoto ? 'Cancel Remove' : 'Remove Photo'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.primary, backgroundColor: colors.surface }]} onPress={pickImage}>
                <IconSymbol name="camera.fill" size={32} color={colors.primary} />
                <ThemedText style={[styles.uploadText, { color: colors.primary }]}>Tap to add photo</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        )}

        <ThemedView style={[styles.form, { backgroundColor: 'transparent' }]}>
          <ThemedText style={styles.label}>Title</ThemedText>
          {isAnswered ? (
            <ThemedView style={[styles.readOnlyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ThemedText style={[styles.readOnlyText, { color: colors.text }]}>{query.title}</ThemedText>
            </ThemedView>
          ) : (
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={editingTitle}
              onChangeText={setEditingTitle}
              placeholder="Query title"
              placeholderTextColor={colors.placeholder}
            />
          )}

          <ThemedText style={styles.label}>Description</ThemedText>
          {isAnswered ? (
            <ThemedView style={[styles.readOnlyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ThemedText style={[styles.readOnlyText, { color: colors.text }]}>{query.description}</ThemedText>
            </ThemedView>
          ) : (
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={editingDescription}
              onChangeText={setEditingDescription}
              multiline
              numberOfLines={4}
              placeholder="Describe your query..."
              placeholderTextColor={colors.placeholder}
            />
          )}

          {query.cropId && (
            <ThemedView style={[styles.cropTag, { backgroundColor: colors.cardTint }]}>
              <ThemedText style={[styles.cropText, { color: colors.primary }]}>Crop: {typeof query.cropId === 'object' ? query.cropId.name : query.cropId}</ThemedText>
            </ThemedView>
          )}

          {isAnswered && query.reply && (
            <ThemedView style={[styles.replyBox, { backgroundColor: colors.cardTint, borderColor: colors.border }]}>
              <ThemedText style={[styles.replyLabel, { color: colors.primary }]}>Expert&apos;s Reply:</ThemedText>
              <ThemedText style={[styles.replyText, { color: colors.text }]}>{query.reply}</ThemedText>
            </ThemedView>
          )}

          {isAnswered ? (
            <ThemedView style={[styles.actionButtons, { backgroundColor: 'transparent' }]}>
              <TouchableOpacity 
                style={[styles.deleteBtnInline, { backgroundColor: theme === 'dark' ? '#3D1A1A' : '#FFEBEE', borderColor: theme === 'dark' ? '#5A2A2A' : '#FFCDD2', borderStyle: 'dashed' }]} 
                onPress={handleDelete}
                disabled={submitting}
              >
                <ThemedText style={styles.deleteBtnText}>Delete History</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <ThemedView style={[styles.actionButtons, { backgroundColor: 'transparent' }]}>
              <TouchableOpacity 
                style={[styles.updateBtn, { backgroundColor: colors.primary }, submitting && styles.disabledBtn]} 
                onPress={handleUpdate}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText style={styles.updateBtnText}>Update</ThemedText>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.deleteBtnInline, { backgroundColor: theme === 'dark' ? '#3D1A1A' : '#FFEBEE', borderColor: theme === 'dark' ? '#5A2A2A' : '#FFCDD2' }]} 
                onPress={handleDelete}
                disabled={submitting}
              >
                <ThemedText style={styles.deleteBtnText}>Delete</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
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
  container: {
    flex: 1,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
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
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadText: {
    marginTop: 12,
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
  },
  form: {
    padding: 20,
    gap: 16,
  },
  readOnlyBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  readOnlyText: {
    fontSize: 16,
  },
  replyBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  replyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  replyText: {
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  cropTag: {
    padding: 12,
    borderRadius: 8,
  },
  cropText: {
    fontWeight: '600',
  },
  updateBtn: {
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
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flex: 1,
  },
  deleteBtnText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

