import React, { useState, useCallback, useMemo } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, TextInput, Platform, FlatList
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Shadows, Radius, Spacing } from '@/constants/theme';

// ─── Constants ────────────────────────────────────────────────────────────────
const FILTER_TABS = ['All', 'Growing', 'At Risk', 'Harvest'] as const;
type Filter = typeof FILTER_TABS[number];
type GrowthStage = 'Growing' | 'At Risk' | 'Harvest';

const STATUS_META: Record<GrowthStage, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Growing:   { color: '#0F9D58', bg: '#E6F4EA', icon: 'leaf-outline' },
  'At Risk': { color: '#F59E0B', bg: '#FEF3C7', icon: 'warning-outline' },
  Harvest:   { color: '#B45309', bg: '#FDE68A', icon: 'checkmark-circle-outline' },
};

const SORT_OPTIONS = [
  { label: 'Newest First',  value: 'plantedDate' },
  { label: 'Growth Stage',  value: 'growthStage' },
  { label: 'Crop Type A–Z', value: 'cropType' },
];

const SL_DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar',
  'Mullaitivu','Vavuniya','Trincomalee','Batticaloa','Ampara',
  'Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla',
  'Monaragala','Ratnapura','Kegalle'
];

const EMPTY_FORM = {
  cropName: '', cropType: '', plantedDate: '',
  cropDuration: '', landSize: '', district: '', description: ''
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CropsScreen() {
  const C = useAppColors();
  const { token } = useAuth();
  const router = useRouter();

  const [crops, setCrops]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [search, setSearch]             = useState('');
  const [sortBy, setSortBy]             = useState('plantedDate');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget]     = useState<any | null>(null);
  const [form, setForm]                 = useState({ ...EMPTY_FORM });
  const [saving, setSaving]             = useState(false);
  const [districtModal, setDistrictModal]       = useState(false);
  const [showDatePicker, setShowDatePicker]     = useState(false);
  const [webCalendarModal, setWebCalendarModal] = useState(false);
  const [webTempDate, setWebTempDate]           = useState('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedCrop, setSelectedCrop]         = useState<any>(null);

  const onDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) {
      const iso = selected.toISOString().split('T')[0];
      setForm(f => ({ ...f, plantedDate: iso }));
    }
  };

  const today = new Date().toISOString().split('T')[0];


  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchCrops = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params: any = { sortBy };
      if (activeFilter !== 'All') params.growthStage = activeFilter;
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/crops', { params });
      setCrops(res.data.data);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to fetch crops');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, search, sortBy, token]);

  useFocusEffect(useCallback(() => { fetchCrops(); }, [fetchCrops]));

  // ─── Counts ─────────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    Growing:   crops.filter(c => c.growthStage === 'Growing').length,
    'At Risk': crops.filter(c => c.growthStage === 'At Risk').length,
    Harvest:   crops.filter(c => c.growthStage === 'Harvest').length,
  }), [crops]);

  // ─── Form helpers ───────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setModalVisible(true);
  };

  const openEdit = (crop: any) => {
    setEditTarget(crop);
    setForm({
      cropName:     crop.cropName,
      cropType:     crop.cropType || '',
      plantedDate:  crop.plantedDate ? crop.plantedDate.split('T')[0] : '',
      cropDuration: crop.cropDuration?.toString() || '',
      landSize:     crop.landSize?.toString() || '',
      district:     crop.district || '',
      description:  crop.description || '',
    });
    setModalVisible(true);
  };

  const validateForm = (): string | null => {
    if (!form.cropName.trim())    return 'Crop name is required';
    if (!form.plantedDate)        return 'Planted date is required';
    if (new Date(form.plantedDate) > new Date()) return 'Planted date cannot be a future date';
    if (!form.cropDuration || Number(form.cropDuration) <= 0) return 'Crop duration must be > 0';
    if (!form.landSize || Number(form.landSize) <= 0) return 'Land size must be > 0';
    if (!form.district)           return 'District is required';
    if (form.description) {
      const words = form.description.trim().split(/\s+/).length;
      if (words > 200) return 'Description cannot exceed 200 words';
    }
    return null;
  };

  const saveCrop = async () => {
    const err = validateForm();
    if (err) return Alert.alert('Validation', err);
    setSaving(true);
    try {
      const payload = {
        ...form,
        cropDuration: Number(form.cropDuration),
        landSize:     Number(form.landSize),
      };
      if (editTarget) {
        await api.put(`/crops/${editTarget._id}`, payload);
      } else {
        await api.post('/crops', payload);
      }
      setModalVisible(false);
      fetchCrops();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save crop');
    } finally {
      setSaving(false);
    }
  };

  const deleteCrop = (id: string) => {
    Alert.alert('Delete Crop', 'Are you sure you want to delete this crop?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/crops/${id}`);
            fetchCrops();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to delete');
          }
        }
      }
    ]);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar style={C.statusBar} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={[styles.headerTitle, { color: C.text }]}>My Crops</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: C.muted }]}>{crops.length} crops registered</ThemedText>
        </View>
        <TouchableOpacity style={[styles.addBtn, Shadows.colored('#0F9D58')]} onPress={openAdd} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color="#FFF" />
          <ThemedText style={styles.addBtnText}>Add Crop</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        {([['Growing','#0F9D58','#E6F4EA'],['At Risk','#F59E0B','#FEF3C7'],['Harvest','#B45309','#FDE68A']] as const).map(([label, color, bg]) => (
          <View key={label} style={[styles.summaryCard, { backgroundColor: bg }]}>
            <ThemedText style={[styles.summaryValue, { color }]}>{counts[label as GrowthStage]}</ThemedText>
            <ThemedText style={[styles.summaryLabel, { color }]}>{label}</ThemedText>
          </View>
        ))}
      </View>

      {/* Search + Sort */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: C.card, borderColor: C.border }]}>
          <Ionicons name="search-outline" size={16} color={C.muted} />
          <TextInput
            style={[styles.searchInput, { color: C.text }]}
            placeholder="Search crops..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchCrops}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); }}>
              <Ionicons name="close-circle" size={16} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={[styles.sortBtn, { backgroundColor: C.card, borderColor: C.border }]} onPress={() => setShowSortMenu(true)}>
          <Ionicons name="funnel-outline" size={16} color={C.subtext} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => {
          const active = tab === activeFilter;
          return (
            <TouchableOpacity key={tab}
              style={[styles.filterTab, { backgroundColor: active ? C.primary : C.card, borderColor: active ? C.primary : C.border }]}
              onPress={() => setActiveFilter(tab)}>
              <ThemedText style={[styles.filterText, { color: active ? '#FFF' : C.subtext, fontWeight: active ? '700' : '600' }]}>{tab}</ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Crop List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0F9D58" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {crops.length === 0 && (
            <ThemedText style={[styles.emptyText, { color: C.muted }]}>No crops found. Tap "Add Crop" to get started.</ThemedText>
          )}
          {crops.map((crop) => {
            const meta = STATUS_META[crop.growthStage as GrowthStage] || STATUS_META['Growing'];
            return (
              <View key={crop._id} style={[styles.cropCard, { backgroundColor: C.card, borderColor: C.border }]}>
                {/* Progress bar */}
                <View style={[styles.progressBar, { backgroundColor: C.border }]}>
                  <View style={[styles.progressFill, { width: `${crop.progressPercent || 0}%` as any, backgroundColor: meta.color }]} />
                </View>

                <View style={styles.cardBody}>
                  <View style={[styles.cropIcon, { backgroundColor: meta.bg }]}>
                    <MaterialCommunityIcons name="sprout" size={26} color={meta.color} />
                  </View>
                  <View style={styles.cropInfo}>
                    <View style={styles.cropTopRow}>
                      <ThemedText style={[styles.cropName, { color: C.text }]}>{crop.cropName}</ThemedText>
                      <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                        <Ionicons name={meta.icon} size={10} color={meta.color} />
                        <ThemedText style={[styles.statusText, { color: meta.color }]}>{crop.growthStage}</ThemedText>
                      </View>
                    </View>
                    {crop.cropType   ? <ThemedText style={[styles.cropMeta, { color: C.muted }]}>🌿 {crop.cropType}</ThemedText> : null}
                    {crop.district   ? <ThemedText style={[styles.cropMeta, { color: C.muted }]}>📍 {crop.district}</ThemedText> : null}
                    <ThemedText style={[styles.cropMeta, { color: C.muted }]}>🗓 Age: {crop.cropAge} days  •  {crop.progressPercent}% complete</ThemedText>
                    {crop.expectedHarvestDate ? (
                      <ThemedText style={[styles.cropMeta, { color: C.muted }]}>🌾 Harvest by: {crop.expectedHarvestDate}</ThemedText>
                    ) : null}
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => { setSelectedCrop(crop); setViewModalVisible(true); }} style={styles.actionBtn}>
                      <Ionicons name="eye-outline" size={18} color="#0F9D58" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openEdit(crop)} style={styles.actionBtn}>
                      <Ionicons name="pencil-outline" size={18} color="#0F9D58" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteCrop(crop._id)} style={styles.actionBtn}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      )}

      {/* Sort Menu Modal */}
      <Modal visible={showSortMenu} transparent animationType="fade" onRequestClose={() => setShowSortMenu(false)}>
        <TouchableOpacity style={styles.sortOverlay} activeOpacity={1} onPress={() => setShowSortMenu(false)}>
          <View style={[styles.sortMenu, { backgroundColor: C.card, borderColor: C.border }]}>
            <ThemedText style={[styles.sortMenuTitle, { color: C.text }]}>Sort By</ThemedText>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.value} style={[styles.sortOption, sortBy === opt.value && { backgroundColor: C.surface }]}
                onPress={() => { setSortBy(opt.value); setShowSortMenu(false); }}>
                <ThemedText style={{ color: sortBy === opt.value ? C.primary : C.text, fontWeight: sortBy === opt.value ? '700' : '400' }}>{opt.label}</ThemedText>
                {sortBy === opt.value && <Ionicons name="checkmark" size={16} color={C.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: C.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: C.text }]}>{editTarget ? 'Edit Crop' : 'Add Crop'}</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={C.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Crop Name */}
              <FormField label="Crop Name *" C={C}>
                <TextInput style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={form.cropName} onChangeText={v => setForm(f => ({ ...f, cropName: v }))}
                  placeholder="e.g. Rice, Tomato" placeholderTextColor={C.muted} />
              </FormField>

              {/* Crop Type */}
              <FormField label="Crop Type" C={C}>
                <TextInput style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={form.cropType} onChangeText={v => setForm(f => ({ ...f, cropType: v }))}
                  placeholder="e.g. Vegetable, Grain" placeholderTextColor={C.muted} />
              </FormField>

              {/* Planted Date */}
              <FormField label="Planted Date * (no future dates)" C={C}>
                <TouchableOpacity
                  style={[styles.input, styles.pickerBtn, { backgroundColor: C.bg, borderColor: C.border }]}
                  onPress={() => Platform.OS === 'web' ? (setWebTempDate(form.plantedDate), setWebCalendarModal(true)) : setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={{ color: form.plantedDate ? C.text : C.muted, fontSize: 14 }}>
                    {form.plantedDate || 'Select date...'}
                  </ThemedText>
                  <Ionicons name="calendar-outline" size={18} color="#0F9D58" />
                </TouchableOpacity>

                {showDatePicker && Platform.OS !== 'web' && (
                  <DateTimePicker
                    value={form.plantedDate ? new Date(form.plantedDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    maximumDate={new Date()}
                    minimumDate={new Date('2020-01-01')}
                    onChange={onDateChange}
                    themeVariant="light"
                  />
                )}
                {Platform.OS === 'ios' && showDatePicker && (
                  <TouchableOpacity style={styles.dateConfirmBtn} onPress={() => setShowDatePicker(false)}>
                    <ThemedText style={styles.dateConfirmText}>Done</ThemedText>
                  </TouchableOpacity>
                )}
              </FormField>

              {/* Crop Duration */}
              <FormField label="Crop Duration * (days)" C={C}>
                <TextInput style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={form.cropDuration} onChangeText={v => setForm(f => ({ ...f, cropDuration: v }))}
                  placeholder="e.g. 90" placeholderTextColor={C.muted} keyboardType="number-pad" />
              </FormField>

              {/* Land Size */}
              <FormField label="Land Size * (acres)" C={C}>
                <TextInput style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={form.landSize} onChangeText={v => setForm(f => ({ ...f, landSize: v }))}
                  placeholder="e.g. 2.5" placeholderTextColor={C.muted} keyboardType="decimal-pad" />
              </FormField>

              {/* District Picker */}
              <FormField label="District *" C={C}>
                <TouchableOpacity style={[styles.input, styles.pickerBtn, { backgroundColor: C.bg, borderColor: C.border }]}
                  onPress={() => setDistrictModal(true)}>
                  <ThemedText style={{ color: form.district ? C.text : C.muted, fontSize: 14 }}>
                    {form.district || 'Select district...'}
                  </ThemedText>
                  <Ionicons name="chevron-down" size={16} color={C.muted} />
                </TouchableOpacity>
              </FormField>

              {/* Description */}
              <FormField label="Description (optional, max 200 words)" C={C}>
                <TextInput style={[styles.input, styles.textArea, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))}
                  placeholder="Additional notes..." placeholderTextColor={C.muted}
                  multiline numberOfLines={3} textAlignVertical="top" />
              </FormField>

              <TouchableOpacity style={[styles.saveBtn, { opacity: saving ? 0.7 : 1 }]} onPress={saveCrop} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : (
                  <ThemedText style={styles.saveBtnText}>{editTarget ? 'Update Crop' : 'Add Crop'}</ThemedText>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Web Calendar Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={webCalendarModal} transparent animationType="fade" onRequestClose={() => setWebCalendarModal(false)}>
          <View style={styles.webCalOverlay}>
            <View style={styles.webCalBox}>
              <View style={styles.modalHeader}>
                <ThemedText style={[styles.modalTitle, { color: C.primary, fontSize: 15 }]}>Select Planted Date</ThemedText>
                <TouchableOpacity onPress={() => setWebCalendarModal(false)}>
                  <Ionicons name="close" size={20} color={C.primary} />
                </TouchableOpacity>
              </View>
              <input
                type="date"
                max={today}
                min="2020-01-01"
                value={webTempDate}
                onChange={(e: any) => setWebTempDate(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: 15,
                  border: `1.5px solid ${C.primary}`, borderRadius: 8,
                  color: C.text, backgroundColor: C.bg, outline: 'none', cursor: 'pointer',
                  boxSizing: 'border-box', marginBottom: 12,
                }}
              />
              <TouchableOpacity
                style={[styles.saveBtn, { marginTop: 0, marginBottom: 0, opacity: webTempDate ? 1 : 0.4 }]}
                disabled={!webTempDate}
                onPress={() => {
                  setForm(f => ({ ...f, plantedDate: webTempDate }));
                  setWebCalendarModal(false);
                }}
              >
                <ThemedText style={styles.saveBtnText}>Confirm Date</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* District Picker Modal */}
      <Modal visible={districtModal} animationType="slide" transparent onRequestClose={() => setDistrictModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: C.card, maxHeight: '70%' }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: C.text }]}>Select District</ThemedText>
              <TouchableOpacity onPress={() => setDistrictModal(false)}>
                <Ionicons name="close" size={22} color={C.muted} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={SL_DISTRICTS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.districtItem, { borderBottomColor: C.border }, form.district === item && { backgroundColor: C.surface }]}
                  onPress={() => { setForm(f => ({ ...f, district: item })); setDistrictModal(false); }}>
                  <ThemedText style={{ color: form.district === item ? C.primary : C.text, fontWeight: form.district === item ? '700' : '400' }}>{item}</ThemedText>
                  {form.district === item && <Ionicons name="checkmark" size={16} color={C.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={viewModalVisible} animationType="fade" transparent onRequestClose={() => setViewModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setViewModalVisible(false)}>
          <View style={[styles.modalBox, { backgroundColor: C.card, height: 380, maxHeight: 380, width: '85%', alignSelf: 'center', borderRadius: Radius.xl, borderWidth: 1, borderColor: C.border, ...Shadows.lg }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: C.text }]}>Crop Details</ThemedText>
              <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                <Ionicons name="close" size={24} color={C.muted} />
              </TouchableOpacity>
            </View>
            {selectedCrop && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: Spacing.sm }}>
                <View style={[styles.detailRow, { borderBottomColor: C.border }]}>
                  <ThemedText style={[styles.label, { color: C.muted }]}>Crop Name</ThemedText>
                  <ThemedText style={[styles.value, { color: C.text }]}>{selectedCrop.cropName}</ThemedText>
                </View>
                <View style={[styles.detailRow, { borderBottomColor: C.border }]}>
                  <ThemedText style={[styles.label, { color: C.muted }]}>Crop Type</ThemedText>
                  <ThemedText style={[styles.value, { color: C.text }]}>{selectedCrop.cropType || 'N/A'}</ThemedText>
                </View>
                <View style={[styles.detailRow, { borderBottomColor: C.border }]}>
                  <ThemedText style={[styles.label, { color: C.muted }]}>District</ThemedText>
                  <ThemedText style={[styles.value, { color: C.text }]}>{selectedCrop.district}</ThemedText>
                </View>
                <View style={[styles.detailRow, { borderBottomColor: C.border }]}>
                  <ThemedText style={[styles.label, { color: C.muted }]}>Planted Date</ThemedText>
                  <ThemedText style={[styles.value, { color: C.text }]}>{selectedCrop.plantedDate}</ThemedText>
                </View>
                <View style={[styles.detailRow, { borderBottomColor: C.border }]}>
                  <ThemedText style={[styles.label, { color: C.muted }]}>Crop Age</ThemedText>
                  <ThemedText style={[styles.value, { color: C.text }]}>{selectedCrop.cropAge} days</ThemedText>
                </View>
                <View style={[styles.detailRow, { borderBottomColor: C.border }]}>
                  <ThemedText style={[styles.label, { color: C.muted }]}>Growth Stage</ThemedText>
                  <ThemedText style={[styles.value, { color: C.text }]}>{selectedCrop.growthStage}</ThemedText>
                </View>
                <View style={[styles.detailRow, { borderBottomColor: C.border }]}>
                  <ThemedText style={[styles.label, { color: C.muted }]}>Progress</ThemedText>
                  <ThemedText style={[styles.value, { color: C.text }]}>{selectedCrop.progressPercent}%</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={[styles.label, { color: C.muted }]}>Harvest Date</ThemedText>
                  <ThemedText style={[styles.value, { color: C.text }]}>{selectedCrop.expectedHarvestDate || 'N/A'}</ThemedText>
                </View>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

