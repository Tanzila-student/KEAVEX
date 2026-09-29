import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { StatusBadge } from '../../components/StatusBadge';
import { mockAnalysis } from '../constants/mockAnalysis';

type ReassessmentResult = {
  capability?: string;
  previous_status?: 'strong' | 'developing' | 'insufficient';
  status?: 'strong' | 'developing' | 'insufficient';
  change_reason?: string;
  new_evidence?: string;
  convergence?: {
    status?: string;
    summary?: string;
  };
};

export default function ReassessmentScreen() {
  const { name, response, reassessment } =
    useLocalSearchParams<{
      name?: string;
      response?: string;
      reassessment?: string;
    }>();

  const capability =
    mockAnalysis.capabilities.find((item) => item.name === name) ??
    mockAnalysis.capabilities[0];

  const submittedEvidence = response ?? '';

  let result: ReassessmentResult | null = null;

  try {
    if (reassessment) {
      result = JSON.parse(reassessment);
    }
  } catch {
    result = null;
  }

  const previousStatus =
    result?.previous_status ?? capability.status;

  const newStatus =
    result?.status ?? capability.status;

  const changeReason =
    result?.change_reason ??
    'KEAVEX could not retrieve the reassessment reasoning.';

  const convergenceSummary =
    result?.convergence?.summary;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Demonstrate</Text>
      </Pressable>

      <Text style={styles.eyebrow}>REASSESSMENT</Text>

      <Text style={styles.title}>
        Your evidence changed the assessment
      </Text>

      <Text style={styles.subtitle}>
        KEAVEX compared the new evidence with what was previously
        supported.
      </Text>

      <View style={styles.capabilityHeader}>
        <Text style={styles.capabilityName}>
          {capability.name}
        </Text>
      </View>

      <View style={styles.changeCard}>
        <View style={styles.changeColumn}>
          <Text style={styles.changeLabel}>BEFORE</Text>

          <StatusBadge status={previousStatus} />

          <Text style={styles.changeText}>
            {previousStatus === 'insufficient'
              ? 'The available evidence did not support a stronger conclusion.'
              : previousStatus === 'developing'
                ? 'The existing evidence supported a developing conclusion.'
                : 'The existing evidence supported a strong conclusion.'}
          </Text>
        </View>

        <View style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>

        <View style={styles.changeColumn}>
          <Text style={styles.changeLabel}>NOW</Text>

          <StatusBadge status={newStatus} />

          <Text style={styles.changeText}>
            {newStatus === 'strong'
              ? 'The new evidence supports a stronger conclusion.'
              : newStatus === 'developing'
                ? 'The new evidence supports additional practical reasoning.'
                : 'The new evidence is still insufficient for a stronger conclusion.'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        New evidence submitted
      </Text>

      <View style={styles.evidenceCard}>
        <Text style={styles.evidenceText}>
          {submittedEvidence || 'No evidence was submitted.'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Why the conclusion changed
      </Text>

      <View style={styles.reasonCard}>
        <Text style={styles.reasonTitle}>
          {newStatus === previousStatus
            ? 'Assessment maintained'
            : 'Assessment updated'}
        </Text>

        <Text style={styles.reasonText}>
          {changeReason}
        </Text>
      </View>

      {convergenceSummary ? (
        <>
          <Text style={styles.sectionTitle}>
            Evidence convergence
          </Text>

          <View style={styles.convergenceCard}>
            <Text style={styles.convergenceText}>
              {convergenceSummary}
            </Text>
          </View>
        </>
      ) : null}

      <View style={styles.boundaryCard}>
        <Text style={styles.boundaryLabel}>
          WHAT THIS DOES NOT MEAN
        </Text>

        <Text style={styles.boundaryText}>
          A stronger assessment does not mean every capability
          is proven. It means the available evidence now supports
          a narrower conclusion than before.
        </Text>
      </View>

      <Pressable
        style={styles.doneButton}
        onPress={() => router.push('/evidence-map')}
      >
        <Text style={styles.doneButtonText}>
          Back to Evidence Map →
        </Text>
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

  capabilityHeader: {
    marginBottom: 18,
  },

  capabilityName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },

  changeCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  changeColumn: {
    flex: 1,
  },

  changeLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 9,
  },

  changeText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    paddingRight: 12,
  },

  arrow: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '600',
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 12,
  },

  evidenceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
  },

  evidenceText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },

  reasonCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 20,
    marginBottom: 18,
  },

  reasonTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  reasonText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  convergenceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },

  convergenceText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  boundaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
  },

  boundaryLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 7,
  },

  boundaryText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },

  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },

  doneButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '600',
  },
});