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
import { Link, useRouter } from 'expo-router';
import { Palette, Shadows, Radius, Spacing, Typography } from '@/constants/theme';
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

export default function LoginScreen() {
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [emailFocused, setEmailFocused]   = useState(false);
  const [passFocused, setPassFocused]     = useState(false);
  const { login, isLoading }              = useAuth();
  const router                            = useRouter();

  const emailRef = React.useRef<TextInput>(null);
  const passRef  = React.useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.toString());
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
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Green Header ─────────────────────────── */}
          <View style={styles.headerPanel}>
            <View style={styles.bubble1} />
            <View style={styles.bubble2} />
            <View style={styles.bubble3} />

            <View style={styles.logoRing}>
              <MaterialCommunityIcons name="leaf" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>AgriSense Lanka</Text>
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="chip" size={11} color={L.panelTop} />
              <Text style={styles.aiBadgeText}>AI-POWERED FARMING</Text>
            </View>
          </View>

          {/* ── White Card ─────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back 👋</Text>
            <Text style={styles.cardSubtitle}>Sign in to manage your farm</Text>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TouchableOpacity activeOpacity={1} style={[styles.inputWrapper, emailFocused && styles.inputFocused]} onPress={() => emailRef.current?.focus()}>
                <Ionicons name="mail-outline" size={18} color={emailFocused ? L.primary : L.muted} style={styles.inputIcon} />
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
              <TouchableOpacity activeOpacity={1} style={[styles.inputWrapper, passFocused && styles.inputFocused]} onPress={() => passRef.current?.focus()}>
                <Ionicons name="lock-closed-outline" size={18} color={passFocused ? L.primary : L.muted} style={styles.inputIcon} />
                <TextInput
                  ref={passRef}
                  style={[styles.input, { paddingRight: 48 }]}
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
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={L.muted} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.forgotWrapper}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
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
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Link href="/(auth)/register" asChild>
              <TouchableOpacity style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>Create an Account</Text>
              </TouchableOpacity>
            </Link>

            <Text style={styles.footer}>
              By continuing, you agree to AgriSense Lanka&apos;s Terms of Service.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemeOverrideProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: L.panelTop },
  container: { flexGrow: 1 },

  // ── Header Panel ──────────────────────────────
  headerPanel: {
    backgroundColor: L.panelTop,
    alignItems: 'center',
    paddingTop: Spacing.xxl + Spacing.xl,
    paddingBottom: Spacing.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  bubble1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)', top: -70, right: -70,
  },
  bubble2: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: 0, left: -35,
  },
  bubble3: {
    position: 'absolute', width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.05)', top: 30, left: 50,
  },
  logoRing: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  appName: { fontSize: 27, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 10 },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  aiBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: L.panelTop },

  // ── White Card ────────────────────────────────
  card: {
    backgroundColor: L.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl,
    ...Shadows.lg,
  },
  cardTitle: { ...Typography.h2, color: L.text, marginBottom: 6 },
  cardSubtitle: { ...Typography.body, color: L.subtext, marginBottom: Spacing.xl },

  // ── Inputs ────────────────────────────────────
  inputGroup: { marginBottom: Spacing.md },
  label: { ...Typography.smallBold, color: L.text, marginBottom: 7 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F4F9F6', borderWidth: 1.5, borderColor: L.border, borderRadius: Radius.md,
  },
  inputFocused: { borderColor: L.borderFocus, backgroundColor: '#FFFFFF', ...Shadows.xs },
  inputIcon: { marginLeft: 16, marginRight: 4 },
  input: { 
    flex: 1, 
    paddingVertical: 12, 
    paddingHorizontal: 10, 
    fontSize: 16, 
    color: L.text,
    minHeight: 50,
  },
  eyeIcon: { position: 'absolute', right: 14, padding: 4 },

  forgotWrapper: { alignSelf: 'flex-end', marginBottom: Spacing.xl, marginTop: 4 },
  forgotText: { ...Typography.smallBold, color: L.primary },

  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: L.primary, paddingVertical: 17, borderRadius: Radius.pill,
    ...Shadows.colored(L.primary),
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { ...Typography.bodyBold, color: '#FFFFFF', fontSize: 16 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg, gap: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EEF2F0' },
  dividerText: { ...Typography.small, color: L.muted },

  outlineButton: {
    borderWidth: 1.5, borderColor: L.primary, paddingVertical: 15,
    borderRadius: Radius.pill, alignItems: 'center', backgroundColor: L.primaryDim,
  },
  outlineButtonText: { ...Typography.bodyBold, color: L.primary, fontSize: 15 },

  footer: { ...Typography.caption, color: L.muted, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 17 },
});
