import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { StatusBadge } from '../../components/StatusBadge';
import { mockAnalysis } from '../constants/mockAnalysis';
import { supabase } from '../../lib/supabase';

export default function EvidenceMapScreen() {
  const [userId, setUserId] = useState('');
  const [profileName, setProfileName] = useState('');
  const [otherProfileName, setOtherProfileName] = useState('');
  const [testError, setTestError] = useState('');

  useEffect(() => {
    async function runSecurityTest() {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        setTestError('No authenticated user found.');
        return;
      }

      const currentUserId = userData.user.id;
      setUserId(currentUserId);

      const { data: ownProfile, error: ownError } = await supabase
        .from('profiles')
        .select('id, full_name, target_role')
        .eq('id', currentUserId)
        .maybeSingle();

      if (ownError) {
        setTestError(`Own profile error: ${ownError.message}`);
        return;
      }

      setProfileName(
        ownProfile
          ? `${ownProfile.full_name} — ${ownProfile.target_role}`
          : 'No own profile returned'
      );

      const otherUserId =
        currentUserId === 'afd7b322-121b-4550-bdd4-fce217fd4f51'
          ? '0ee15c4d-739f-4148-b26a-64e72225ffcb'
          : 'afd7b322-121b-4550-bdd4-fce217fd4f51';

      const { data: otherProfile, error: otherError } = await supabase
        .from('profiles')
        .select('id, full_name, target_role')
        .eq('id', otherUserId)
        .maybeSingle();

      if (otherError) {
        setOtherProfileName(`Blocked with error: ${otherError.message}`);
      } else if (!otherProfile) {
        setOtherProfileName('BLOCKED — 0 rows returned by RLS');
      } else {
        setOtherProfileName(
          `FAILED — other user visible: ${otherProfile.full_name}`
        );
      }
    }

    runSecurityTest();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.eyebrow}>KEAVEX</Text>

      <Text style={styles.debugUser}>
        Authenticated user: {userId || 'Checking...'}
      </Text>

      <View style={styles.securityBox}>
        <Text style={styles.securityTitle}>RLS SECURITY TEST</Text>

        <Text style={styles.testLabel}>OWN PROFILE</Text>
        <Text style={styles.testResult}>
          {profileName || 'Testing...'}
        </Text>

        <Text style={styles.testLabel}>OTHER USER PROFILE</Text>
        <Text style={styles.testResult}>
          {otherProfileName || 'Testing...'}
        </Text>

        {testError ? (
          <Text style={styles.testError}>{testError}</Text>
        ) : null}
      </View>

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
        {mockAnalysis.capabilities.map((capability) => (
          <View style={styles.card} key={capability.name}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {capability.name}
              </Text>

              <StatusBadge status={capability.status} />
            </View>

            <View style={styles.block}>
              <Text style={styles.blockLabel}>CLAIM</Text>

              <Text style={styles.claim}>
                {capability.claim}
              </Text>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockLabel}>
                EVIDENCE SO FAR
              </Text>

              {capability.supportedBy.map((evidence, index) => (
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
              ))}
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
                  params: { name: capability.name },
                })
              }
            >
              <Text style={styles.proveButtonText}>
                Prove this →
              </Text>
            </Pressable>
          </View>
        ))}
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

  debugUser: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 20,
  },

  securityBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },

  securityTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 18,
  },

  testLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 5,
  },

  testResult: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },

  testError: {
    color: colors.error,
    fontSize: 13,
    marginTop: 14,
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
    gap: 14,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
  },

  cardHeader: {
    marginBottom: 20,
  },

  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
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
    marginBottom: 5,
  },

  evidenceStrength: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginRight: 8,
  },

  evidenceSource: {
    color: colors.textSecondary,
    fontSize: 13,
    textTransform: 'capitalize',
  },

  breakBlock: {
    backgroundColor: colors.developingBg,
    borderRadius: 12,
    padding: 15,
    marginTop: 2,
    marginBottom: 18,
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
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },

  proveButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});