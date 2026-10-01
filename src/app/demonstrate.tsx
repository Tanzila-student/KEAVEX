
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { isPro } from '../lib/purchases';

const FREE_LIMIT = 1;
const MIN_EVIDENCE_LENGTH = 50;

const ANALYSIS_ID =
  '7799c856-8429-4e5a-b357-75c5d666d683';

const DOCKER_CAPABILITY_ID =
  'cdecbfdb-c4ca-467e-9267-dff5f68ce993';

const capability = {
  name: 'Containerization (Docker)',

  taskTitle:
    'A Spring Boot container keeps restarting in production.',

  taskPrompt:
    'How would you isolate the cause, diagnose the failure, and recover the service?',
};

export default function DemonstrateScreen() {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showEvidenceTip, setShowEvidenceTip] =
    useState(false);

  const trimmedResponse = response.trim();
  const characterCount = trimmedResponse.length;

  const hasEnoughEvidence =
    characterCount >= MIN_EVIDENCE_LENGTH;

  const canSubmit =
    hasEnoughEvidence &&
    !isSubmitting &&
    !error;

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          'Not signed in. Open /login and sign in first.',
        );
      }

      const used = Number(
        session.user.user_metadata
          ?.free_reassessments_used ?? 0,
      );

      const pro = await isPro().catch(() => false);

      if (!pro && used >= FREE_LIMIT) {
        router.push('/paywall');
        return;
      }

      const { data, error: functionError } =
        await supabase.functions.invoke(
          'reassess-evidence',
          {
            body: {
              analysis_id: ANALYSIS_ID,
              capability_id:
                DOCKER_CAPABILITY_ID,
              user_response: trimmedResponse,
            },
          },
        );

      // --------------------------------------------------
      // Clean user-facing handling for backend errors.
      // Expected temporary/quota errors are handled
      // silently so React Native LogBox does not show
      // a development "Console Error" popup.
      // --------------------------------------------------

      if (functionError) {
        const status =
          functionError.context?.status;

        if (status === 429) {
          throw new Error(
            'AI_QUOTA_EXCEEDED',
          );
        }

        let backendError: any = null;

        const errorContext =
          functionError.context;

        if (
          errorContext &&
          typeof errorContext.json === 'function'
        ) {
          try {
            backendError =
              await errorContext.json();
          } catch {
            backendError = null;
          }
        }

        if (
          backendError?.error ===
          'AI_REASSESSMENT_QUOTA_EXCEEDED'
        ) {
          throw new Error(
            'AI_QUOTA_EXCEEDED',
          );
        }

        // Any temporary server / Edge Function /
        // Gemini availability problem gets one
        // clean product message.
        if (
          status &&
          status >= 500
        ) {
          throw new Error(
            'REASSESSMENT_TEMPORARILY_UNAVAILABLE',
          );
        }

        // Never expose raw Edge Function errors.
        throw new Error(
          'REASSESSMENT_TEMPORARILY_UNAVAILABLE',
        );
      }

      if (!data) {
        throw new Error(
          'REASSESSMENT_TEMPORARILY_UNAVAILABLE',
        );
      }

      if (data.error) {
        if (
          data.error ===
          'AI_REASSESSMENT_QUOTA_EXCEEDED'
        ) {
          throw new Error(
            'AI_QUOTA_EXCEEDED',
          );
        }

        throw new Error(
          'REASSESSMENT_TEMPORARILY_UNAVAILABLE',
        );
      }

      if (!pro) {
        await supabase.auth.updateUser({
          data: {
            free_reassessments_used:
              used + 1,
          },
        });
      }

      router.push({
        pathname: '/reassessment',
        params: {
          name: capability.name,
          response: trimmedResponse,
          reassessment:
            JSON.stringify(data),
        },
      });
    } catch (err) {
      // Expected product errors are rendered inside
      // the KEAVEX UI instead of being logged with
      // console.error, which would trigger React
      // Native's development LogBox popup.

      if (
        err instanceof Error &&
        err.message ===
          'AI_QUOTA_EXCEEDED'
      ) {
        setError(
          'KEAVEX has temporarily reached its AI usage limit. Your evidence is safe. Try again later.',
        );
      } else if (
        err instanceof Error &&
        err.message ===
          'REASSESSMENT_TEMPORARILY_UNAVAILABLE'
      ) {
        setError(
          'Reassessment paused. Your evidence is safe. Try again later.',
        );
      } else if (
        err instanceof Error &&
        err.message.includes(
          'Not signed in',
        )
      ) {
        setError(
          'Please sign in before continuing.',
        );
      } else {
        // Never expose raw backend / Edge Function /
        // Supabase / Gemini errors to the user.
        setError(
          'Reassessment paused. Your evidence is safe. Try again later.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* TOP NAVIGATION */}

      <Pressable
        onPress={() => router.back()}
        disabled={isSubmitting}
        hitSlop={8}
        style={styles.backButton}
      >
        <Text style={styles.backText}>
          ← Evidence Map
        </Text>
      </Pressable>

      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          NEW EVIDENCE
        </Text>

        <Text style={styles.title}>
          Demonstrate your capability
        </Text>

        <Text style={styles.subtitle}>
          Add proof that can change what KEAVEX
          can support.
        </Text>
      </View>

      {/* CAPABILITY */}

      <View style={styles.capabilityCard}>
        <Text style={styles.cardLabel}>
          CAPABILITY
        </Text>

        <Text style={styles.capabilityName}>
          {capability.name}
        </Text>
      </View>

      {/* GAP */}

      <View style={styles.gapRow}>
        <View style={styles.gapIndicator} />

        <View style={styles.gapContent}>
          <Text style={styles.gapLabel}>
            CURRENT GAP
          </Text>

          <Text style={styles.gapText}>
            Production container reasoning
          </Text>
        </View>
      </View>

      {/* CHALLENGE */}

      <View style={styles.challengeSection}>
        <Text style={styles.sectionLabel}>
          YOUR CHALLENGE
        </Text>

        <Text style={styles.challengeTitle}>
          {capability.taskTitle}
        </Text>

        <Text style={styles.challengePrompt}>
          {capability.taskPrompt}
        </Text>
      </View>

      {/* EVIDENCE GUIDANCE */}

      <View style={styles.evidenceTipWrapper}>
        <Pressable
          onPress={() =>
            setShowEvidenceTip(
              !showEvidenceTip,
            )
          }
          disabled={isSubmitting}
          style={styles.evidenceTipHeader}
        >
          <View style={styles.tipTitleRow}>
            <Text style={styles.tipIcon}>
              💡
            </Text>

            <Text style={styles.tipTitle}>
              What strong evidence looks like
            </Text>
          </View>

          <View
            style={[
              styles.tipChevron,
              showEvidenceTip &&
                styles.tipChevronUp,
            ]}
          />
        </Pressable>

        {showEvidenceTip ? (
          <>
            {/* PREMIUM TOP MESSAGE */}

            <View style={styles.brainBanner}>
              <View style={styles.brainBannerIcon}>
                <Text style={styles.brainBannerIconText}>
                  ✦
                </Text>
              </View>

              <Text style={styles.brainBannerText}>
                No Bots. Just Brains.
              </Text>
            </View>

            {/* EXISTING GUIDANCE */}

            <View style={styles.tipContent}>
              <Text style={styles.tipIntro}>
                Strong evidence shows your reasoning,
                not just the final answer.
              </Text>

              <View style={styles.tipPoint}>
                <View style={styles.tipBullet} />

                <Text style={styles.tipPointText}>
                  What you would check first
                </Text>
              </View>

              <View style={styles.tipPoint}>
                <View style={styles.tipBullet} />

                <Text style={styles.tipPointText}>
                  Why you would check it
                </Text>
              </View>

              <View style={styles.tipPoint}>
                <View style={styles.tipBullet} />

                <Text style={styles.tipPointText}>
                  What evidence would confirm the cause
                </Text>
              </View>

              <View style={styles.tipPoint}>
                <View style={styles.tipBullet} />

                <Text style={styles.tipPointText}>
                  How you would verify the fix
                </Text>
              </View>

              <Text style={styles.tipFooter}>
                You don't need the perfect answer.
                Show your reasoning.
              </Text>
            </View>
          </>
        ) : null}
      </View>

      {/* RESPONSE */}

      <View style={styles.responseSection}>
        <View style={styles.responseHeader}>
          <Text style={styles.inputLabel}>
            Your evidence
          </Text>

          <Text style={styles.inputHint}>
            Explain your reasoning.
          </Text>
        </View>

        <TextInput
          value={response}
          onChangeText={setResponse}
          placeholder="Start with how you would investigate..."
          placeholderTextColor="#64748B"
          multiline
          textAlignVertical="top"
          editable={!isSubmitting}
          style={styles.input}
        />

        <View style={styles.evidenceMeta}>
          <Text
            style={[
              styles.helper,
              hasEnoughEvidence &&
                styles.helperReady,
            ]}
          >
            {hasEnoughEvidence
              ? 'Enough detail to reassess your evidence.'
              : 'Add at least 50 characters so KEAVEX can reassess the evidence.'}
          </Text>

          <Text
            style={[
              styles.characterCount,
              hasEnoughEvidence &&
                styles.characterCountReady,
            ]}
          >
            {characterCount}/50
          </Text>
        </View>
      </View>

      {/* ERROR */}

      {error ? (
        <View style={styles.errorCard}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>
              !
            </Text>
          </View>

          <View style={styles.errorContent}>
            <Text style={styles.errorLabel}>
              TEMPORARILY UNAVAILABLE
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        </View>
      ) : null}

      {/* ACTION */}

      <Pressable
        style={[
          styles.submitButton,
          !canSubmit &&
            styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {isSubmitting ? (
          <View style={styles.submitInner}>
            <ActivityIndicator
              color={colors.surface}
            />

            <Text style={styles.loadingText}>
              Reassessing evidence…
            </Text>
          </View>
        ) : error ? (
          <Text style={styles.submitTextDisabled}>
            Try again later
          </Text>
        ) : (
          <Text style={styles.submitText}>
            Reassess my evidence
          </Text>
        )}
      </Pressable>

      <Text style={styles.footerNote}>
        Your response becomes new evidence for
        this capability.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 60,
  },

  /* TOP NAVIGATION */

  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 17,
    paddingVertical: 11,
    marginBottom: 38,
    justifyContent: 'center',
  },

  backText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },

  /* HEADER */

  header: {
    marginBottom: 30,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 9,
  },

  title: {
    color: '#0F172A',
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginBottom: 9,
  },

  subtitle: {
    color: '#64748B',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 600,
  },

  /* CAPABILITY */

  capabilityCard: {
    backgroundColor: '#EEF3FF',
    borderWidth: 1,
    borderColor: '#DCE6FF',
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingVertical: 16,
    marginBottom: 20,
  },

  cardLabel: {
    color: '#64748B',
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },

  capabilityName: {
    color: '#172554',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
  },

  /* GAP */

  gapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 34,
    paddingLeft: 4,
  },

  gapIndicator: {
    width: 3,
    height: 34,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 12,
  },

  gapContent: {
    flex: 1,
  },

  gapLabel: {
    color: '#94A3B8',
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },

  gapText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  /* CHALLENGE */

  challengeSection: {
    marginBottom: 22,
    paddingHorizontal: 2,
  },

  sectionLabel: {
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 9,
  },

  challengeTitle: {
    color: '#0F172A',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 8,
    maxWidth: 720,
  },

  challengePrompt: {
    color: '#64748B',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 700,
  },

  /* EVIDENCE GUIDANCE */

  evidenceTipWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    marginBottom: 28,
    overflow: 'hidden',
  },

  evidenceTipHeader: {
    minHeight: 50,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tipTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  tipIcon: {
    fontSize: 16,
    marginRight: 9,
  },

  tipTitle: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },

  /* REAL GEOMETRIC CHEVRON */

  tipChevron: {
    width: 9,
    height: 9,
    borderRightWidth: 1.8,
    borderBottomWidth: 1.8,
    borderColor: '#64748B',
    transform: [{ rotate: '45deg' }],
    marginLeft: 10,
    marginRight: 3,
    marginTop: -4,
  },

  tipChevronUp: {
    transform: [{ rotate: '225deg' }],
    marginTop: 4,
  },

  /* PREMIUM BRAIN BANNER */

  brainBanner: {
    minHeight: 48,
    backgroundColor: '#EEF2FF',
    borderTopWidth: 1,
    borderTopColor: '#E0E7FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  brainBannerIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  brainBannerIconText: {
    color: '#4F46E5',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },

  brainBannerText: {
    color: '#3730A3',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: -0.1,
  },

  tipContent: {
    borderTopWidth: 0,
    paddingHorizontal: 15,
    paddingTop: 13,
    paddingBottom: 15,
  },

  tipIntro: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 11,
  },

  tipPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 7,
  },

  tipBullet: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
    marginTop: 7,
    marginRight: 9,
  },

  tipPointText: {
    flex: 1,
    color: '#475569',
    fontSize: 12,
    lineHeight: 19,
  },

  tipFooter: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
    fontStyle: 'italic',
    marginTop: 5,
  },

  /* RESPONSE */

  responseSection: {
    marginBottom: 21,
  },

  responseHeader: {
    marginBottom: 10,
  },

  inputLabel: {
    color: '#0F172A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 3,
  },

  inputHint: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },

  input: {
    minHeight: 210,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE3EC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#0F172A',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 9,
  },

  evidenceMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  helper: {
    flex: 1,
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
  },

  helperReady: {
    color: '#475569',
  },

  characterCount: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '600',
  },

  characterCountReady: {
    color: '#4F46E5',
  },

  /* PREMIUM TEMPORARY ERROR STATE */

  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 26,
  },

  errorIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  errorIconText: {
    color: '#B45309',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },

  errorContent: {
    flex: 1,
    paddingTop: 1,
  },

  errorLabel: {
    color: '#92400E',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  errorText: {
    color: '#78350F',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },

  /* ACTION */

  submitButton: {
    minHeight: 55,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  submitButtonDisabled: {
    backgroundColor: '#CBD5E1',
    opacity: 1,
  },

  submitInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  submitText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },

  submitTextDisabled: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },

  loadingText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '600',
  },

  footerNote: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
  },
});
