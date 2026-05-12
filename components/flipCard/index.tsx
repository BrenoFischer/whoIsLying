import React, { forwardRef, useImperativeHandle } from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/styles/colors';
import { moderateScale, scale } from 'react-native-size-matters';
import * as Haptics from 'expo-haptics';

export interface FlipCardRef {
  flipToFront: () => void;
}

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const FLIP_DURATION = 400;

const FlipCard = forwardRef<FlipCardRef, FlipCardProps>(
  ({ front, back, style }, ref) => {
    const rotation = useSharedValue(0);

    useImperativeHandle(ref, () => ({
      flipToFront: () => {
        rotation.value = withTiming(0, { duration: FLIP_DURATION });
      },
    }));

    const handleFlip = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      rotation.value =
        rotation.value < 0.5
          ? withTiming(1, { duration: FLIP_DURATION })
          : withTiming(0, { duration: FLIP_DURATION });
    };

    const frontStyle = useAnimatedStyle(() => ({
      opacity: interpolate(rotation.value, [0, 0.5, 0.5, 1], [1, 1, 0, 0], Extrapolation.CLAMP),
      transform: [
        { scaleX: interpolate(rotation.value, [0, 0.5], [1, 0], Extrapolation.CLAMP) },
      ],
    }));

    const backStyle = useAnimatedStyle(() => ({
      opacity: interpolate(rotation.value, [0, 0.499, 0.5, 1], [0, 0, 1, 1], Extrapolation.CLAMP),
      transform: [
        { scaleX: interpolate(rotation.value, [0.5, 1], [0, 1], Extrapolation.CLAMP) },
      ],
    }));

    return (
      <TouchableOpacity
        onPress={handleFlip}
        activeOpacity={0.95}
        style={styles.touchable}
      >
        <View style={[styles.card, style]}>
          <Animated.View style={[styles.face, frontStyle]}>
            {front}
            <View pointerEvents="none" style={styles.flipButton}>
              <Ionicons
                name="sync-outline"
                size={moderateScale(20)}
                color={colors.orange[200]}
              />
            </View>
          </Animated.View>

          <Animated.View style={[StyleSheet.absoluteFill, styles.face, backStyle]}>
            {back}
            <View pointerEvents="none" style={styles.flipButton}>
              <Ionicons
                name="sync-outline"
                size={moderateScale(20)}
                color={colors.orange[200]}
              />
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  }
);

FlipCard.displayName = 'FlipCard';

export default FlipCard;

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  card: {
    width: '100%',
  },
  face: {
    flex: 1,
  },
  flipButton: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
  },
});
