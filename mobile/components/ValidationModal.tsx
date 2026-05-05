import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Shadows, Spacing, Typography } from '@/constants/theme';

interface ValidationModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'confirm';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const CONFIG = {
  success: { color: '#0F9D58', iconBg: '#E3F4EB', icon: 'checkmark-circle' as const,  accentColor: '#0F9D58' },
  confirm: { color: '#3B82F6', iconBg: '#EFF6FF', icon: 'help-circle'       as const,  accentColor: '#3B82F6' },
  error:   { color: '#EF4444', iconBg: '#FEE2E2', icon: 'alert-circle'      as const,  accentColor: '#EF4444' },
};

export default function ValidationModal({
  visible, title, message, type = 'error', onClose, onConfirm, confirmText = 'Okay', cancelText = 'Cancel',
}: ValidationModalProps) {
  const cfg = CONFIG[type];
  const isConfirm = type === 'confirm';

  const handleConfirm = () => { onConfirm?.(); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top accent bar */}
          <View style={[styles.accentBar, { backgroundColor: cfg.color }]} />

          {/* Icon with glow ring */}
          <View style={[styles.iconOuter, { backgroundColor: cfg.iconBg }]}>
            <View style={[styles.iconInner, { backgroundColor: cfg.color + '20' }]}>
              <Ionicons name={cfg.icon} size={40} color={cfg.color} />
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={isConfirm ? styles.buttonRow : styles.singleBtn}>
            {isConfirm && (
              <TouchableOpacity
                style={[styles.button, styles.cancelBtn, { borderColor: cfg.color + '50' }]}
                onPress={onClose}
                activeOpacity={0.8}>
                <Text style={[styles.buttonText, { color: cfg.color }]}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.confirmBtn, { backgroundColor: cfg.color }, Shadows.colored(cfg.color), isConfirm && { flex: 1 }]}
              onPress={handleConfirm}
              activeOpacity={0.85}>
              {/* Shine */}
              <View style={styles.btnShine} />
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{isConfirm ? confirmText : 'Got it'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadows.xl,
  },
  accentBar: {
    width: '100%',
    height: 4,
    marginBottom: Spacing.lg,
  },
  iconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h3,
    color: '#0A1C13',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  message: {
    ...Typography.body,
    color: '#4A6358',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  singleBtn: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  confirmBtn: {
    width: '100%',
  },
  btnShine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.pill,
  },
  buttonText: {
    ...Typography.bodyBold,
    fontSize: 15,
  },
});
