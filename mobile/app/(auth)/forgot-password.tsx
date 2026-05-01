import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Radius, Spacing, Typography, Shadows } from '@/constants/theme';
import { ThemeOverrideProvider } from '@/context/ThemeOverrideContext';

// ─── Light Auth Palette ────────────────────────────────────────────────────────
const L = {
  bg:          '#F4F9F6',
  card:        '#FFFFFF',
  inputBg:     '#FFFFFF',
  border:      '#DDE8E3',
  borderFocus: '#0F9D58',
  text:        '#0D1F17',
  subtext:     '#4A6358',
  muted:       '#8FA89E',
  primary:     '#0F9D58',
  primaryDim:  '#E6F4EA',
  accent:      '#34C759',
  panelTop:    '#0F9D58',
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Code & New Password
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [tokenFocused, setTokenFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);

  const { forgotPassword, resetPassword } = useAuth();
  const router = useRouter();

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }
    setIsLoading(true);
    try {
      const token = await forgotPassword(email);
      if (token) {
        // In dev mode we pre-fill the token for convenience, or just show it in alert
        Alert.alert('Success', `Reset code generated: ${token}. In a real app this would be emailed.`);
        setResetToken(token);
      } else {
        Alert.alert('Success', 'If an account exists with that email, a reset code has been sent.');
      }
      setStep(2);
    } catch (err: any) {
      Alert.alert('Error', err.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken || !newPassword || !confirmPassword) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      Alert.alert('Success', 'Your password has been reset successfully.', [
        { text: 'Login Now', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeOverrideProvider scheme="light">
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Green Header ─────────────────────────── */}
          <View style={styles.headerPanel}>
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => step === 2 ? setStep(1) : router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.logoRing}>
              <MaterialCommunityIcons name="lock-reset" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>Reset Password</Text>
          </View>

          {/* ── White Card ─────────────────────────── */}
          <View style={styles.card}>
            {step === 1 ? (
              <>
                <Text style={styles.cardTitle}>Forgot Password?</Text>
                <Text style={styles.cardSubtitle}>
                  Enter your email address and we&apos;ll send you a code to reset your password.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={emailFocused ? L.primary : L.muted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      placeholderTextColor={L.muted}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleRequestReset}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Send Reset Code</Text>
                      <Ionicons name="send-outline" size={18} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Set New Password</Text>
                <Text style={styles.cardSubtitle}>
                  Enter the code sent to your email and your new password below.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Reset Code</Text>
                  <View style={[styles.inputWrapper, tokenFocused && styles.inputFocused]}>
                    <Ionicons
                      name="key-outline"
                      size={18}
                      color={tokenFocused ? L.primary : L.muted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter reset code"
                      placeholderTextColor={L.muted}
                      value={resetToken}
                      onChangeText={setResetToken}
                      autoCapitalize="none"
                      onFocus={() => setTokenFocused(true)}
                      onBlur={() => setTokenFocused(false)}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={[styles.inputWrapper, passFocused && styles.inputFocused]}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={passFocused ? L.primary : L.muted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="At least 6 characters"
                      placeholderTextColor={L.muted}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      onFocus={() => setPassFocused(true)}
                      onBlur={() => setPassFocused(false)}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={[styles.inputWrapper, confirmPassFocused && styles.inputFocused]}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={confirmPassFocused ? L.primary : L.muted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      placeholderTextColor={L.muted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      onFocus={() => setConfirmPassFocused(true)}
                      onBlur={() => setConfirmPassFocused(false)}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Reset Password</Text>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemeOverrideProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: L.panelTop },
  container: { flexGrow: 1 },
  headerPanel: {
    backgroundColor: L.panelTop,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  logoRing: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  appName: { fontSize: 27, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  card: {
    backgroundColor: L.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl,
    ...Shadows.lg,
  },
  cardTitle: { ...Typography.h2, color: L.text, marginBottom: 6 },
  cardSubtitle: { ...Typography.body, color: L.subtext, marginBottom: Spacing.xl },
  inputGroup: { marginBottom: Spacing.md },
  label: { ...Typography.smallBold, color: L.text, marginBottom: 7 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F4F9F6', borderWidth: 1.5, borderColor: L.border, borderRadius: Radius.md,
  },
  inputFocused: { borderColor: L.borderFocus, backgroundColor: '#FFFFFF', ...Shadows.xs },
  inputIcon: { marginLeft: 16, marginRight: 4 },
  input: { flex: 1, paddingVertical: 15, paddingHorizontal: 10, fontSize: 15, color: L.text },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: L.primary, paddingVertical: 17, borderRadius: Radius.pill,
    marginTop: Spacing.md,
    ...Shadows.colored(L.primary),
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { ...Typography.bodyBold, color: '#FFFFFF', fontSize: 16 },
});
