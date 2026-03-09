import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useRef } from 'react';
import { colors } from '@/styles/colors';

type Props = {
  value: boolean;
  onValueChange: (val: boolean) => void;
};

export function ToggleButton({ value, onValueChange }: Props) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const toggle = () => {
    const next = !value;
    Animated.timing(anim, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    onValueChange(next);
  };

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.8}
      style={[
        styles.track,
        { backgroundColor: value ? colors.orange[200] : colors.white[100] },
      ]}
    >
      <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background[100],
  },
});
