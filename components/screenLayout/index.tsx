import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { ReactNode } from 'react';
import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  KeyboardAvoidingView,
  View,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  // On Android, StatusBar.currentHeight is a synchronous native constant — no async
  // measurement needed, so the layout never jumps. On iOS, rely on safe area insets
  // which are synchronous when SafeAreaProvider is initialised with initialWindowMetrics.
  const topPadding =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? insets.top)
      : insets.top;

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <View style={[styles.container, { paddingTop: topPadding }, style]}>
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

        {footer && (
          <View
            style={[
              styles.footer,
              { paddingBottom: scale(spacing.md) + insets.bottom },
            ]}
          >
            {footer}
          </View>
        )}
      </View>
    </View>
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
    alignItems: 'center',
    paddingTop: scale(spacing.md),
  },
});
