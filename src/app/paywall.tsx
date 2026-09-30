import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { router } from 'expo-router';
import type { PurchasesPackage } from 'react-native-purchases';

import { colors } from '../../constants/colors';
import {
  getMonthlyPackage,
  buyPro,
  restorePro,
} from '../lib/purchases';

export default function PaywallScreen() {
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMonthlyPackage()
      .then(setPkg)
      .catch((e) =>
        setError(e?.message ?? 'Could not load plans.'),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleBuy() {
    setBusy(true);
    setError('');

    try {
      const ok = await buyPro();

      if (ok) {
        router.back();
      } else {
        setError('Purchase completed but Pro was not unlocked.');
      }
    } catch (e: any) {
      if (!e?.userCancelled) {
        setError(e?.message ?? 'Purchase failed.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    setBusy(true);
    setError('');

    try {
      const ok = await restorePro();

      if (ok) {
        router.back();
      } else {
        setError('No active Pro purchase found.');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Restore failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable
        onPress={() => router.back()}
        disabled={busy}
      >
        <Text style={styles.back}>Back</Text>
      </Pressable>

      <Text style={styles.eyebrow}>KEAVEX PRO</Text>

      <Text style={styles.title}>
        Keep proving what you can do
      </Text>

      <Text style={styles.body}>
        You have used your free reassessment. Upgrade to reassess
        your evidence as many times as you need.
      </Text>

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: 24 }}
        />
      ) : pkg ? (
        <Pressable
          style={[
            styles.button,
            busy && { opacity: 0.6 },
          ]}
          onPress={handleBuy}
          disabled={busy}
        >
          <Text style={styles.buttonText}>
            {busy
              ? 'Please wait...'
              : `Unlock Pro - ${pkg.product.priceString}/month`}
          </Text>
        </Pressable>
      ) : (
        <Text style={styles.error}>
          Pro plan is not available right now.
        </Text>
      )}

      <Pressable
        onPress={handleRestore}
        disabled={busy}
      >
        <Text style={styles.restore}>
          Restore purchases
        </Text>
      </Pressable>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    gap: 16,
  },
  back: {
    color: '#64748B',
    fontSize: 16,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 14,
    letterSpacing: 1.5,
  },
  title: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '600',
  },
  body: {
    color: '#64748B',
    fontSize: 17,
    lineHeight: 26,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  restore: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  error: {
    color: '#B91C1C',
    fontSize: 15,
    marginTop: 8,
  },
});
