import { View } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface ColorPickerProps {
  color: string;
}

export default function ColorPicker({ color }: ColorPickerProps) {
  const size = scale(40);
  return (
    <View
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    ></View>
  );
}
