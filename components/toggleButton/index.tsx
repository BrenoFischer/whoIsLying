import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useRef } from 'react';
import { colors } from '@/styles/colors';

type Props = {
  value: boolean;
  onValueChange: (val: boolean) => void;
  variant?: 'primary' | 'secondary';
};

export function ToggleButton({ value, onValueChange, variant = 'primary' }: Props) {
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
    outputRange: [2, 25],
  });

  const trackColor = value
    ? colors.orange[200]
    : variant === 'secondary'
      ? colors.gray[200]
      : colors.white[100];

  const thumbColor =
    variant === 'secondary' ? colors.white[100] : colors.background[100];

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.8}
      style={[styles.track, { backgroundColor: trackColor }]}
    >
      <Animated.View
        style={[styles.thumb, { backgroundColor: thumbColor, transform: [{ translateX }] }]}
      />
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
  },
});
