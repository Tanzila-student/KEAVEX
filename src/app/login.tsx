import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    Keyboard.dismiss();

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace('/evidence-map');
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === 'android'
            ? 'on-drag'
            : 'interactive'
        }
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={
          Platform.OS === 'ios'
        }
        bounces={false}
      >
        <View style={styles.content}>
          {/* Brand */}

          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <View style={styles.brandMarkInner} />
            </View>

            <Text style={styles.brand}>
              KEAVEX
            </Text>
          </View>

          {/* Intro */}

          <View style={styles.intro}>
            <Text style={styles.eyebrow}>
              EVIDENCE INTELLIGENCE
            </Text>

            <Text style={styles.title}>
              Know what your evidence actually
              supports.
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue building, testing,
              and strengthening what you can prove.
            </Text>
          </View>

          {/* Form */}

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>
                EMAIL
              </Text>

              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);

                  if (error) {
                    setError('');
                  }
                }}
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                editable={!loading}
                returnKeyType="next"
                style={[
                  styles.input,
                  error && styles.inputError,
                ]}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                PASSWORD
              </Text>

              <TextInput
                value={password}
                onChangeText={(value) => {
                  setPassword(value);

                  if (error) {
                    setError('');
                  }
                }}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                textContentType="password"
                autoComplete="password"
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                style={[
                  styles.input,
                  error && styles.inputError,
                ]}
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <View style={styles.errorDot} />

                <Text style={styles.error}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                loading &&
                  styles.buttonDisabled,
                pressed &&
                  !loading &&
                  styles.buttonPressed,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator
                    color={colors.surface}
                    size="small"
                  />

                  <Text style={styles.buttonText}>
                    Signing in…
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  Sign in
                </Text>
              )}
            </Pressable>
          </View>

          {/* Trust line */}

          <View style={styles.footer}>
            <View style={styles.footerLine} />

            <Text style={styles.footerText}>
              Your evidence stays yours.
            </Text>

            <View style={styles.footerLine} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 56,
  },

  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  brandMarkInner: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.95,
  },

  brand: {
    color: '#0F172A',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 2.2,
  },

  intro: {
    marginBottom: 34,
  },

  eyebrow: {
    color: '#4F46E5',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.25,
    marginBottom: 11,
  },

  title: {
    ...typography.title,
    color: '#0F172A',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.7,
    marginBottom: 13,
  },

  subtitle: {
    ...typography.body,
    color: '#64748B',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 460,
  },

  form: {
    width: '100%',
  },

  field: {
    marginBottom: 19,
  },

  label: {
    color: '#475569',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    color: '#0F172A',
    fontSize: 15,
  },

  inputError: {
    borderColor: '#FCA5A5',
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7F7',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: -3,
    marginBottom: 17,
  },

  errorDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#DC2626',
    marginTop: 6,
    marginRight: 9,
  },

  error: {
    flex: 1,
    color: '#991B1B',
    fontSize: 13,
    lineHeight: 19,
  },

  button: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 4,
  },

  buttonPressed: {
    opacity: 0.88,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },

  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 34,
    paddingHorizontal: 4,
  },

  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  footerText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    marginHorizontal: 12,
  },
});