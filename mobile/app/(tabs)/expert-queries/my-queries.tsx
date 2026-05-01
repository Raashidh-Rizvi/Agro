import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, Alert, StyleSheet, TouchableOpacity, Text, View, ActivityIndicator, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Shadows } from '@/constants/theme';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../constants/Config';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Query {
  _id: string;
  title: string;
  status: 'pending' | 'answered';
  createdAt: string;
  cropId?: { name: string };
  reply?: string;
  imageUrl?: string;
}

export default function QueriesList() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user, token } = useAuth();
  const router = useRouter();

  const fetchQueries = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const endpoint = `${API_URL}/expert-query/my`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setQueries(data.data);
      } else {
        console.error('Failed to parse queries:', data.message);
      }
    } catch (error) {
      console.error('Fetch err:', error);
      Alert.alert('Error', 'Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchQueries();
    }, [user, token])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQueries();
    setRefreshing(false);
  };

  const deleteConfirm = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this query?')) {
        executeDelete(id);
      }
    } else {
      Alert.alert(
        'Delete Query',
        'Are you sure you want to delete this query?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => executeDelete(id) }
        ]
      );
    }
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/expert-query/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setQueries(prev => prev.filter(q => q._id !== id));
      } else {
        Alert.alert('Error', data.message || 'Delete failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error while deleting');
    }
  };

const renderQuery = ({ item }: { item: Query }) => {
    const isAnswered = item.status === 'answered';
    
    return (
      <TouchableOpacity style={styles.queryCard} onPress={() => router.push({ pathname: '/expert-queries/edit', params: { id: item._id } })} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, isAnswered ? styles.statusAnswered : styles.statusPending]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <TouchableOpacity 
              onPress={() => deleteConfirm(item._id)} 
              style={{ marginLeft: 12 }}
            >
              <IconSymbol name="trash" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        
        {item.imageUrl && (
          <Image 
            source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL.replace('/api', '')}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}` }} 
            style={styles.queryImage} 
            contentFit="cover"
            onError={(e) => console.log('MyQuery Image Load Error:', (e as any)?.nativeEvent?.error || (e as any)?.error || 'Unknown error')}
          />
        )}
        
        {item.cropId && (
          <Text style={styles.cropName}>Crop: {typeof item.cropId === 'object' ? item.cropId.name : item.cropId}</Text>
        )}
        
        <View style={styles.cardFooter}>
          <Text style={styles.viewDetails}>{isAnswered ? 'View Details' : 'View & Edit'}</Text>
          <IconSymbol name={isAnswered ? "info.circle.fill" : "pencil.circle.fill"} size={16} color="#0A5C36" />
        </View>
      </TouchableOpacity>
    );
  };


  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A5C36" />
      </View>
    );
  }

return (
  <View style={styles.container}>
    <Stack.Screen 
      options={{ 
        title: 'My Queries',
        headerRight: user?.role === 'Expert' ? undefined : () => (
          <TouchableOpacity onPress={() => router.push('/expert-queries/submit')} style={styles.headerButton}>
            <IconSymbol name="plus" size={24} color="#0A5C36" />
          </TouchableOpacity>
        )
      }} 
    />
    
    {user?.role !== 'Expert' && (
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={() => router.push('/expert-queries/submit')}
        >
          <IconSymbol name="plus.circle.fill" size={20} color="white" />
          <Text style={styles.createButtonText}>Ask an Expert</Text>
        </TouchableOpacity>
      </View>
    )}

    <FlatList
      data={queries}
      renderItem={renderQuery}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0A5C36" />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <IconSymbol name="doc.text.magnifyingglass" size={48} color="#999" />
          <Text style={styles.emptyText}>No queries found.</Text>
          <Text style={styles.emptySubtext}>Submit your first query to get expert advice!</Text>
        </View>
      }
    />
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  queryCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusPending: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFE69C',
    borderWidth: 1,
  },
  statusAnswered: {
    backgroundColor: '#D1E7DD',
    borderColor: '#A3CFBB',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 6,
  },
  cropName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  queryImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A5C36',
    marginRight: 4,
  },
  headerButton: {
    marginRight: 16,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  createButton: {
    backgroundColor: '#0A5C36',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    ...Shadows.colored('#0A5C36'),
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});
