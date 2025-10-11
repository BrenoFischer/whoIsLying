import { colors } from '@/styles/colors';
import { StyleSheet, View } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function Elipse({
  top = 0,
  left = -86,
}: {
  top?: number;
  left?: number;
}) {
  return <View style={[styles.elipse, { top, left }]} />;
}

const styles = StyleSheet.create({
  elipse: {
    backgroundColor: colors.orange[200],
    width: scale(394),
    height: verticalScale(427),
    position: 'absolute',
    // transform: [{rotate: "60deg"}],
    borderRadius: '50%',
  },
});
