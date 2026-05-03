import React, { useState, useCallback } from 'react';
import { FlatList, RefreshControl, Alert, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { Shadows, Radius, Spacing, Colors } from '@/constants/theme';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../constants/Config';
import { IconSymbol } from '@/components/ui/icon-symbol';
import ExpertDashboard from '@/components/expert/ExpertDashboard';
import { Image } from 'expo-image';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

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
      <ThemedView style={{ flex: 1 }}>
        <Stack.Screen options={{ title: 'Expert Dashboard' }} />
        <ExpertDashboard onQueriesPress={() => setShowQueries(true)} />
        <TouchableOpacity 
          style={styles.floatingAction}
          onPress={() => setShowQueries(true)}
        >
          <IconSymbol name="bubble.left.and.bubble.right.fill" size={24} color="white" />
        </TouchableOpacity>
      </ThemedView>
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
    
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

    return (
      <ThemedView style={[styles.queryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
          <ThemedView style={[styles.cardHeader, { backgroundColor: 'transparent' }]}>
            <ThemedView style={[styles.statusBadge, isAnswered ? styles.statusAnswered : styles.statusPending]}>
              <ThemedText style={styles.statusText}>{item.status.toUpperCase()}</ThemedText>
            </ThemedView>
            <ThemedText style={[styles.date, { color: colors.subtext }]}>{new Date(item.createdAt).toLocaleDateString()}</ThemedText>
          </ThemedView>
          
          <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={isExpanded ? 0 : 2}>{item.title}</ThemedText>
          
          {!isExpanded && item.imageUrl && (
            <Image 
              source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL.replace('/api', '')}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}` }} 
              style={styles.thumbnailImage} 
              contentFit="cover"
              onError={(e) => console.log('Thumbnail Load Error:', (e as any)?.nativeEvent?.error || (e as any)?.error || 'Unknown error')}
            />
          )}

          {item.cropId && (
            <ThemedText style={[styles.cropName, { color: colors.subtext }]}>Crop: {typeof item.cropId === 'object' ? item.cropId.name : item.cropId}</ThemedText>
          )}
        </TouchableOpacity>
        
        {isExpanded && (
          <ThemedView style={[styles.expandedContent, { borderTopColor: colors.border, backgroundColor: 'transparent' }]}>
            {item.imageUrl && (
              <Image 
                source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL.replace('/api', '')}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}` }} 
                style={styles.queryImage} 
                contentFit="contain"
                onError={(e) => console.log('Full Image Load Error:', (e as any)?.nativeEvent?.error || (e as any)?.error || 'Unknown error')}
              />
            )}
            <ThemedText style={[styles.description, { color: colors.text }]}>{item.description}</ThemedText>
            <ThemedText style={[styles.authorText, { color: colors.subtext }]}>Asked by: {authorName}</ThemedText>
            
            {isAnswered && item.reply && (
              <ThemedView style={[styles.replyBox, { backgroundColor: colors.cardTint, borderColor: colors.border }]}>
                <ThemedText style={styles.replyLabel}>Expert&apos;s Reply:</ThemedText>
                
                {editingReplyId === item._id ? (
                  <ThemedView style={[styles.expertReplyContainer, { marginTop: 8, backgroundColor: 'transparent' }]}>
                    <TextInput
                      style={[styles.expertReplyInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                      multiline
                      numberOfLines={4}
                      placeholder="Edit your advice here..."
                      placeholderTextColor={colors.placeholder}
                      value={replyText}
                      onChangeText={setReplyText}
                    />
                    <ThemedView style={{ flexDirection: 'row', gap: 8, marginTop: 4, backgroundColor: 'transparent' }}>
                      <TouchableOpacity 
                        style={[styles.submitReplyBtn, { flex: 1, backgroundColor: '#FF3B30' }]} 
                        onPress={() => setEditingReplyId(null)}
                      >
                         <ThemedText style={styles.submitReplyBtnText}>Cancel</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.submitReplyBtn, { flex: 1 }]} 
                        onPress={() => submitReply(item._id)}
                        disabled={answering}
                      >
                         {answering ? <ActivityIndicator color="white" /> : <ThemedText style={styles.submitReplyBtnText}>Update</ThemedText>}
                      </TouchableOpacity>
                    </ThemedView>
                  </ThemedView>
                ) : (
                  <>
                    <ThemedText style={[styles.replyText, { color: colors.text }]}>{item.reply}</ThemedText>
                    <ThemedView style={[styles.replyFooter, { backgroundColor: 'transparent' }]}>
                      <ThemedText style={styles.replyDate}>
                        Answered: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                      </ThemedText>
                      {isExpert && (
                        <TouchableOpacity 
                          onPress={() => {
                            setReplyText(item.reply || '');
                            setEditingReplyId(item._id);
                          }}
                          style={{ marginTop: 8 }}
                        >
                          <ThemedText style={{ color: colors.primary, fontWeight: 'bold', fontSize: 13 }}>Edit Reply</ThemedText>
                        </TouchableOpacity>
                      )}
                    </ThemedView>
                  </>
                )}
              </ThemedView>
            )}

            {!isAnswered && (
               <ThemedView style={[styles.pendingFooter, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                 {isExpert ? (
                   <ThemedView style={[styles.expertReplyContainer, { backgroundColor: 'transparent' }]}>
                     <ThemedText style={styles.expertReplyTitle}>Answer Query:</ThemedText>
                     <TextInput
                       style={[styles.expertReplyInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                       multiline
                       numberOfLines={4}
                       placeholder="Provide your expert advice here..."
                       placeholderTextColor={colors.placeholder}
                       value={replyText}
                       onChangeText={setReplyText}
                     />
                     <TouchableOpacity 
                       style={styles.submitReplyBtn} 
                       onPress={() => submitReply(item._id)}
                       disabled={answering}
                     >
                        {answering ? <ActivityIndicator color="white" /> : <ThemedText style={styles.submitReplyBtnText}>Submit Answer</ThemedText>}
                     </TouchableOpacity>
                   </ThemedView>
                 ) : (
                   <ThemedText style={[styles.pendingFooterText, { color: colors.subtext }]}>Our experts are analyzing this inquiry...</ThemedText>
                 )}
               </ThemedView>
            )}
          </ThemedView>
        )}
        
        <TouchableOpacity 
          style={[styles.cardIndicator, { borderTopColor: colors.border }]}
          onPress={() => {
            setExpandedId(isExpanded ? null : item._id);
            if (!isExpanded) {
              setReplyText('');
              setEditingReplyId(null);
            }
          }}
        >
           <ThemedText style={styles.cardIndicatorText}>{isExpanded ? 'Hide Details' : 'View Details'}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };


  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#0A5C36" />
      </ThemedView>
    );
  }

  if (submitted) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <IconSymbol name="checkmark.circle.fill" size={64} color="#0A5C36" />
        <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: '#0A5C36', marginTop: 16 }}>Submitted Successfully!</ThemedText>
        <ThemedText style={{ fontSize: 16, color: colors.subtext, marginTop: 8 }}>Your answer has been recorded.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'All Queries',
            headerLeft: onBack ? () => (
              <TouchableOpacity onPress={onBack} style={{marginLeft: 16}}>
                <IconSymbol name="chevron.left" size={24} color={colors.primary} />
              </TouchableOpacity>
            ) : undefined,
            headerRight: () => (
              <TouchableOpacity onPress={() => router.push('/expert-queries/submit')} style={styles.headerButton}>
                <IconSymbol name="plus" size={24} color={colors.primary} />
              </TouchableOpacity>
            )
          }} 
        />
        
        {user?.role !== 'Expert' && (
          <ThemedView style={[styles.actionContainer, { backgroundColor: 'transparent' }]}>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={() => router.push('/expert-queries/submit')}
            >
              <IconSymbol name="plus.circle.fill" size={20} color="white" />
              <ThemedText style={styles.createButtonText}>Ask an Expert</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        <FlatList
          data={queries}
          renderItem={renderQuery}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <ThemedView style={[styles.emptyContainer, { backgroundColor: 'transparent' }]}>
              <IconSymbol name="doc.text.magnifyingglass" size={48} color={colors.placeholder} />
              <ThemedText style={styles.emptyText}>No queries found.</ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: colors.subtext }]}>Submit your first query to get expert advice!</ThemedText>
            </ThemedView>
          }
        />
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
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
  },
  date: {
    fontSize: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  cropName: {
    fontSize: 14,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  expandedContent: {
    marginTop: 8,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  description: {
    fontSize: 15,
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
    marginBottom: 16,
  },
  replyBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  replyLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  replyText: {
    fontSize: 15,
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  pendingFooterText: {
    fontSize: 13,
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
    borderWidth: 1,
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
    ...Shadows.xs,
  },
});
