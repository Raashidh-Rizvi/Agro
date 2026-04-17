import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/constants/Config';
import { Shadows, Radius, Spacing } from '@/constants/theme';

type AlertType = 'weather' | 'fertilizer' | 'pest' | 'irrigation' | 'general';
type Filter = 'All' | AlertType;

type AdvisoryAlert = {
  _id: string;
  title: string;
  cropType: string;
  district: string;
  season: string;
  message: string;
  alertType: AlertType;
  createdAt: string;
  updatedAt?: string;
  createdBy?: {
    _id: string;
    name: string;
    role: string;
  };
};

type AlertFormState = {
  title: string;
  cropType: string;
  district: string;
  season: string;
  message: string;
  alertType: AlertType;
};

const FILTER_TABS: Filter[] = ['All', 'weather', 'pest', 'irrigation', 'fertilizer', 'general'];

const ALERT_META: Record<AlertType, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  weather:    { color: '#F59E0B', bg: '#FEF3C7', icon: 'rainy-outline',         label: 'Weather' },
  fertilizer: { color: '#3B82F6', bg: '#EFF6FF', icon: 'flask-outline',         label: 'Fertilizer' },
  pest:       { color: '#EF4444', bg: '#FEE2E2', icon: 'bug-outline',           label: 'Pest' },
  irrigation: { color: '#0F9D58', bg: '#E6F4EA', icon: 'water-outline',         label: 'Irrigation' },
  general:    { color: '#6B7280', bg: '#F3F4F6', icon: 'notifications-outline', label: 'General' },
};

const EMPTY_FORM: AlertFormState = {
  title: '',
  cropType: '',
  district: '',
  season: '',
  message: '',
  alertType: 'weather',
};

const getAlertErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Request failed';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
};

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getSummaryCount = (alerts: AdvisoryAlert[], type: AlertType) =>
  alerts.filter((alert) => alert.alertType === type).length;

