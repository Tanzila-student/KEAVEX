import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

export default function UploadScreen() {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Welcome</Text>
        </Pressable>

        <Text style={styles.title}>Add evidence</Text>

        <Text style={styles.subtitle}>
          Resume PDF · max 5 MB · text-based PDF
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {fileName ?? 'Upload your resume'}
          </Text>

          <Text style={styles.cardDescription}>
            {fileName
              ? 'Your file is ready to continue.'
              : 'Add a PDF to give KEAVEX evidence to evaluate.'}
          </Text>

          <Pressable
            style={styles.uploadButton}
            onPress={() => setFileName('demo-resume.pdf')}
          >
            <Text style={styles.uploadButtonText}>
              {fileName ? 'Change PDF' : 'Upload PDF'}
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.continueButton}
          onPress={() => router.push('/processing')}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>

        <Text style={styles.demoNote}>
          Demo mode · You can continue without a file
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
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },

  back: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 32,
  },

  title: {
    ...typography.title,
    color: colors.textPrimary,
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 8,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 24,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 24,
    marginBottom: 16,
  },

  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },

  cardDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },

  uploadButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },

  uploadButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },

  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },

  continueButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '600',
  },

  demoNote: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});