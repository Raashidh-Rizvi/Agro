import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { Shadows, Radius, Spacing, Typography } from '@/constants/theme';
import { ThemeOverrideProvider } from '@/context/ThemeOverrideContext';

// ─── Light Auth Palette ────────────────────────────────────────────────────────
const L = {
  bg:          '#F4F9F6',
  card:        '#FFFFFF',
  inputBg:     '#F4F9F6',
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

const ROLES = ['Farmer', 'Expert'] as const;
type Role = typeof ROLES[number];

const ROLE_META: Record<Role, { icon: keyof typeof MaterialCommunityIcons.glyphMap; desc: string }> = {
  Farmer: { icon: 'tractor',       desc: 'I grow crops & manage land' },
  Expert: { icon: 'flask-outline', desc: 'I provide agri-tech advice' },
};

export default function RegisterScreen() {
  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]                 = useState<Role>('Farmer');
  const [nameFocused, setNameFocused]   = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused]   = useState(false);
  const { register, isLoading }         = useAuth();
  const router                          = useRouter();

  const nameRef  = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passRef  = useRef<TextInput>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields to continue.');
      return;
    }
    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters.');
      return;
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), password, role });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.toString());
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
            <View style={styles.logoRing}>
              <MaterialCommunityIcons name="sprout" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>Create Account</Text>
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="chip" size={11} color={L.panelTop} />
              <Text style={styles.aiBadgeText}>AI-POWERED AGRI PLATFORM</Text>
            </View>
          </View>

          {/* ── White Card ─────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Join AgriSense Lanka 🌱</Text>
            <Text style={styles.cardSubtitle}>Start your smart farming journey</Text>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TouchableOpacity activeOpacity={1} style={[styles.inputWrapper, nameFocused && styles.inputFocused]} onPress={() => nameRef.current?.focus()}>
                <Ionicons name="person-outline" size={18}
                  color={nameFocused ? L.primary : L.muted} style={styles.inputIcon} />
                <TextInput
                  ref={nameRef}
                  style={styles.input} placeholder="e.g. Kamal Perera"
                  placeholderTextColor={L.muted} value={name} onChangeText={setName}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    if (Platform.OS === 'web') (document as any)?.activeElement?.blur?.();
                    else emailRef.current?.focus();
                  }}
                  autoCapitalize="words"
                  onFocus={() => setNameFocused(true)} onBlur={() => setNameFocused(false)}
                />
              </TouchableOpacity>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TouchableOpacity activeOpacity={1} style={[styles.inputWrapper, emailFocused && styles.inputFocused]} onPress={() => emailRef.current?.focus()}>
                <Ionicons name="mail-outline" size={18}
                  color={emailFocused ? L.primary : L.muted} style={styles.inputIcon} />
                <TextInput
                  ref={emailRef}
                  style={styles.input} placeholder="you@example.com"
                  placeholderTextColor={L.muted} value={email} onChangeText={setEmail}
                  autoCapitalize="none" keyboardType="email-address" returnKeyType="next"
                  onSubmitEditing={() => passRef.current?.focus()}
                  onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                />
              </TouchableOpacity>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity activeOpacity={1} style={[styles.inputWrapper, passFocused && styles.inputFocused]} onPress={() => passRef.current?.focus()}>
                <Ionicons name="lock-closed-outline" size={18}
                  color={passFocused ? L.primary : L.muted} style={styles.inputIcon} />
                <TextInput
                  ref={passRef}
                  style={[styles.input, { paddingRight: 48 }]}
                  placeholder="Choose a strong password" placeholderTextColor={L.muted}
                  value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
                  returnKeyType="done" onSubmitEditing={handleRegister}
                  onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)}
                />
                <TouchableOpacity style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={L.muted} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            {/* Role Selector */}
            <View style={styles.roleSection}>
              <Text style={styles.label}>I am a…</Text>
              <View style={styles.roleContainer}>
                {ROLES.map((r) => {
                  const isActive = role === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleCard, isActive && styles.roleCardActive]}
                      onPress={() => setRole(r)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.roleIconRing, isActive && styles.roleIconRingActive]}>
                        <MaterialCommunityIcons
                          name={ROLE_META[r].icon} size={24}
                          color={isActive ? '#FFFFFF' : L.primary}
                        />
                      </View>
                      <Text style={[styles.roleTitle, isActive && styles.roleTitleActive]}>{r}</Text>
                      <Text style={[styles.roleDesc, isActive && styles.roleDescActive]}>
                        {ROLE_META[r].desc}
                      </Text>
                      {isActive && (
                        <View style={styles.roleCheck}>
                          <Ionicons name="checkmark-circle" size={18} color={L.primary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister} disabled={isLoading} activeOpacity={0.85}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.buttonText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>Already have an account? Sign In</Text>
              </TouchableOpacity>
            </Link>

            <Text style={styles.footer}>
              By creating an account, you agree to AgriSense Lanka&apos;s Terms of Service and Privacy Policy.
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

  headerPanel: {
    backgroundColor: L.panelTop, alignItems: 'center',
    paddingTop: Spacing.xxl + Spacing.lg, paddingBottom: Spacing.xl + Spacing.sm,
    overflow: 'hidden', position: 'relative',
  },
  bubble1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -60,
  },
  bubble2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: 0, left: -20,
  },
  logoRing: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center',
    justifyContent: 'center', marginBottom: Spacing.md,
  },
  appName: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 10 },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 5, borderRadius: Radius.pill,
  },
  aiBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: L.panelTop },

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
    backgroundColor: L.inputBg, borderWidth: 1.5, borderColor: L.border, borderRadius: Radius.md,
  },
  inputFocused: { borderColor: L.borderFocus, backgroundColor: '#FFFFFF' },
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

  roleSection: { marginBottom: Spacing.xl, marginTop: Spacing.xs },
  roleContainer: { flexDirection: 'row', gap: 12, marginTop: 8 },
  roleCard: {
    flex: 1, padding: 16, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: L.border, backgroundColor: L.card,
    alignItems: 'center', position: 'relative', ...Shadows.xs,
  },
  roleCardActive: { backgroundColor: L.primaryDim, borderColor: L.primary },
  roleIconRing: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: L.primaryDim, alignItems: 'center',
    justifyContent: 'center', marginBottom: 10,
  },
  roleIconRingActive: { backgroundColor: L.primary },
  roleTitle: { ...Typography.bodyBold, color: L.subtext, marginBottom: 4 },
  roleTitleActive: { color: L.text },
  roleDesc: { ...Typography.caption, color: L.muted, textAlign: 'center', lineHeight: 14 },
  roleDescActive: { color: L.subtext },
  roleCheck: { position: 'absolute', top: 10, right: 10 },

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
