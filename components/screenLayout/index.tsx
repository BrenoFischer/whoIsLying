import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { ReactNode } from 'react';
import { StyleSheet, SafeAreaView, KeyboardAvoidingView, View, ScrollView, Platform } from 'react-native';
import { scale } from 'react-native-size-matters';

type ScreenLayoutProps = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scrollable?: boolean;
  withKeyboardAvoiding?: boolean;
};

export default function ScreenLayout({
  children,
  header,
  footer,
  scrollable = false,
  withKeyboardAvoiding = true,
}: ScreenLayoutProps) {

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
  <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={withKeyboardAvoiding}
      >
          <View style={styles.wrapper}>
              {header && <View>{header}</View>}
              
              <ContentWrapper 
                style={styles.content}
                contentContainerStyle={
                  scrollable ? styles.scrollContent : undefined
                }
                keyboardShouldPersistTaps="handled"
              >
                  {children}
              </ContentWrapper>

              {footer && <View style={styles.footer}>{footer}</View>}
          </View>
      </KeyboardAvoidingView>
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
    paddingVertical: scale(spacing.xxxl)
  }
});
