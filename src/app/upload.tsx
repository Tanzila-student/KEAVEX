
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { typography } from '../../constants/typography';

export default function UploadScreen() {
  const [fileName, setFileName] = useState<string | null>(
    null,
  );

  const hasFile = Boolean(fileName);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Back */}

        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Text style={styles.backIcon}>‹</Text>

          <Text style={styles.backText}>
            Welcome
          </Text>
        </Pressable>

        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            START WITH YOUR EVIDENCE
          </Text>

          <Text style={styles.title}>
            Give KEAVEX something to work with.
          </Text>

          <Text style={styles.subtitle}>
            Add your resume to build your initial
            evidence map.
          </Text>
        </View>

        {/* Upload area */}

        <View
          style={[
            styles.uploadCard,
            hasFile && styles.uploadCardReady,
          ]}
        >
          <View style={styles.uploadTopRow}>
            <View
              style={[
                styles.fileIcon,
                hasFile && styles.fileIconReady,
              ]}
            >
              <View style={styles.fileFold} />

              <View style={styles.fileLineOne} />
              <View style={styles.fileLineTwo} />
            </View>

            <View style={styles.fileInfo}>
              <Text style={styles.cardLabel}>
                RESUME
              </Text>

              <Text
                style={styles.fileName}
                numberOfLines={1}
              >
                {fileName ?? 'No resume added yet'}
              </Text>

              <Text style={styles.fileHint}>
                PDF · max 5 MB · text-based
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <Text style={styles.cardDescription}>
            {hasFile
              ? 'Your resume is ready to use as initial evidence.'
              : 'Your resume gives KEAVEX a starting point for understanding your capabilities.'}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.uploadButton,
              hasFile && styles.uploadButtonReady,
              pressed && styles.uploadButtonPressed,
            ]}
            onPress={() =>
              setFileName('demo-resume.pdf')
            }
          >
            <Text
              style={[
                styles.uploadButtonText,
                hasFile &&
                  styles.uploadButtonTextReady,
              ]}
            >
              {hasFile
                ? 'Change PDF'
                : 'Choose PDF'}
            </Text>
          </Pressable>
        </View>

        {/* Continue */}

        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            !hasFile && styles.continueButtonDisabled,
            pressed &&
              hasFile &&
              styles.continueButtonPressed,
          ]}
          disabled={!hasFile}
          onPress={() => router.push('/processing')}
        >
          <Text
            style={[
              styles.continueButtonText,
              !hasFile &&
                styles.continueButtonTextDisabled,
            ]}
          >
            Build my Evidence Map
          </Text>

          <Text
            style={[
              styles.continueArrow,
              !hasFile &&
                styles.continueArrowDisabled,
            ]}
          >
            →
          </Text>
        </Pressable>

        <Text style={styles.footerNote}>
          Your resume is used as evidence, not as a
          final judgment.
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
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  backButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 46,
  },

  backButtonPressed: {
    opacity: 0.6,
  },

  backIcon: {
    color: '#64748B',
    fontSize: 25,
    lineHeight: 25,
    fontWeight: '300',
    marginRight: 6,
    marginTop: -2,
  },

  backText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  header: {
    marginBottom: 30,
  },

  eyebrow: {
    color: '#4F46E5',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.25,
    marginBottom: 10,
  },

  title: {
    ...typography.title,
    color: '#0F172A',
    fontSize: 30,
    lineHeight: 39,
    fontWeight: '700',
    letterSpacing: -0.6,
    maxWidth: 600,
    marginBottom: 12,
  },

  subtitle: {
    ...typography.body,
    color: '#64748B',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 560,
  },

  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE3EC',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  uploadCardReady: {
    borderColor: '#C7D2FE',
    backgroundColor: '#FCFCFF',
  },

  uploadTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  fileIcon: {
    width: 48,
    height: 56,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
    overflow: 'hidden',
  },

  fileIconReady: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },

  fileFold: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 15,
    height: 15,
    backgroundColor: '#E2E8F0',
    borderBottomLeftRadius: 6,
  },

  fileLineOne: {
    width: 19,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    marginTop: 7,
    marginBottom: 6,
  },

  fileLineTwo: {
    width: 14,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },

  fileInfo: {
    flex: 1,
    minWidth: 0,
  },

  cardLabel: {
    color: '#94A3B8',
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 3,
  },

  fileName: {
    color: '#0F172A',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 3,
  },

  fileHint: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 17,
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#EEF2F6',
    marginVertical: 17,
  },

  cardDescription: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 15,
    maxWidth: 520,
  },

  uploadButton: {
    alignSelf: 'flex-start',
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  uploadButtonReady: {
    borderColor: '#C7D2FE',
    backgroundColor: '#F8FAFF',
  },

  uploadButtonPressed: {
    backgroundColor: '#F1F5F9',
  },

  uploadButtonText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  uploadButtonTextReady: {
    color: '#4338CA',
  },

  continueButton: {
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  continueButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },

  continueButtonPressed: {
    opacity: 0.88,
  },

  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },

  continueButtonTextDisabled: {
    color: '#64748B',
  },

  continueArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 20,
    marginLeft: 9,
    marginTop: -1,
  },

  continueArrowDisabled: {
    color: '#64748B',
  },

  footerNote: {
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 13,
    paddingHorizontal: 20,
  },
});

