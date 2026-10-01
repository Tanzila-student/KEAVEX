import { router, useLocalSearchParams } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { mockAnalysis } from '../constants/mockAnalysis';

type Capability = (typeof mockAnalysis.capabilities)[number];

const LIVE_DOCKER_STATUS = 'developing' as const;

export default function CapabilityScreen() {
  const { name } = useLocalSearchParams<{ name?: string }>();

  const baseCapability =
    mockAnalysis.capabilities.find(
      (item) => item.name === name,
    ) ?? mockAnalysis.capabilities[0];

  const capability: Capability =
    baseCapability.name === 'Containerization (Docker)'
      ? {
          ...baseCapability,
          status: LIVE_DOCKER_STATUS,
        }
      : baseCapability;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={styles.backButton}
      >
        <Text style={styles.backText}>
          Evidence Map
        </Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          CAPABILITY
        </Text>

        <Text style={styles.title}>
          {capability.name}
        </Text>

        <StatusBadge status={capability.status} />
      </View>

      <View style={styles.claimCard}>
        <Text style={styles.cardLabel}>
          CURRENT CLAIM
        </Text>

        <Text style={styles.claim}>
          {capability.claim}
        </Text>

        <Text style={styles.claimNote}>
          The assessment reflects what the available evidence
          currently supports.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>
          EVIDENCE
        </Text>

        <Text style={styles.sectionTitle}>
          What supports this claim?
        </Text>
      </View>

      <View style={styles.evidenceCard}>
        {capability.supportedBy.map(
          (evidence, index) => (
            <View
              key={`${evidence.source}-${index}`}
              style={[
                styles.evidenceItem,
                index < capability.supportedBy.length - 1 &&
                  styles.evidenceItemSpacing,
              ]}
            >
              <View style={styles.evidenceHeader}>
                <Text style={styles.source}>
                  {evidence.source}
                </Text>

                <Text style={styles.strength}>
                  {evidence.strength}
                </Text>
              </View>

              <Text style={styles.detail}>
                {evidence.detail}
              </Text>
            </View>
          ),
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>
          EVIDENCE BOUNDARY
        </Text>

        <Text style={styles.sectionTitle}>
          What remains unproven?
        </Text>
      </View>

      <View style={styles.unknownCard}>
        {capability.unknowns.map((unknown, index) => (
          <View
            style={[
              styles.unknownRow,
              index < capability.unknowns.length - 1 &&
                styles.unknownRowSpacing,
            ]}
            key={unknown}
          >
            <View style={styles.unknownDot} />

            <Text style={styles.unknownText}>
              {unknown}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>
          NEXT EVIDENCE
        </Text>

        <Text style={styles.sectionTitle}>
          What would strengthen this?
        </Text>
      </View>

      <View style={styles.gapCard}>
        <View style={styles.gapAccent} />

        <View style={styles.gapContent}>
          <Text style={styles.gapTitle}>
            {capability.evidenceGap.title}
          </Text>

          <Text style={styles.gapDescription}>
            {capability.evidenceGap.description}
          </Text>

          <View style={styles.whyBlock}>
            <Text style={styles.whyLabel}>
              WHY IT MATTERS
            </Text>

            <Text style={styles.whyText}>
              {capability.evidenceGap.why_it_matters}
            </Text>
          </View>

          <View style={styles.taskBlock}>
            <Text style={styles.taskLabel}>
              DEMONSTRATION
            </Text>

            <Text style={styles.taskTitle}>
              {capability.nextEvidence.task_title}
            </Text>

            <Text style={styles.taskPrompt}>
              {capability.nextEvidence.task_prompt}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.demonstrateButton}
        onPress={() =>
          router.push({
            pathname: '/demonstrate',
            params: {
              name: capability.name,
            },
          })
        }
      >
        <Text style={styles.demonstrateText}>
          Demonstrate this capability
        </Text>

        <Text style={styles.buttonSubtext}>
          Add evidence and reassess
        </Text>
      </Pressable>

      <Text style={styles.footerNote}>
        New evidence can change the assessment.
      </Text>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 56,
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    marginBottom: 28,
  },

  backText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },

  header: {
    marginBottom: 28,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 8,
  },

  title: {
    ...typography.title,
    color: colors.textPrimary,
    fontSize: 29,
    lineHeight: 37,
    fontWeight: '700',
    marginBottom: 12,
  },

  claimCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 19,
    marginBottom: 30,
  },

  cardLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 9,
  },

  claim: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 10,
  },

  claimNote: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },

  sectionHeader: {
    marginBottom: 11,
  },

  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 5,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '600',
  },

  evidenceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 30,
  },

  evidenceItem: {
    minWidth: 0,
  },

  evidenceItemSpacing: {
    paddingBottom: 18,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 7,
  },

  source: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  strength: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'lowercase',
  },

  detail: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },

  unknownCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 30,
  },

  unknownRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: 0,
  },

  unknownRowSpacing: {
    marginBottom: 13,
  },

  unknownDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
    marginTop: 8,
    marginRight: 10,
  },

  unknownText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },

  gapCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 22,
    flexDirection: 'row',
  },

  gapAccent: {
    width: 3,
    alignSelf: 'stretch',
    minHeight: 70,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginRight: 13,
  },

  gapContent: {
    flex: 1,
    minWidth: 0,
  },

  gapTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    marginBottom: 7,
  },

  gapDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },

  whyBlock: {
    marginTop: 17,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  whyLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.9,
    marginBottom: 5,
  },

  whyText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },

  taskBlock: {
    marginTop: 17,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  taskLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.9,
    marginBottom: 5,
  },

  taskTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: 5,
  },

  taskPrompt: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },

  demonstrateButton: {
    minHeight: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  demonstrateText: {
    color: colors.surface,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },

  buttonSubtext: {
    color: colors.surface,
    opacity: 0.75,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
    fontWeight: '400',
  },

  footerNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
  },
});