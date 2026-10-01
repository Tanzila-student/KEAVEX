import { router } from 'expo-router';
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

export default function EvidenceMapScreen() {
  const capabilities: Capability[] =
    mockAnalysis.capabilities.map((capability) => {
      if (capability.name === 'Containerization (Docker)') {
        return {
          ...capability,
          status: LIVE_DOCKER_STATUS,
        };
      }

      return capability;
    });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>KEAVEX</Text>

        <Text style={styles.title}>Evidence Map</Text>

        <Text style={styles.subtitle}>
          What your current evidence supports.
        </Text>
      </View>

      {/* CURRENT READINESS */}
      <View style={styles.overviewCard}>
        <Text style={styles.overviewLabel}>
          CURRENT READINESS
        </Text>

        <Text style={styles.overviewTitle}>
          What we can defend today
        </Text>

        <View style={styles.overviewStatus}>
          <StatusBadge status={mockAnalysis.overall_status} />
        </View>

        <Text style={styles.overviewText}>
          {mockAnalysis.summary}
        </Text>
      </View>

      {/* CAPABILITIES */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Capabilities
        </Text>

        <Text style={styles.sectionMeta}>
          {capabilities.length} areas assessed
        </Text>
      </View>

      <View style={styles.capabilityList}>
        {capabilities.map((capability) => (
          <View
            key={capability.name}
            style={styles.capabilityCard}
          >
            {/* CAPABILITY NAME */}
            <Text style={styles.capabilityName}>
              {capability.name}
            </Text>

            {/* STATUS BADGE */}
            <View style={styles.capabilityStatus}>
              <StatusBadge status={capability.status} />
            </View>

            {/* CLAIM */}
            <Text style={styles.capabilityClaim}>
              {capability.claim}
            </Text>

            {/* EVIDENCE GAP */}
            <View style={styles.gapBox}>
              <View style={styles.gapIndicator} />

              <View style={styles.gapContent}>
                <Text style={styles.gapLabel}>
                  EVIDENCE GAP
                </Text>

                <Text style={styles.gapTitle}>
                  {capability.evidenceGap.title}
                </Text>
              </View>
            </View>

            {/* ACTION */}
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
                Demonstrate
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Evidence is not a score. It is what the available
          proof can currently support.
        </Text>
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
    paddingTop: 28,
    paddingBottom: 52,
  },

  /* HEADER */

  header: {
    marginBottom: 24,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 8,
  },

  title: {
    ...typography.title,
    color: colors.textPrimary,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    marginBottom: 5,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
  },

  /* OVERVIEW */

  overviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 30,
  },

  overviewLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.1,
    marginBottom: 5,
  },

  overviewTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    marginBottom: 9,
  },

  overviewStatus: {
    alignSelf: 'flex-start',
    marginBottom: 13,
  },

  overviewText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 1,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '600',
  },

  sectionMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
  },

  /* CAPABILITIES */

  capabilityList: {
    gap: 12,
  },

  capabilityCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
  },

  capabilityName: {
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    marginBottom: 8,
  },

  capabilityStatus: {
    alignSelf: 'flex-start',
    marginBottom: 9,
  },

  capabilityClaim: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    marginBottom: 16,
  },

  /* EVIDENCE GAP */

  gapBox: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 11,
    marginBottom: 12,
  },

  gapIndicator: {
    width: 3,
    backgroundColor: colors.developing,
    borderRadius: 2,
    marginRight: 10,
  },

  gapContent: {
    flex: 1,
  },

  gapLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 0.9,
    marginBottom: 3,
  },

  gapTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  /* ACTION */

  demonstrateButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  demonstrateText: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },

  /* FOOTER */

  footer: {
    paddingTop: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  footerText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 520,
  },
});
