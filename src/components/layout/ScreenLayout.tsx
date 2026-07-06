import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  RefreshControlProps,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../../theme';

interface ScreenLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  backgroundColor?: string;
  keyboardAvoiding?: boolean;
  scrollContentStyle?: StyleProp<ViewStyle>;
  scrollRef?: React.RefObject<ScrollView | null>;
  footerGradient?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function ScreenLayout({
  header,
  children,
  footer,
  backgroundColor = colors.background,
  keyboardAvoiding = true,
  scrollContentStyle,
  scrollRef,
  footerGradient = true,
  refreshControl,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const shouldShowFooterGradient = footerGradient && Boolean(footer);

  const content = (
    <View style={[styles.container, { backgroundColor }]}>
      {header ? <View style={styles.header}>{header}</View> : null}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          !footer && { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          scrollContentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {children}
      </ScrollView>

      {footer ? (
        <View style={styles.footerOuter}>
          {shouldShowFooterGradient ? (
            <LinearGradient
              colors={[
                'rgba(247,245,242,0)',
                'rgba(247,245,242,0.92)',
                backgroundColor,
              ]}
              pointerEvents="none"
              style={styles.gradient}
            />
          ) : null}
          <View
            style={[
              styles.footerInner,
              { paddingBottom: Math.max(insets.bottom, 16) + 16 },
            ]}
          >
            {footer}
          </View>
        </View>
      ) : null}
    </View>
  );

  if (!keyboardAvoiding) {
    return content;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  footerOuter: {
    paddingTop: spacing.lg,
  },
  gradient: {
    position: 'absolute',
    top: -48,
    left: 0,
    right: 0,
    height: 96,
  },
  footerInner: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
