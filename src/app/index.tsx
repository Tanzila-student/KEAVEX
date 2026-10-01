import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { supabase } from '../../lib/supabase';

export default function WelcomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();

    setIsSigningOut(false);
    setMenuVisible(false);

    if (error) {
      return;
    }

    router.replace('/login');
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Top bar */}

        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <View style={styles.brandMarkInner} />
            </View>

            <Text style={styles.brand}>
              KEAVEX
            </Text>
          </View>

          <Pressable
            onPress={() => setMenuVisible(true)}
            hitSlop={10}
            style={({ pressed }) => [
              styles.menuButton,
              pressed && styles.menuButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open account menu"
          >
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </Pressable>
        </View>

        {/* Introduction */}

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>
            EVIDENCE INTELLIGENCE
          </Text>

          <Text style={styles.title}>
            Know what your evidence actually
            supports.
          </Text>

          <Text style={styles.subtitle}>
            KEAVEX evaluates what your evidence
            supports, identifies what is still
            uncertain, and shows what to prove next.
          </Text>
        </View>

        {/* Primary action */}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/upload')}
        >
          <Text style={styles.buttonText}>
            Get started
          </Text>
        </Pressable>
      </View>

      {/* Account menu */}

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable
            style={styles.accountMenu}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text style={styles.menuLabel}>
              ACCOUNT
            </Text>

            <View style={styles.menuDivider} />

            <Pressable
              onPress={handleSignOut}
              disabled={isSigningOut}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <Text
                style={[
                  styles.menuItemText,
                  isSigningOut &&
                    styles.menuItemDisabled,
                ]}
              >
                {isSigningOut
                  ? 'Signing out…'
                  : 'Sign out'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 28,
  },

  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 58,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  brandMarkInner: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.95,
  },

  brand: {
    color: '#0F172A',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 2.2,
  },

  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 3,
  },

  menuButtonPressed: {
    backgroundColor: '#E2E8F0',
  },

  dot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 4,
    backgroundColor: '#475569',
  },

  intro: {
    marginBottom: 34,
  },

  eyebrow: {
    color: '#4F46E5',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.25,
    marginBottom: 11,
  },

  title: {
    ...typography.title,
    color: '#0F172A',
    fontSize: 38,
    lineHeight: 47,
    fontWeight: '700',
    letterSpacing: -0.8,
    maxWidth: 680,
    marginBottom: 15,
  },

  subtitle: {
    ...typography.body,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 25,
    maxWidth: 600,
  },

  button: {
    minHeight: 54,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    minWidth: 142,
  },

  buttonPressed: {
    opacity: 0.88,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
  },

  accountMenu: {
    position: 'absolute',
    top: 72,
    right: 20,
    width: 170,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 8,
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },

  menuLabel: {
    color: '#94A3B8',
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 14,
    paddingTop: 7,
    paddingBottom: 7,
  },

  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  menuItem: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
    marginHorizontal: 5,
    marginTop: 3,
  },

  menuItemPressed: {
    backgroundColor: '#F8FAFC',
  },

  menuItemText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  menuItemDisabled: {
    color: '#94A3B8',
  },
});