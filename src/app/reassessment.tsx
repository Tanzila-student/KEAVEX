import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { typography } from '../../constants/typography';

type ReassessmentResult = {
  capability?: string;
  previous_status?: string;
  status?: string;
  change_reason?: string;
  new_evidence?: {
    strength?: string;
    detail?: string;
  };
  convergence?: {
    status?: string;
    explanation?: string;
  };
};

function parseResult(value?: string): ReassessmentResult {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export default function ReassessmentScreen() {
  const { reassessment } = useLocalSearchParams<{
    reassessment?: string;
  }>();

  const result = parseResult(reassessment);

  const previousStatus =
    result.previous_status || 'Unknown';

  const currentStatus =
    result.status || 'Unknown';

  const changeReason =
    result.change_reason ||
    'The new evidence was considered, but the available evidence is not yet sufficient for a stronger conclusion.';

  const evidenceDetail =
    result.new_evidence?.detail ||
    'Additional evidence is needed to strengthen the capability claim.';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            EVIDENCE RE-CHECKED
          </Text>

          <Text style={styles.title}>
            Your evidence has been reassessed.
          </Text>

          {result.capability ? (
            <Text style={styles.capability}>
              {result.capability}
            </Text>
          ) : null}
        </View>

        {/* Result */}
        <View style={styles.resultCard}>
          <View style={styles.resultColumn}>
            <Text style={styles.resultLabel}>
              BEFORE
            </Text>

            <Text style={styles.resultValue}>
              {previousStatus}
            </Text>
          </View>

          <View style={styles.resultDivider} />

          <View style={styles.resultColumn}>
            <Text style={styles.resultLabel}>
              NOW
            </Text>

            <Text style={styles.resultValue}>
              {currentStatus}
            </Text>
          </View>
        </View>

        {/* Decision rationale */}
        <View style={styles.rationaleCard}>
          <Text style={styles.rationaleLabel}>
            DECISION RATIONALE
          </Text>

          <Text style={styles.rationaleText}>
            {changeReason}
          </Text>

          <View style={styles.missingSection}>
            <Text style={styles.missingLabel}>
              NEXT EVIDENCE
            </Text>

            <Text style={styles.missingText}>
              {evidenceDetail}
            </Text>
          </View>
        </View>

        {/* Back */}
        <Pressable
          onPress={() => router.replace('/evidence-map')}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            Back to Evidence Map
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
  },

  content: {
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    paddingHorizontal: 30,
    paddingVertical: 28,
  },

  header: {
    marginBottom: 22,
  },

  eyebrow: {
    color: '#4F46E5',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.45,
    marginBottom: 9,
  },

  title: {
    ...typography.title,
    color: '#0F172A',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
    maxWidth: 620,
  },

  capability: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    marginTop: 8,
  },

  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 21,
    marginBottom: 14,
  },

  resultColumn: {
    flex: 1,
  },

  resultLabel: {
    color: '#94A3B8',
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  resultValue: {
    color: '#1E293B',
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  resultDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 24,
  },

  rationaleCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 20,
    marginBottom: 14,
  },

  rationaleLabel: {
    color: '#64748B',
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1.05,
    marginBottom: 11,
  },

  rationaleText: {
    color: '#1E293B',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 17,
  },

  missingSection: {
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    paddingTop: 14,
  },

  missingLabel: {
    color: '#4F46E5',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.85,
    marginBottom: 5,
  },

  missingText: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    maxWidth: 620,
  },

  button: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 3,
  },

  buttonPressed: {
    backgroundColor: '#4338CA',
    transform: [{ scale: 0.99 }],
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
});