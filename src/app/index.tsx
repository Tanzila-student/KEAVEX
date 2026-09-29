import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { StatusBadge } from '../../components/StatusBadge';
import { supabase } from '../../lib/supabase';

export default function WelcomeScreen() {
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('SIGN_OUT_ERROR', error);
      return;
    }

    router.replace('/login');
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>KEAVEX</Text>

        <Text style={styles.title}>
          Know what your evidence actually supports.
        </Text>

        <Text style={styles.subtitle}>
          KEAVEX evaluates your capability claims using evidence,
          identifies what is missing, and shows what you can prove next.
        </Text>

        <View style={styles.statusRow}>
          <StatusBadge status="strong" />
          <StatusBadge status="developing" />
          <StatusBadge status="insufficient" />
        </View>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/upload')}
        >
          <Text style={styles.buttonText}>Get started</Text>
        </Pressable>

        <Pressable
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },

  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 28,
  },

  brand: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 24,
  },

  title: {
    ...typography.title,
    color: colors.textPrimary,
    fontSize: 40,
    lineHeight: 48,
    maxWidth: 680,
    marginBottom: 18,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 27,
    maxWidth: 620,
    marginBottom: 28,
  },

  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },

  buttonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '600',
  },

  signOutButton: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },

  signOutText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
