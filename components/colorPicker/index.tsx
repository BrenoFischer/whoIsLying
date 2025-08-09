import { View } from 'react-native';

interface ColorPickerProps {
  color: string;
}

export default function ColorPicker({ color }: ColorPickerProps) {
  return (
    <View
      style={{
        backgroundColor: color,
        width: 40,
        height: 40,
        borderRadius: 40 / 2,
      }}
    ></View>
  );
}