// ─── Small helper component ───────────────────────────────────────────────────
function FormField({ label, children, C }: { label: string; children: React.ReactNode; C: any }) {
  return (
    <View style={styles.inputGroup}>
      <ThemedText style={[styles.inputLabel, { color: C.subtext }]}>{label}</ThemedText>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:       { flex: 1, paddingTop: Spacing.xxl + Spacing.sm },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  headerTitle:     { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  headerSubtitle:  { fontSize: 12, marginTop: 2 },
  addBtn:          { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0F9D58', paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.pill },
  addBtnText:      { fontSize: 13, fontWeight: '700', color: '#FFF' },
  summaryRow:      { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.md },
  summaryCard:     { flex: 1, borderRadius: Radius.md, padding: 12, alignItems: 'center' },
  summaryValue:    { fontSize: 22, fontWeight: '800' },
  summaryLabel:    { fontSize: 11, fontWeight: '700', marginTop: 2 },
  searchRow:       { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 8, marginBottom: Spacing.sm },
  searchBox:       { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput:     { flex: 1, fontSize: 14, padding: 0 },
  sortBtn:         { borderWidth: 1, borderRadius: Radius.md, padding: 10, justifyContent: 'center', alignItems: 'center' },
  filterRow:       { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  filterContent:   { gap: 8 },
  filterTab:       { flex: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.pill, borderWidth: 1, alignItems: 'center' },
  filterText:      { fontSize: 13 },
  listContent:     { paddingHorizontal: Spacing.lg },
  emptyText:       { textAlign: 'center', marginTop: 40, fontSize: 14 },
  cropCard:        { borderRadius: Radius.lg, marginBottom: 12, borderWidth: 1, overflow: 'hidden', ...Shadows.sm },
  progressBar:     { height: 4 },
  progressFill:    { height: 4 },
  cardBody:        { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 12 },
  cropIcon:        { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  cropInfo:        { flex: 1 },
  cropTopRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cropName:        { fontSize: 15, fontWeight: '700' },
  statusBadge:     { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.pill },
  statusText:      { fontSize: 10, fontWeight: '700' },
  cropMeta:        { fontSize: 11, marginTop: 2 },
  actions:         { gap: 8 },
  actionBtn:       { padding: 4 },
  sortOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  sortMenu:        { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
  sortMenuTitle:   { fontSize: 13, fontWeight: '700', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  sortOption:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14 },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox:        { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, maxHeight: '92%' },
  modalHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle:      { fontSize: 18, fontWeight: '800' },
  inputGroup:      { marginBottom: Spacing.md },
  inputLabel:      { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input:           { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 14 },
  pickerBtn:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textArea:        { minHeight: 80 },
  saveBtn:         { backgroundColor: '#0F9D58', borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.sm, marginBottom: Spacing.lg },
  saveBtnText:     { color: '#FFF', fontWeight: '700', fontSize: 15 },
  districtItem:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1 },
  dateConfirmBtn:  { alignSelf: 'flex-end', marginTop: 6, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#0F9D58', borderRadius: Radius.md },
  dateConfirmText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  webCalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  webCalBox:       { borderRadius: 14, padding: 20, width: 280, ...Shadows.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm, paddingVertical: 8, borderBottomWidth: 1 },
  label: { fontSize: 13, fontWeight: '600' },
  value: { fontSize: 13, fontWeight: '700' },
});
