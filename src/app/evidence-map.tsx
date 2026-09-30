import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { mockAnalysis } from '../constants/mockAnalysis';


type Capability = (typeof mockAnalysis.capabilities)[number];
type EvidenceItem = Capability['supportedBy'][number];

export default function EvidenceMapScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.eyebrow}>KEAVEX</Text>

      <Text style={styles.title}>Evidence Map</Text>

      <View style={styles.overview}>
        <Text style={styles.overviewLabel}>
          What we can defend today
        </Text>

        <StatusBadge status={mockAnalysis.overall_status} />

        <Text style={styles.summary}>
          {mockAnalysis.summary}
        </Text>

        <Text style={styles.boundary}>
          This is not a skill score. It is an evidence boundary.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Where the evidence stands
        </Text>

        <Text style={styles.sectionDescription}>
          Each capability shows what your current evidence supports,
          where the claim breaks, and what could strengthen it.
        </Text>
      </View>

      <View style={styles.cards}>
        {mockAnalysis.capabilities.map(
          (capability: Capability) => (
            <View
              style={styles.card}
              key={capability.name}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {capability.name}
                </Text>

                <StatusBadge status={capability.status} />
              </View>

              <View style={styles.block}>
                <Text style={styles.blockLabel}>
                  CLAIM
                </Text>

                <Text style={styles.claim}>
                  {capability.claim}
                </Text>
              </View>

              <View style={styles.block}>
                <Text style={styles.blockLabel}>
                  EVIDENCE SO FAR
                </Text>

                {capability.supportedBy.map(
                  (
                    evidence: EvidenceItem,
                    index: number,
                  ) => (
                    <View
                      key={`${evidence.source}-${index}`}
                      style={styles.evidenceRow}
                    >
                      <Text style={styles.evidenceStrength}>
                        {evidence.strength}
                      </Text>

                      <Text style={styles.evidenceSource}>
                        {evidence.source}
                      </Text>
                    </View>
                  ),
                )}
              </View>

              <View style={styles.breakBlock}>
                <Text style={styles.breakLabel}>
                  WHERE IT BREAKS
                </Text>

                <Text style={styles.breakTitle}>
                  {capability.evidenceGap.title}
                </Text>

                <Text style={styles.breakText}>
                  {capability.evidenceGap.description}
                </Text>
              </View>

              <Pressable
                style={styles.proveButton}
                onPress={() =>
                  router.push({
                    pathname: '/capability',
                    params: {
                      name: capability.name,
                    },
                  })
                }
              >
                <Text style={styles.proveButtonText}>
                  Prove this →
                </Text>
              </Pressable>
            </View>
          ),
        )}
      </View>
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
    paddingTop: 48,
    paddingBottom: 64,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },

  title: {
    ...typography.title,
    color: colors.textPrimary,
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 22,
  },

  overview: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 22,
    marginBottom: 36,
  },

  overviewLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },

  summary: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 720,
    marginTop: 14,
  },

  boundary: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },

  sectionHeader: {
    marginBottom: 16,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },

  sectionDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 700,
  },

  cards: {
    gap: 16,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    width: '100%',
  },

  cardTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    flexShrink: 1,
    paddingRight: 12,
  },

  block: {
    marginBottom: 18,
  },

  blockLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 7,
  },

  claim: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
  },

  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
    width: '100%',
  },

  evidenceStrength: {
    color: colors.textSecondary,
    backgroundColor: colors.background,
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 8,
    textTransform: 'lowercase',
  },

  evidenceSource: {
    color: colors.textPrimary,
    fontSize: 14,
    flexShrink: 1,
  },

  breakBlock: {
    backgroundColor: colors.developingBg,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    marginBottom: 20,
  },

  breakLabel: {
    color: colors.developing,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },

  breakTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 5,
  },

  breakText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },

  proveButton: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  proveButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});