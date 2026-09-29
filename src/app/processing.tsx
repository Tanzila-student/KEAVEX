import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

const stages = [
  'Reading resume',
  'Extracting evidence',
  'Evaluating claims',
  'Mapping gaps',
];

export default function ProcessingScreen() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((current) => {
        if (current < stages.length - 1) {
          return current + 1;
        }

        clearInterval(interval);

        setTimeout(() => {
          router.replace('/evidence-map');
        }, 500);

        return current;
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>KEAVEX</Text>

        <Text style={styles.title}>
          Analyzing your evidence
        </Text>

        <Text style={styles.subtitle}>
          We are evaluating what your available evidence can actually support.
        </Text>

        <View style={styles.stages}>
          {stages.map((stage, index) => {
            const isActive = index === activeStage;
            const isComplete = index < activeStage;

            return (
              <View style={styles.stageRow} key={stage}>
                <View
                  style={[
                    styles.indicator,
                    isActive && styles.indicatorActive,
                    isComplete && styles.indicatorComplete,
                  ]}
                >
                  <Text
                    style={[
                      styles.indicatorText,
                      (isActive || isComplete) &&
                        styles.indicatorTextActive,
                    ]}
                  >
                    {isComplete ? '✓' : index + 1}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.stageText,
                    isActive && styles.stageTextActive,
                    isComplete && styles.stageTextComplete,
                  ]}
                >
                  {stage}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.note}>
          This may take a few seconds.
        </Text>
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
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 28,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 18,
  },

  title: {
    ...typography.title,
    color: colors.textPrimary,
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 10,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    maxWidth: 540,
    marginBottom: 32,
  },

  stages: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 20,
  },

  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  indicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.insufficientBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  indicatorActive: {
    backgroundColor: colors.primaryLight,
  },

  indicatorComplete: {
    backgroundColor: colors.strongBg,
  },

  indicatorText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },

  indicatorTextActive: {
    color: colors.primary,
  },

  stageText: {
    color: colors.textSecondary,
    fontSize: 15,
  },

  stageTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },

  stageTextComplete: {
    color: colors.textPrimary,
  },

  note: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 16,
  },
});