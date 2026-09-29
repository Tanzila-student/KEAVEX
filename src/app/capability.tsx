import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { StatusBadge } from '../../components/StatusBadge';
import { mockAnalysis } from '../constants/mockAnalysis';

export default function CapabilityScreen() {
  const { name } = useLocalSearchParams<{ name?: string }>();

  const capability =
    mockAnalysis.capabilities.find((item) => item.name === name) ??
    mockAnalysis.capabilities[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Evidence Map</Text>
      </Pressable>

      <Text style={styles.title}>{capability.name}</Text>

      <StatusBadge status={capability.status} />

      <Text style={styles.claim}>{capability.claim}</Text>

      <SectionTitle title="What supports this?" />

      <View style={styles.supportCard}>
        {capability.supportedBy.map((evidence, index) => (
          <View
            key={`${evidence.source}-${index}`}
            style={[
              styles.evidenceItem,
              index < capability.supportedBy.length - 1 &&
                styles.itemSpacing,
            ]}
          >
            <View style={styles.evidenceHeader}>
              <Text style={styles.source}>
                {evidence.source}
              </Text>

              <Text style={styles.strength}>
                {evidence.strength} evidence
              </Text>
            </View>

            <Text style={styles.detail}>
              {evidence.detail}
            </Text>
          </View>
        ))}
      </View>

      <SectionTitle title="What remains uncertain?" />

      <View style={styles.unknownCard}>
        {capability.unknowns.map((unknown) => (
          <View style={styles.bulletRow} key={unknown}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{unknown}</Text>
          </View>
        ))}
      </View>

      <SectionTitle title="What would strengthen this?" />

      <View style={styles.gapCard}>
        <Text style={styles.gapTitle}>
          {capability.evidenceGap.title}
        </Text>

        <Text style={styles.gapDescription}>
          {capability.evidenceGap.description}
        </Text>

        <Text style={styles.whyLabel}>
          Why it matters
        </Text>

        <Text style={styles.whyText}>
          {capability.evidenceGap.why_it_matters}
        </Text>

        <View style={styles.taskDivider} />

        <Text style={styles.taskLabel}>
          Suggested evidence
        </Text>

        <Text style={styles.taskTitle}>
          {capability.nextEvidence.task_title}
        </Text>

        <Text style={styles.taskPrompt}>
          {capability.nextEvidence.task_prompt}
        </Text>
      </View>

      <Pressable
        style={styles.demonstrateButton}
        onPress={() =>
          router.push({
            pathname: '/demonstrate',
            params: { name: capability.name },
          })
        }
      >
        <Text style={styles.demonstrateText}>
          Demonstrate
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
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
    paddingBottom: 56,
  },

  back: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 28,
  },

  title: {
    ...typography.title,
    color: colors.textPrimary,
    fontSize: 30,
    lineHeight: 38,
    marginBottom: 12,
  },

  claim: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    marginBottom: 32,
    maxWidth: 720,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 10,
  },

  supportCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
  },

  evidenceItem: {
    paddingBottom: 2,
  },

  itemSpacing: {
    marginBottom: 18,
  },

  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },

  source: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  strength: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  detail: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  unknownCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  bullet: {
    color: colors.textSecondary,
    fontSize: 18,
    lineHeight: 21,
    marginRight: 10,
  },

  bulletText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  gapCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
  },

  gapTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },

  gapDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },

  whyLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },

  whyText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  taskDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },

  taskLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },

  taskTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },

  taskPrompt: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  demonstrateButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },

  demonstrateText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '600',
  },
});