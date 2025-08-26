import { colors } from '@/styles/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  buttonStyle: {
    padding: "4%",
    borderRadius: 4,
    minWidth: 200,
    maxWidth: '90%',
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.orange[200],
  },
  primaryButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.black[200],
    fontFamily: 'Raleway',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.white[100],
    borderWidth: 3,
    borderColor: colors.orange[200],
  },
  secondaryButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.black[200],
    fontFamily: 'Raleway',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: colors.gray[200],
  },
  disabledButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.gray[300],
  },
});
