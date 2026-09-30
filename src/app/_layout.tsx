import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';
import { initPurchases } from '../lib/purchases';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initPurchases().catch((e) =>
      console.warn('RevenueCat init failed', e),
    );
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen name="index" />
        <Stack.Screen name="evidence-map" />
        <Stack.Screen name="capability" />
        <Stack.Screen name="demonstrate" />
        <Stack.Screen name="processing" />
        <Stack.Screen name="reassessment" />
        <Stack.Screen name="upload" />
        <Stack.Screen name="paywall" />
      </Stack.Protected>
    </Stack>
  );
}
