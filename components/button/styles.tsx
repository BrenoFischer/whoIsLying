import { colors } from '@/styles/colors';
import { StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
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
    backgroundColor: colors.white[100],
    borderWidth: scale(3),
    borderColor: colors.orange[200],
  },
  secondaryButtonText: {
    textAlign: 'center',
    fontSize: moderateScale(16),
    color: colors.black[200],
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
