import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Radius, Spacing, Typography, Shadows } from '@/constants/theme';
import { ThemeOverrideProvider } from '@/context/ThemeOverrideContext';

const L = {
  bg: '#F4F9F6', card: '#FFFFFF', border: '#DDE8E3', borderFocus: '#0F9D58',
  text: '#0D1F17', subtext: '#4A6358', muted: '#8FA89E',
  primary: '#0F9D58', primaryDim: '#E6F4EA', panelTop: '#0F9D58',
};

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const isValidEmail = (email: string) => {
  if (!email || email.length > 254) return false;
  const atIndex = email.indexOf('@');
  if (atIndex < 1 || atIndex !== email.lastIndexOf('@')) return false;
  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.lastIndexOf('.');
  if (dotIndex < 1 || dotIndex === domain.length - 1) return false;
  return true;
};

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { forgotPassword, verifyOtp, resetPassword } = useAuth();
  const router = useRouter();
  const otpRef = useRef<TextInput>(null);

  const handleSendOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { showAlert('Required', 'Please enter your email.'); return; }
    if (!isValidEmail(trimmed)) { showAlert('Invalid Email', 'Please enter a valid email address.'); return; }

    setIsLoading(true);
    try {
      await forgotPassword(trimmed);
      setStep(2);
    } catch (err: any) {
      showAlert('Error', err.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { showAlert('Invalid OTP', 'Please enter the 6-digit code.'); return; }
    setIsLoading(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), otp);
      setStep(3);
    } catch (err: any) {
      showAlert('Invalid OTP', err.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) { showAlert('Required', 'Please fill in all fields.'); return; }
    if (newPassword.length < 6) { showAlert('Weak Password', 'Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { showAlert('Mismatch', 'Passwords do not match.'); return; }

    setIsLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), otp, newPassword);
      if (Platform.OS === 'web') {
        window.alert('Success: Your password has been reset successfully!');
        router.replace('/(auth)/login');
      } else {
        Alert.alert('Success', 'Your password has been reset successfully!', [
          { text: 'Login Now', onPress: () => router.replace('/(auth)/login') }
        ]);
      }
    } catch (err: any) {
      showAlert('Error', err.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
    else router.replace('/(auth)/login');
  };

  const stepTitles = ['Forgot Password?', 'Enter OTP', 'New Password'];
  const stepSubtitles = [
    "Enter your email and we'll send a 6-digit verification code.",
    `We sent a 6-digit code to ${email}. Check your inbox (or backend console).`,
    'Almost done! Enter your new password below.',
  ];

  return (
    <ThemeOverrideProvider scheme="light">
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerPanel}>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.logoRing}>
              <MaterialCommunityIcons
                name={step === 1 ? 'email-outline' : step === 2 ? 'shield-key-outline' : 'lock-reset'}
                size={40} color="#FFFFFF"
              />
            </View>
            <Text style={styles.appName}>Reset Password</Text>
            <View style={styles.stepRow}>
              {[1, 2, 3].map(s => (
                <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]} />
              ))}
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{stepTitles[step - 1]}</Text>
            <Text style={styles.cardSubtitle}>{stepSubtitles[step - 1]}</Text>

            {/* Step 1 - Email */}
            {step === 1 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={L.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={L.muted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="send"
                    onSubmitEditing={handleSendOtp}
                    autoCorrect={false}
                    editable={true}
                  />
                </View>
              </View>
            )}

            {/* Step 2 - OTP */}
            {step === 2 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>6-Digit OTP Code</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="key-outline" size={18} color={L.muted} style={styles.inputIcon} />
                    <TextInput
                      ref={otpRef}
                      style={[styles.input, styles.otpInput]}
                      placeholder="000000"
                      placeholderTextColor={L.muted}
                      value={otp}
                      onChangeText={v => setOtp(v.replace(/[^0-9]/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                      maxLength={6}
                      returnKeyType="done"
                      onSubmitEditing={handleVerifyOtp}
                      editable={true}
                    />
                  </View>
                </View>
                <TouchableOpacity onPress={handleSendOtp} style={styles.resendRow}>
                  <Text style={styles.resendText}>Didn't receive it? </Text>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step 3 - New Password */}
            {step === 3 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color={L.muted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { paddingRight: 48 }]}
                      placeholder="At least 6 characters"
                      placeholderTextColor={L.muted}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPass}
                      editable={true}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPass(!showPass)}>
                      <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={L.muted} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color={L.muted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { paddingRight: 48 }]}
                      placeholder="Repeat your password"
                      placeholderTextColor={L.muted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirm}
                      returnKeyType="done"
                      onSubmitEditing={handleResetPassword}
                      editable={true}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirm(!showConfirm)}>
                      <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={L.muted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={step === 1 ? handleSendOtp : step === 2 ? handleVerifyOtp : handleResetPassword}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.buttonText}>
                    {step === 1 ? 'Send OTP' : step === 2 ? 'Verify OTP' : 'Reset Password'}
                  </Text>
                  <Ionicons
                    name={step === 1 ? 'send-outline' : step === 2 ? 'shield-checkmark-outline' : 'checkmark-circle-outline'}
                    size={18} color="#fff"
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemeOverrideProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: L.panelTop },
  container: { flexGrow: 1 },
  headerPanel: { backgroundColor: L.panelTop, alignItems: 'center', paddingTop: 60, paddingBottom: Spacing.xxl, position: 'relative' },
  backButton: { position: 'absolute', top: 50, left: 20, padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)' },
  logoRing: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  appName: { fontSize: 27, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: Spacing.md },
  stepRow: { flexDirection: 'row', gap: 8 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  stepDotActive: { backgroundColor: '#FFFFFF', width: 24 },
  card: { backgroundColor: L.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  cardTitle: { ...Typography.h2, color: L.text, marginBottom: 6 },
  cardSubtitle: { ...Typography.body, color: L.subtext, marginBottom: Spacing.xl },
  inputGroup: { marginBottom: Spacing.md },
  label: { ...Typography.smallBold, color: L.text, marginBottom: 7 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F9F6', borderWidth: 1.5, borderColor: L.border, borderRadius: Radius.md },
  inputIcon: { marginLeft: 16, marginRight: 4 },
  input: { flex: 1, paddingVertical: 15, paddingHorizontal: 10, fontSize: 15, color: L.text, minHeight: 50 },
  otpInput: { fontSize: 24, fontWeight: '800', letterSpacing: 6, textAlign: 'center' },
  eyeIcon: { position: 'absolute', right: 14, padding: 4 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.md },
  resendText: { fontSize: 13, color: L.muted },
  resendLink: { fontSize: 13, fontWeight: '700', color: L.primary },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: L.primary, paddingVertical: 17, borderRadius: Radius.pill, marginTop: Spacing.md },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { ...Typography.bodyBold, color: '#FFFFFF', fontSize: 16 },
});