export default function AlertsScreen() {
  const { user } = useAuth();
  const C = useAppColors();
  const canManageAlerts = user?.role === 'Expert' || user?.role === 'Admin';

  const [alerts, setAlerts] = useState<AdvisoryAlert[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [form, setForm] = useState<AlertFormState>(EMPTY_FORM);

  const fetchAlerts = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setError(null);
      const response = await axios.get(`${API_URL}/alerts`);
      setAlerts(response.data.alerts || []);
    } catch (fetchError) {
      setError(getAlertErrorMessage(fetchError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const resetForm = () => {
    setEditingAlertId(null);
    setForm(EMPTY_FORM);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalVisible(true);
  };

  const openEditModal = (alert: AdvisoryAlert) => {
    setEditingAlertId(alert._id);
    setForm({
      title: alert.title,
      cropType: alert.cropType,
      district: alert.district,
      season: alert.season,
      message: alert.message,
      alertType: alert.alertType,
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    resetForm();
  };

  const handleFieldChange = (field: keyof AlertFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.title.trim() || !form.cropType.trim() || !form.district.trim() || !form.season.trim() || !form.message.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all alert details.');
      return false;
    }
    return true;
  };

  const handleSaveAlert = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        cropType: form.cropType.trim(),
        district: form.district.trim(),
        season: form.season.trim(),
        message: form.message.trim(),
        alertType: form.alertType,
      };

      if (editingAlertId) {
        const response = await axios.put(`${API_URL}/alerts/${editingAlertId}`, payload);
        const updatedAlert: AdvisoryAlert = response.data.alert;
        setAlerts((prev) => prev.map((alert) => (alert._id === updatedAlert._id ? updatedAlert : alert)));
      } else {
        const response = await axios.post(`${API_URL}/alerts`, payload);
        const newAlert: AdvisoryAlert = response.data.alert;
        setAlerts((prev) => [newAlert, ...prev]);
      }

      closeModal();
    } catch (saveError) {
      Alert.alert(editingAlertId ? 'Update Failed' : 'Create Failed', getAlertErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      await axios.delete(`${API_URL}/alerts/${alertId}`);
      setAlerts((prev) => prev.filter((alert) => alert._id !== alertId));
    } catch (deleteError) {
      Alert.alert('Delete Failed', getAlertErrorMessage(deleteError));
    }
  };

  const confirmDelete = (alert: AdvisoryAlert) => {
    Alert.alert(
      'Delete Alert',
      `Delete "${alert.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAlert(alert._id),
        },
      ]
    );
  };

  const canEditAlert = (alert: AdvisoryAlert) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return alert.createdBy?._id === user.id;
  };

  const filteredAlerts =
    activeFilter === 'All'
      ? alerts
      : alerts.filter((alert) => alert.alertType === activeFilter);

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar style={C.statusBar} />

      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <ThemedText style={[styles.headerTitle, { color: C.text }]}>Advisory Alerts</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: C.muted }]}>
            {alerts.length > 0 ? `${alerts.length} live alerts available` : 'No alerts have been posted yet'}
          </ThemedText>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={() => fetchAlerts(true)}
            activeOpacity={0.85}>
            <Ionicons name="refresh-outline" size={18} color={C.primary} />
          </TouchableOpacity>

          {canManageAlerts && (
            <TouchableOpacity
              style={[styles.createButton, Shadows.colored(C.primary)]}
              onPress={openCreateModal}
              activeOpacity={0.85}>
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <ThemedText style={styles.createButtonText}>New Alert</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchAlerts(true)} />}>

        <View style={styles.summaryRow}>
          {(Object.keys(ALERT_META) as AlertType[]).map((type) => {
            const meta = ALERT_META[type];
            return (
              <View key={type} style={[styles.summaryChip, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon} size={13} color={meta.color} />
                <ThemedText style={[styles.summaryCount, { color: meta.color }]}>
                  {getSummaryCount(alerts, type)}
                </ThemedText>
                <ThemedText style={[styles.summaryLabel, { color: meta.color }]}>
                  {meta.label}
                </ThemedText>
              </View>
            );
          })}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          style={styles.filterRow}>
          {FILTER_TABS.map((tab) => {
            const active = tab === activeFilter;
            const label = tab === 'All' ? 'All' : ALERT_META[tab].label;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: active ? C.primary : C.card,
                    borderColor: active ? C.primary : C.border,
                  },
                ]}
                onPress={() => setActiveFilter(tab)}
                activeOpacity={0.8}>
                <ThemedText style={[styles.filterText, { color: active ? '#FFFFFF' : C.subtext }]}>
                  {label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator size="large" color={C.primary} />
            <ThemedText style={[styles.stateTitle, { color: C.text }]}>Loading alerts...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.stateBlock}>
            <Ionicons name="alert-circle-outline" size={50} color={C.danger} />
            <ThemedText style={[styles.stateTitle, { color: C.text }]}>Could not load alerts</ThemedText>
            <ThemedText style={[styles.stateText, { color: C.muted }]}>{error}</ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: C.primary }]}
              onPress={() => fetchAlerts()}
              activeOpacity={0.85}>
              <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
            </TouchableOpacity>
          </View>
        ) : filteredAlerts.length === 0 ? (
          <View style={styles.stateBlock}>
            <Ionicons name="notifications-off-outline" size={52} color={C.accent} />
            <ThemedText style={[styles.stateTitle, { color: C.text }]}>No alerts in this view</ThemedText>
            <ThemedText style={[styles.stateText, { color: C.muted }]}>
              {activeFilter === 'All'
                ? 'Create the first advisory alert to get this module moving.'
                : `There are no ${activeFilter} alerts right now.`}
            </ThemedText>
          </View>
        ) : (
          filteredAlerts.map((alert) => {
            const meta = ALERT_META[alert.alertType];
            const editable = canEditAlert(alert);

            return (
              <View
                key={alert._id}
                style={[styles.alertCard, { backgroundColor: C.card, borderColor: C.border }]}>
                <View style={[styles.alertColorBar, { backgroundColor: meta.color }]} />

                <View style={[styles.alertIconWrap, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={20} color={meta.color} />
                </View>

                <View style={styles.alertBody}>
                  <View style={styles.alertHeaderRow}>
                    <ThemedText style={[styles.alertTitle, { color: C.text }]}>{alert.title}</ThemedText>
                    <View style={[styles.alertTypePill, { backgroundColor: meta.bg }]}>
                      <ThemedText style={[styles.alertTypeText, { color: meta.color }]}>{meta.label}</ThemedText>
                    </View>
                  </View>

                  <ThemedText style={[styles.alertMeta, { color: C.subtext }]}>
                    {alert.cropType} | {alert.district} | {alert.season}
                  </ThemedText>
                  <ThemedText style={[styles.alertMessage, { color: C.subtext }]}>{alert.message}</ThemedText>

                  <View style={styles.alertFooter}>
                    <ThemedText style={[styles.alertFooterText, { color: C.muted }]}>
                      {alert.createdBy?.name ? `By ${alert.createdBy.name}` : 'Posted by team member'}
                    </ThemedText>
                    <ThemedText style={[styles.alertFooterText, { color: C.muted }]}>
                      {formatDate(alert.createdAt)}
                    </ThemedText>
                  </View>

                  {editable && (
                    <View style={styles.manageRow}>
                      <TouchableOpacity
                        style={[styles.manageButton, { backgroundColor: C.primaryDim }]}
                        onPress={() => openEditModal(alert)}
                        activeOpacity={0.8}>
                        <Ionicons name="create-outline" size={16} color={C.primary} />
                        <ThemedText style={[styles.manageButtonText, { color: C.primary }]}>Edit</ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.manageButton, styles.deleteButton]}
                        onPress={() => confirmDelete(alert)}
                        activeOpacity={0.8}>
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardWrap}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.modalCard, { backgroundColor: C.bg }]}>
              <View style={styles.modalHeader}>
                <View>
                  <ThemedText style={[styles.modalTitle, { color: C.text }]}>
                    {editingAlertId ? 'Update Alert' : 'Create Alert'}
                  </ThemedText>
                  <ThemedText style={[styles.modalSubtitle, { color: C.muted }]}>
                    Post advisory information for farmers in the app.
                  </ThemedText>
                </View>

                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: C.card, borderColor: C.border }]}
                  onPress={closeModal}
                  activeOpacity={0.85}>
                  <Ionicons name="close-outline" size={20} color={C.text} />
                </TouchableOpacity>
              </View>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.formLabel, { color: C.text }]}>Title</ThemedText>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                    placeholder="e.g. Paddy pest alert"
                    placeholderTextColor={C.muted}
                    value={form.title}
                    onChangeText={(value) => handleFieldChange('title', value)}
                  />
                </View>

                <View style={styles.typeOptionsRow}>
                  {(Object.keys(ALERT_META) as AlertType[]).map((type) => {
                    const active = form.alertType === type;
                    const meta = ALERT_META[type];
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeOption,
                          {
                            backgroundColor: active ? meta.bg : C.card,
                            borderColor: active ? meta.color : C.border,
                          },
                        ]}
                        onPress={() => handleFieldChange('alertType', type)}
                        activeOpacity={0.8}>
                        <Ionicons name={meta.icon} size={16} color={meta.color} />
                        <ThemedText style={[styles.typeOptionText, { color: active ? meta.color : C.subtext }]}>
                          {meta.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.rowTwo}>
                  <View style={[styles.formGroup, styles.halfWidth]}>
                    <ThemedText style={[styles.formLabel, { color: C.text }]}>Crop Type</ThemedText>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                      placeholder="Paddy"
                      placeholderTextColor={C.muted}
                      value={form.cropType}
                      onChangeText={(value) => handleFieldChange('cropType', value)}
                    />
                  </View>

                  <View style={[styles.formGroup, styles.halfWidth]}>
                    <ThemedText style={[styles.formLabel, { color: C.text }]}>District</ThemedText>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                      placeholder="Kurunegala"
                      placeholderTextColor={C.muted}
                      value={form.district}
                      onChangeText={(value) => handleFieldChange('district', value)}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={[styles.formLabel, { color: C.text }]}>Season</ThemedText>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                    placeholder="Yala 2026"
                    placeholderTextColor={C.muted}
                    value={form.season}
                    onChangeText={(value) => handleFieldChange('season', value)}
                  />
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={[styles.formLabel, { color: C.text }]}>Message</ThemedText>
                  <TextInput
                    style={[
                      styles.formInput,
                      styles.messageInput,
                      { backgroundColor: C.card, borderColor: C.border, color: C.text },
                    ]}
                    placeholder="Write the advisory message here"
                    placeholderTextColor={C.muted}
                    value={form.message}
                    onChangeText={(value) => handleFieldChange('message', value)}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: C.card, borderColor: C.border }]}
                  onPress={closeModal}
                  disabled={isSaving}
                  activeOpacity={0.85}>
                  <ThemedText style={[styles.secondaryButtonText, { color: C.subtext }]}>Cancel</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: C.primary }]}
                  onPress={handleSaveAlert}
                  disabled={isSaving}
                  activeOpacity={0.85}>
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.primaryButtonText}>
                      {editingAlertId ? 'Save Changes' : 'Publish Alert'}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Spacing.xxl + Spacing.sm },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: 12,
  },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F9D58',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
  createButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  summaryChip: {
    minWidth: '31%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  summaryCount: { fontSize: 13, fontWeight: '800' },
  summaryLabel: { fontSize: 12, fontWeight: '700' },
  filterRow: { marginBottom: Spacing.md },
  filterContent: { gap: 8 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '700' },
  stateBlock: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing.lg },
  stateTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  stateText: { fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
  retryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: Radius.lg,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    ...Shadows.sm,
  },
  alertColorBar: { width: 4 },
  alertIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBody: { flex: 1, paddingVertical: 12, paddingRight: 14 },
  alertHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 },
  alertTitle: { flex: 1, fontSize: 15, fontWeight: '700' },
  alertTypePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  alertTypeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  alertMeta: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  alertMessage: { fontSize: 12, lineHeight: 18, marginBottom: 8 },
  alertFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 },
  alertFooterText: { fontSize: 10, fontWeight: '600' },
  manageRow: { flexDirection: 'row', gap: 8 },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  manageButtonText: { fontSize: 12, fontWeight: '700' },
  deleteButton: { backgroundColor: '#FEE2E2' },
  deleteButtonText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalKeyboardWrap: { flex: 1, justifyContent: 'flex-end' },
  modalCard: {
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: Spacing.md },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  modalSubtitle: { fontSize: 12, marginTop: 4 },
  formGroup: { marginBottom: Spacing.md },
  formLabel: { fontSize: 13, fontWeight: '700', marginBottom: 7 },
  formInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  messageInput: { minHeight: 110 },
  typeOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  typeOptionText: { fontSize: 12, fontWeight: '700' },
  rowTwo: { flexDirection: 'row', gap: 10 },
  halfWidth: { flex: 1 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: Spacing.sm },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingVertical: 14,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '700' },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    paddingVertical: 14,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
