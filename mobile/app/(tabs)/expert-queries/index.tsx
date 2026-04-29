import React, { useState, useCallback } from 'react';
import { FlatList, RefreshControl, Alert, StyleSheet, TouchableOpacity, Text, View, ActivityIndicator, TextInput } from 'react-native';
import { Shadows, Radius, Spacing } from '@/constants/theme';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../constants/Config';
import { IconSymbol } from '@/components/ui/icon-symbol';
import ExpertDashboard from '@/components/expert/ExpertDashboard';
import { Image } from 'expo-image';

interface Query {
  _id: string;
  title: string;
  status: 'pending' | 'answered';
  createdAt: string;
  cropId?: { name: string } | string;
  reply?: string;
  description?: string;
  updatedAt?: string;
  userId?: { name: string } | string;
  imageUrl?: string;
}

export default function QueriesScreen() {
  const { user } = useAuth();
  const [showQueries, setShowQueries] = useState(false);

  if (user?.role === 'Expert' && !showQueries) {
    return (
      <View style={{ flex: 1 }}>
        <Stack.Screen options={{ title: 'Expert Dashboard' }} />
        <ExpertDashboard onQueriesPress={() => setShowQueries(true)} />
        <TouchableOpacity 
          style={styles.floatingAction}
          onPress={() => setShowQueries(true)}
        >
          <IconSymbol name="chatbubbles.fill" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return <QueriesList onBack={user?.role === 'Expert' ? () => setShowQueries(false) : undefined} />;
}

function QueriesList({ onBack }: { onBack?: () => void }) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [answering, setAnswering] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user, token } = useAuth();
  const router = useRouter();

  const fetchQueries = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const endpoint = `${API_URL}/expert-query`;
      
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

  const submitReply = async (queryId: string) => {
    if (!replyText.trim()) {
      Alert.alert('Missing Info', 'Please enter your reply.');
      return;
    }
    setAnswering(true);
    try {
      const res = await fetch(`${API_URL}/expert-query/${queryId}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({ reply: replyText, status: 'answered' })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setReplyText('');
          setExpandedId(null);
          setEditingReplyId(null);
          fetchQueries();
        }, 2500);
      } else {
        Alert.alert('Error', data.message || 'Failed to submit answer');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error while submitting answer');
    } finally {
      setAnswering(false);
    }
  };

const renderQuery = ({ item }: { item: Query }) => {
    const isAnswered = item.status === 'answered';
    const isExpanded = expandedId === item._id;
    const isExpert = user?.role === 'Expert' || user?.role === 'Admin';
    let authorName = 'Unknown Farmer';
    if (typeof item.userId === 'object' && item.userId !== null && (item.userId as any).name) {
      authorName = (item.userId as any).name;
    } else if (item.userId) {
      authorName = String(item.userId);
    }
    
    return (
      <View style={styles.queryCard}>
        <TouchableOpacity 
          onPress={() => {
            setExpandedId(isExpanded ? null : item._id);
            if (!isExpanded) {
              setReplyText('');
              setEditingReplyId(null);
            }
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.statusBadge, isAnswered ? styles.statusAnswered : styles.statusPending]}>
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          
          <Text style={styles.title} numberOfLines={isExpanded ? 0 : 2}>{item.title}</Text>
          
          {!isExpanded && item.imageUrl && (
            <Image 
              source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL.replace('/api', '')}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}` }} 
              style={styles.thumbnailImage} 
              resizeMode="cover"
              onError={(e) => console.log('Thumbnail Load Error:', (e as any).nativeEvent?.error || 'Unknown error')}
            />
          )}

          {item.cropId && (
            <Text style={styles.cropName}>Crop: {typeof item.cropId === 'object' ? item.cropId.name : item.cropId}</Text>
          )}
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.expandedContent}>
            {item.imageUrl && (
              <Image 
                source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL.replace('/api', '')}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}` }} 
                style={styles.queryImage} 
                resizeMode="contain"
                onError={(e) => console.log('Full Image Load Error:', (e as any).nativeEvent?.error || 'Unknown error')}
              />
            )}
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.authorText}>Asked by: {authorName}</Text>
            
            {isAnswered && item.reply && (
              <View style={styles.replyBox}>
                <Text style={styles.replyLabel}>Expert's Reply:</Text>
                
                {editingReplyId === item._id ? (
                  <View style={[styles.expertReplyContainer, {marginTop: 8}]}>
                    <TextInput
                      style={styles.expertReplyInput}
                      multiline
                      numberOfLines={4}
                      placeholder="Edit your advice here..."
                      value={replyText}
                      onChangeText={setReplyText}
                    />
                    <View style={{flexDirection: 'row', gap: 8, marginTop: 4}}>
                      <TouchableOpacity 
                        style={[styles.submitReplyBtn, {flex: 1, backgroundColor: '#FF3B30'}]} 
                        onPress={() => setEditingReplyId(null)}
                      >
                         <Text style={styles.submitReplyBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.submitReplyBtn, {flex: 1}]} 
                        onPress={() => submitReply(item._id)}
                        disabled={answering}
                      >
                         {answering ? <ActivityIndicator color="white" /> : <Text style={styles.submitReplyBtnText}>Update</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.replyText}>{item.reply}</Text>
                    <View style={styles.replyFooter}>
                      <Text style={styles.replyDate}>
                        Answered: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                      {isExpert && (
                        <TouchableOpacity 
                          onPress={() => {
                            setReplyText(item.reply || '');
                            setEditingReplyId(item._id);
                          }}
                          style={{marginTop: 8}}
                        >
                          <Text style={{color: '#0A5C36', fontWeight: 'bold', fontSize: 13}}>Edit Reply</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
              </View>
            )}

            {!isAnswered && (
               <View style={styles.pendingFooter}>
                 {isExpert ? (
                   <View style={styles.expertReplyContainer}>
                     <Text style={styles.expertReplyTitle}>Answer Query:</Text>
                     <TextInput
                       style={styles.expertReplyInput}
                       multiline
                       numberOfLines={4}
                       placeholder="Provide your expert advice here..."
                       value={replyText}
                       onChangeText={setReplyText}
                     />
                     <TouchableOpacity 
                       style={styles.submitReplyBtn} 
                       onPress={() => submitReply(item._id)}
                       disabled={answering}
                     >
                        {answering ? <ActivityIndicator color="white" /> : <Text style={styles.submitReplyBtnText}>Submit Answer</Text>}
                     </TouchableOpacity>
                   </View>
                 ) : (
                   <Text style={styles.pendingFooterText}>Our experts are analyzing this inquiry...</Text>
                 )}
               </View>
            )}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.cardIndicator}
          onPress={() => {
            setExpandedId(isExpanded ? null : item._id);
            if (!isExpanded) {
              setReplyText('');
              setEditingReplyId(null);
            }
          }}
        >
           <Text style={styles.cardIndicatorText}>{isExpanded ? 'Hide Details' : 'View Details'}</Text>
        </TouchableOpacity>
      </View>
    );
  };


  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A5C36" />
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <IconSymbol name="checkmark.circle.fill" size={64} color="#0A5C36" />
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0A5C36', marginTop: 16 }}>Submitted Successfully!</Text>
        <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>Your answer has been recorded.</Text>
      </View>
    );
  }

return (
  <View style={styles.container}>
    <Stack.Screen 
      options={{ 
        title: 'All Queries',
        headerLeft: onBack ? () => (
          <TouchableOpacity onPress={onBack} style={{marginLeft: 16}}>
            <IconSymbol name="chevron.left" size={24} color="#0A5C36" />
          </TouchableOpacity>
        ) : undefined,
        headerRight: () => (
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
    marginBottom: 4,
    fontStyle: 'italic',
  },
  expandedContent: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  queryImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  thumbnailImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  authorText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  replyBox: {
    backgroundColor: '#E6F4EA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A3CFBB',
    marginTop: 8,
  },
  replyLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A5C36',
    marginBottom: 6,
  },
  replyText: {
    fontSize: 15,
    color: '#11181C',
    lineHeight: 22,
  },
  replyFooter: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  replyDate: {
    fontSize: 12,
    color: '#0A5C36',
    opacity: 0.8,
  },
  pendingFooter: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  pendingFooterText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  expertReplyContainer: {
    width: '100%',
    alignItems: 'stretch',
  },
  expertReplyTitle: {
    fontWeight: 'bold',
    color: '#0A5C36',
    marginBottom: 8,
  },
  expertReplyInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitReplyBtn: {
    backgroundColor: '#0A5C36',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitReplyBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cardIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cardIndicatorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A5C36',
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
    shadowColor: '#0A5C36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
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
  floatingAction: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A5C36',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
