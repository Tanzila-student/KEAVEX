import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

const stages = [
  'Finding claims',
  'Checking evidence',
  'Testing support',
  'Finding gaps',
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
          What does your evidence support?
        </Text>

        <Text style={styles.subtitle}>
          Building your evidence boundary.
        </Text>

        <View style={styles.process}>
          {stages.map((stage, index) => {
            const isActive = index === activeStage;
            const isComplete = index < activeStage;
            const isLast = index === stages.length - 1;

            return (
              <View key={stage} style={styles.stageWrapper}>
                <View style={styles.stageRow}>
                  <View
                    style={[
                      styles.indicator,
                      isActive && styles.indicatorActive,
                      isComplete && styles.indicatorComplete,
                    ]}
                  >
                    {isComplete ? (
                      <Text style={styles.check}>✓</Text>
                    ) : (
                      <View
                        style={[
                          styles.dot,
                          isActive && styles.dotActive,
                        ]}
                      />
                    )}
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

                {!isLast && (
                  <View
                    style={[
                      styles.connector,
                      isComplete && styles.connectorComplete,
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.footer}>
          Evidence Map next.
        </Text>
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
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 28,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 16,
  },

  title: {
    ...typography.title,
    color: '#0F172A',
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginBottom: 7,
    maxWidth: 560,
  },

  subtitle: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 34,
  },

  process: {
    paddingLeft: 2,
  },

  stageWrapper: {
    position: 'relative',
  },

  stageRow: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
  },

  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    zIndex: 2,
  },

  indicatorActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },

  indicatorComplete: {
    backgroundColor: '#ECFDF5',
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#94A3B8',
  },

  dotActive: {
    width: 6,
    height: 6,
    backgroundColor: '#4F46E5',
  },

  check: {
    color: '#059669',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },

  stageText: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  stageTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },

  stageTextComplete: {
    color: '#475569',
    fontWeight: '600',
  },

  connector: {
    position: 'absolute',
    left: 11.5,
    top: 27,
    width: 1,
    height: 16,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },

  connectorComplete: {
    backgroundColor: '#A7F3D0',
  },

  footer: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 29,
  },
});