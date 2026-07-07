import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../../components/ui/Button';
import { supabase } from '../../config/supabase';
import { Guide } from '../../types/booking';
import { colors, radii, spacing, typography } from '../../theme';

interface RequestTimeModalProps {
  guide: Guide | null;
  visible: boolean;
  onClose: () => void;
}

const MAX_PREFERRED_WINDOWS_LENGTH = 1000;
const MAX_NOTE_LENGTH = 1000;

export function RequestTimeModal({ guide, visible, onClose }: RequestTimeModalProps) {
  const [preferredWindows, setPreferredWindows] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setPreferredWindows('');
      setNote('');
      setSubmitting(false);
      setSubmitted(false);
      setError(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    const nextPreferredWindows = preferredWindows.trim();
    const nextNote = note.trim();

    if (!nextPreferredWindows) {
      setError('Share a few days or time windows that usually work for you.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: invokeError } = await supabase.functions.invoke('request-slot-contact', {
        body: {
          preferredWindows: nextPreferredWindows.slice(0, MAX_PREFERRED_WINDOWS_LENGTH),
          note: nextNote.slice(0, MAX_NOTE_LENGTH),
          guideId: guide?.id,
        },
      });

      if (invokeError) {
        throw invokeError;
      }

      setSubmitted(true);
    } catch (submitError) {
      console.warn('[Booking] Request time failed:', submitError);
      setError('We could not send your request right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable accessibilityLabel="Close request time modal" onPress={onClose} style={styles.backdrop} />
        <View style={styles.card}>
          {submitted ? (
            <View style={styles.stack}>
              <View style={styles.copy}>
                <Text style={styles.eyebrow}>Request sent</Text>
                <Text style={styles.title}>We received your preferred times.</Text>
                <Text style={styles.body}>
                  The team will review your request and follow up with the next available Alignment Conversation option.
                </Text>
              </View>
              <Button onPress={onClose} title="Done" />
            </View>
          ) : (
            <View style={styles.stack}>
              <View style={styles.copy}>
                <Text style={styles.eyebrow}>Request a time</Text>
                <Text style={styles.title}>
                  {guide ? `Ask for a time with ${guide.name}` : 'Ask the team to find a time'}
                </Text>
                <Text style={styles.body}>
                  Share a few windows that work for you and staff will help coordinate a conversation.
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>PREFERRED DAYS/TIMES</Text>
                <TextInput
                  accessibilityLabel="Preferred days and times"
                  multiline
                  maxLength={MAX_PREFERRED_WINDOWS_LENGTH}
                  onChangeText={setPreferredWindows}
                  placeholder="Example: Weekday evenings after 6 PM, or Saturday morning"
                  placeholderTextColor={colors.outline}
                  style={styles.input}
                  textAlignVertical="top"
                  value={preferredWindows}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>ANYTHING STAFF SHOULD KNOW?</Text>
                <TextInput
                  accessibilityLabel="Anything staff should know"
                  multiline
                  maxLength={MAX_NOTE_LENGTH}
                  onChangeText={setNote}
                  placeholder="Optional"
                  placeholderTextColor={colors.outline}
                  style={[styles.input, styles.noteInput]}
                  textAlignVertical="top"
                  value={note}
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.actions}>
                <Button
                  disabled={submitting}
                  onPress={onClose}
                  title="Cancel"
                  variant="secondary"
                />
                <Button
                  loading={submitting}
                  onPress={handleSubmit}
                  title="Send request"
                />
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(8, 39, 23, 0.42)',
  },
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    width: '100%',
  },
  stack: {
    gap: spacing.lg,
  },
  copy: {
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.goldDark,
  },
  title: {
    ...typography.headlineMd,
    color: colors.primaryDark,
  },
  body: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.labelMd,
    color: colors.primaryDark,
  },
  input: {
    ...typography.bodyMd,
    minHeight: 116,
    borderColor: colors.sand,
    borderRadius: radii.input,
    borderWidth: 1,
    color: colors.onSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  noteInput: {
    minHeight: 92,
  },
  error: {
    ...typography.bodySm,
    color: colors.error,
  },
  actions: {
    gap: spacing.md,
  },
});
