import { ColorValue, View } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';

interface DotProps {
  color: ColorValue;
}

export default function Dot({ color }: DotProps) {
  return (
    <View
      style={{
        backgroundColor: color,
        width: scale(4),
        height: verticalScale(4),
        borderRadius: '50%',
        marginHorizontal: scale(2),
      }}
    />
  );
}
