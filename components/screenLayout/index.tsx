import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { ReactNode } from 'react';
import { StyleProp, ViewStyle, StyleSheet, SafeAreaView, KeyboardAvoidingView, View, ScrollView, Platform } from 'react-native';
import { scale } from 'react-native-size-matters';

type ScreenLayoutProps = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  withKeyboardAvoiding?: boolean;
};

export default function ScreenLayout({
  children,
  header,
  footer,
  style,
  scrollable = false,
  withKeyboardAvoiding = true,
}: ScreenLayoutProps) {

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
  <SafeAreaView style={[styles.container, style]}>
      <View style={styles.wrapper}>
          {header && <View>{header}</View>}

          <KeyboardAvoidingView
            style={styles.keyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={24}
            enabled={withKeyboardAvoiding}
          >
            <ContentWrapper
              style={styles.content}
              contentContainerStyle={
                scrollable ? styles.scrollContent : undefined
              }
              keyboardShouldPersistTaps="handled"
            >
                {children}
            </ContentWrapper>
          </KeyboardAvoidingView>

          {footer && <View style={styles.footer}>{footer}</View>}
      </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background[100],
  },
  keyboard: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: scale(spacing.xl),
  },
  footer: {
    alignItems: "center",
    paddingVertical: scale(spacing.xxxl)
  }
});
