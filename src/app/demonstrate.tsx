import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { supabase } from '../../lib/supabase';
import { isPro } from '../lib/purchases';

// Free users get this many reassessments before the paywall
const FREE_LIMIT = 1;

const ANALYSIS_ID = '7799c856-8429-4e5a-b357-75c5d666d683';
const DOCKER_CAPABILITY_ID = 'cdecbfdb-c4ca-467e-9267-dff5f68ce993';

const capability = {
  name: 'Containerization (Docker)',
  taskTitle: 'Design a production-ready Docker setup',
  taskPrompt:
    'Explain how you would containerize a Spring Boot application with PostgreSQL, including the Dockerfile, services, persistent database storage, health checks, and how you would verify the running containers.',
};

export default function DemonstrateScreen() {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = response.trim().length > 0 && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not signed in. Open /login and sign in first.');
      }

      // REVENUECAT INTEGRATION: check Pro entitlement before AI reassessment
      const used = Number(session.user.user_metadata?.free_reassessments_used ?? 0);
      const pro = await isPro().catch(() => false);

      if (!pro && used >= FREE_LIMIT) {
        router.push('/paywall');
        return;
      }

      const { data, error: functionError } =
        await supabase.functions.invoke('reassess-evidence', {
          body: {
            analysis_id: ANALYSIS_ID,
            capability_id: DOCKER_CAPABILITY_ID,
            user_response: response.trim(),
          },
        });

      if (functionError) {
        console.error('INVOKE_ERROR', functionError);

        throw new Error(
          functionError.message ||
            'Failed to reach reassess-evidence Edge Function',
        );
      }

      if (!data) {
        throw new Error('Empty response from reassess-evidence');
      }

      if (data.error) {
        const detail =
          typeof data.error === 'string'
            ? data.error
            : JSON.stringify(data.error);

        const extra = data.details
          ? ` - ${JSON.stringify(data.details)}`
          : '';

        throw new Error(`${detail}${extra}`);
      }

      if (!pro) {
        await supabase.auth.updateUser({
          data: { free_reassessments_used: used + 1 },
        });
      }

      router.push({
        pathname: '/reassessment',
        params: {
          name: capability.name,
          response: response.trim(),
          reassessment: JSON.stringify(data),
        },
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while reassessing your evidence.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable onPress={() => router.back()} disabled={isSubmitting}>
        <Text style={styles.back}>Back Evidence Map</Text>
      </Pressable>

      <Text style={styles.eyebrow}>NEW EVIDENCE</Text>

      <Text style={styles.title}>Demonstrate your capability</Text>

      <Text style={styles.subtitle}>
        Give KEAVEX new evidence it can use to reassess this capability.
      </Text>

      <View style={styles.taskCard}>
        <Text style={styles.taskLabel}>PROVE THIS</Text>

        <Text style={styles.taskTitle}>
          {capability.taskTitle}
        </Text>

        <Text style={styles.taskPrompt}>
          {capability.taskPrompt}
        </Text>
      </View>

      <Text style={styles.inputLabel}>Your evidence</Text>

      <TextInput
        value={response}
        onChangeText={setResponse}
        placeholder="Explain your approach, reasoning, or solution..."
        placeholderTextColor={colors.textSecondary}
        multiline
        textAlignVertical="top"
        editable={!isSubmitting}
        style={styles.input}
      />

      <Text style={styles.helper}>
        KEAVEX evaluates the evidence itself - not your writing length.
      </Text>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        style={[
          styles.submitButton,
          !canSubmit && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.submitText}>
            Submit evidence Back’
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 64,
  },

  back: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 28,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  title: {
    ...typography.title,
    color: colors.textPrimary,
    fontSize: 30,
    lineHeight: 38,
    marginBottom: 10,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 700,
    marginBottom: 28,
  },

  taskCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 20,
    marginBottom: 28,
  },

  taskLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  taskTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 23,
    marginBottom: 8,
  },

  taskPrompt: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  inputLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    minHeight: 180,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },

  helper: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 12,
  },

  errorCard: {
    backgroundColor: colors.conflictBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  errorText: {
    color: colors.error,
    fontSize: 13,
    lineHeight: 19,
  },

  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },

  submitButtonDisabled: {
    opacity: 0.45,
  },

  submitText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '600',
  },
});


