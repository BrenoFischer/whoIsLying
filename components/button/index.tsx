import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { colors } from '@/styles/colors';

type Variant = 'primary' | 'secondary' | 'disabled';

interface ButtonProps {
  text: string;
  variants?: Variant;
  onPress: () => void;
}

export default function Button({
  text,
  variants = 'primary',
  onPress,
}: ButtonProps) {
  const disabled: boolean = variants === 'disabled';
  let buttonStyle;
  let buttonTextStyle;

  if (variants === 'primary') {
    buttonStyle = styles.primaryButton;
    buttonTextStyle = styles.primaryButtonText;
  } else if (variants === 'secondary') {
    buttonStyle = styles.secondaryButton;
    buttonTextStyle = styles.secondaryButtonText;
  } else if (variants === 'disabled') {
    buttonStyle = styles.disabledButton;
    buttonTextStyle = styles.disabledButtonText;
  }

  return (
    <TouchableOpacity
      style={[styles.buttonStyle, buttonStyle]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={buttonTextStyle}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonStyle: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(4),
    minWidth: scale(200),
    maxWidth: '90%',
    minHeight: verticalScale(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.orange[200],
  },
  primaryButtonText: {
    textAlign: 'center',
    fontSize: moderateScale(16),
    color: colors.black[200],
    fontFamily: 'Raleway',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: scale(3),
    borderColor: colors.orange[200],
  },
  secondaryButtonText: {
    textAlign: 'center',
    fontSize: moderateScale(16),
    color: colors.orange[200],
    fontFamily: 'Raleway',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: colors.gray[200],
  },
  disabledButtonText: {
    textAlign: 'center',
    fontSize: moderateScale(16),
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.gray[300],
  },
});