import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { Palette, Shadows, Radius, Spacing, Typography } from '@/constants/theme';
import { ThemeOverrideProvider } from '@/context/ThemeOverrideContext';
import ValidationModal from '@/components/ValidationModal';

// ─── Light Auth Palette ────────────────────────────────────────────────────────
const L = {
  bg:           '#F2F8F4',
  card:         '#FFFFFF',
  inputBg:      '#F4FAF6',
  border:       '#D9E8E1',
  borderFocus:  '#0F9D58',
  text:         '#0A1C13',
  subtext:      '#3D5E50',
  muted:        '#8BA89E',
  primary:      '#0F9D58',
  primaryDim:   '#E3F4EB',
  accent:       '#34C759',
  panelTop:     '#0F9D58',
  panelMid:     '#0D8A4C',
  panelBottom:  '#0B6B3A',
};

export default function LoginScreen() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused]   = useState(false);
  const { login, isLoading }            = useAuth();
  const router                          = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle]     = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const emailRef = React.useRef<TextInput>(null);
  const passRef  = React.useRef<TextInput>(null);

  const showError = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Missing Fields', 'Please enter your email and password.');
      return;
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      showError('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      showError('Invalid Password', 'Password must be at least 6 characters.');
      return;
    }
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      showError('Login Failed', err.toString());
    }
  };

  return (
    <ThemeOverrideProvider scheme="light">
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}>

          {/* ── Green Header ─────────────────────────── */}
          <View style={styles.headerPanel}>
            {/* Decorative bubbles */}
            <View style={styles.bubble1} />
            <View style={styles.bubble2} />
            <View style={styles.bubble3} />
            <View style={styles.bubble4} />

            {/* Logo */}
            <View style={[styles.logoGlow, Shadows.glow('#34C759')]}>
              <View style={styles.logoRing}>
                <MaterialCommunityIcons name="leaf" size={44} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.appName}>AgriSense Lanka</Text>
            <Text style={styles.appTagline}>Smart Farming, Better Yields</Text>
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="chip" size={11} color={L.panelTop} />
              <Text style={styles.aiBadgeText}>AI-POWERED FARMING</Text>
            </View>
          </View>

          {/* ── White Card ─────────────────────────── */}
          <View style={styles.card}>
            {/* Card top accent strip */}
            <View style={styles.cardAccentStrip} />

            <Text style={styles.cardTitle}>Welcome back 👋</Text>
            <Text style={styles.cardSubtitle}>Sign in to manage your farm</Text>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TouchableOpacity
                activeOpacity={1}
                style={[styles.inputWrapper, emailFocused && styles.inputFocused]}
                onPress={() => emailRef.current?.focus()}>
                <View style={[styles.inputIconWrap, { backgroundColor: emailFocused ? L.primaryDim : '#F0F7F3' }]}>
                  <Ionicons name="mail-outline" size={18} color={emailFocused ? L.primary : L.muted} />
                </View>
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={L.muted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passRef.current?.focus()}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </TouchableOpacity>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                activeOpacity={1}
                style={[styles.inputWrapper, passFocused && styles.inputFocused]}
                onPress={() => passRef.current?.focus()}>
                <View style={[styles.inputIconWrap, { backgroundColor: passFocused ? L.primaryDim : '#F0F7F3' }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={passFocused ? L.primary : L.muted} />
                </View>
                <TextInput
                  ref={passRef}
                  style={[styles.input, { paddingRight: 52 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={L.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={L.muted} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotWrapper}
              onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}>
              {/* Button shine overlay */}
              <View style={styles.buttonShine} />
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <Link href="/(auth)/register" asChild>
              <TouchableOpacity style={styles.outlineButton}>
                <Ionicons name="person-add-outline" size={17} color={L.primary} />
                <Text style={styles.outlineButtonText}>Create an Account</Text>
              </TouchableOpacity>
            </Link>

            <Text style={styles.footer}>
              By continuing, you agree to AgriSense Lanka&apos;s Terms of Service.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ValidationModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </ThemeOverrideProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: L.panelTop },
  container: { flexGrow: 1 },

  // ── Header Panel ────────────────────────────
  headerPanel: {
    backgroundColor: L.panelTop,
    alignItems: 'center',
    paddingTop: Spacing.xxl + Spacing.xl,
    paddingBottom: Spacing.xxl + Spacing.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  bubble1: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -100, right: -80,
  },
  bubble2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: 10, left: -40,
  },
  bubble3: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.07)', top: 40, left: 60,
  },
  bubble4: {
    position: 'absolute', width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: 30, right: 50,
  },
  logoGlow: {
    borderRadius: 55,
    marginBottom: Spacing.md,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  logoRing: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.40)',
    alignItems: 'center', justifyContent: 'center',
  },
  appName: {
    fontSize: 28, fontWeight: '800', color: '#FFFFFF',
    letterSpacing: -0.6, marginBottom: 4,
  },
  appTagline: {
    fontSize: 13, color: 'rgba(255,255,255,0.75)',
    marginBottom: 14, letterSpacing: 0.3,
  },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  aiBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: L.panelTop },

  // ── White Card ────────────────────────────────
  card: {
    backgroundColor: L.card,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    ...Shadows.xl,
    overflow: 'hidden',
  },
  cardAccentStrip: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
    backgroundColor: L.primary,
    opacity: 0.7,
  },
  cardTitle: { ...Typography.h2, color: L.text, marginBottom: 6, fontSize: 26 },
  cardSubtitle: { ...Typography.body, color: L.subtext, marginBottom: Spacing.xl },

  // ── Inputs ────────────────────────────────────
  inputGroup: { marginBottom: Spacing.md },
  label: { ...Typography.smallBold, color: L.text, marginBottom: 8, letterSpacing: 0.2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: L.inputBg, borderWidth: 1.5, borderColor: L.border,
    borderRadius: Radius.lg, overflow: 'hidden',
  },
  inputFocused: { borderColor: L.borderFocus, backgroundColor: '#FFFFFF' },
  inputIconWrap: {
    width: 52, height: 54,
    alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 10,
    fontSize: 16,
    color: L.text,
    height: 54,
  },
  eyeIcon: { position: 'absolute', right: 14, padding: 4 },

  forgotWrapper: { alignSelf: 'flex-end', marginBottom: Spacing.xl, marginTop: 4 },
  forgotText: { ...Typography.smallBold, color: L.primary },

  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: L.primary, paddingVertical: 18, borderRadius: Radius.pill,
    ...Shadows.colored(L.primary),
    overflow: 'hidden',
    position: 'relative',
  },
  buttonShine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: Radius.pill,
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { ...Typography.bodyBold, color: '#FFFFFF', fontSize: 17 },

  divider: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: Spacing.lg, gap: Spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8F0EB' },
  dividerText: { ...Typography.small, color: L.muted, fontSize: 12 },

  outlineButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: L.primary, paddingVertical: 16,
    borderRadius: Radius.pill, backgroundColor: L.primaryDim,
  },
  outlineButtonText: { ...Typography.bodyBold, color: L.primary, fontSize: 15 },

  footer: { ...Typography.caption, color: L.muted, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 17 },
});
