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

export default function ValidationModal({ 
  visible, 
  title, 
  message, 
  type = 'error', 
  onClose,
  onConfirm,
  confirmText = 'Okay',
  cancelText = 'Cancel'
}: ValidationModalProps) {
  const isSuccess = type === 'success';
  const isConfirm = type === 'confirm';
  const color = isSuccess ? '#0F9D58' : isConfirm ? '#0F9D58' : '#E53935';
  const iconName = isSuccess ? 'checkmark-circle' : isConfirm ? 'help-circle' : 'alert-circle';

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name={iconName as any} size={56} color={color} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={isConfirm ? styles.buttonRow : styles.singleButtonContainer}>
            {isConfirm && (
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton, { borderColor: color }]} 
                onPress={onClose} 
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, { color: color }]}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: color, flex: isConfirm ? 1 : undefined }]} 
              onPress={handleConfirm} 
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{isConfirm ? confirmText : 'Okay'}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    ...Shadows.lg,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: '#0D1F17',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: '#4A6358',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  singleButtonContainer: {
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    flex: 1,
  },
  buttonText: {
    ...Typography.bodyBold,
    color: '#fff',
  },
});
