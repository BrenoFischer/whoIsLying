import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/styles/colors';
import { moderateScale, scale } from 'react-native-size-matters';
import * as Haptics from 'expo-haptics';
import { radius } from '@/styles/radius';

export interface FlipCardRef {
  flipToFront: () => void;
}

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  selected?: boolean;
}

const FLIP_DURATION = 400;

const FlipCard = forwardRef<FlipCardRef, FlipCardProps>(
  ({ front, back, style, onPress, selected }, ref) => {
    const rotation = useSharedValue(0);
    const [isFront, setIsFront] = useState(true);

    useImperativeHandle(ref, () => ({
      flipToFront: () => {
        rotation.value = withTiming(0, { duration: FLIP_DURATION });
      },
    }));

    // Switch pointer events exactly when the face changes at the 0.5 midpoint
    useAnimatedReaction(
      () => rotation.value < 0.5,
      (nowFront, wasFront) => {
        if (nowFront !== wasFront) {
          runOnJS(setIsFront)(nowFront ?? true);
        }
      }
    );

    const handleFlip = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      rotation.value =
        rotation.value < 0.5
          ? withTiming(1, { duration: FLIP_DURATION })
          : withTiming(0, { duration: FLIP_DURATION });
    };

    const frontAnimStyle = useAnimatedStyle(() => ({
      opacity: interpolate(rotation.value, [0, 0.5, 0.5, 1], [1, 1, 0, 0], Extrapolation.CLAMP),
      transform: [
        { scaleX: interpolate(rotation.value, [0, 0.5], [1, 0], Extrapolation.CLAMP) },
      ],
    }));

    const backAnimStyle = useAnimatedStyle(() => ({
      opacity: interpolate(rotation.value, [0, 0.499, 0.5, 1], [0, 0, 1, 1], Extrapolation.CLAMP),
      transform: [
        { scaleX: interpolate(rotation.value, [0.5, 1], [0, 1], Extrapolation.CLAMP) },
      ],
    }));

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.9 : 1}
        style={[styles.touchable, style]}
      >
        <View style={styles.card}>
          {/* Front face */}
          <Animated.View
            style={[styles.face, frontAnimStyle]}
            pointerEvents={isFront ? 'box-none' : 'none'}
          >
            {front}
            <TouchableOpacity
              onPress={handleFlip}
              style={styles.flipButtonFront}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="sync-outline" size={moderateScale(26)} color={colors.white[100]} />
            </TouchableOpacity>
            {selected && <View style={styles.selectedOverlay} pointerEvents="none" />}
          </Animated.View>

          {/* Back face */}
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.face, backAnimStyle]}
            pointerEvents={isFront ? 'none' : 'box-none'}
          >
            {back}
            <TouchableOpacity
              onPress={handleFlip}
              style={styles.flipButtonBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="sync-outline" size={moderateScale(26)} color={colors.background[100]} />
            </TouchableOpacity>
            {selected && <View style={styles.selectedOverlay} pointerEvents="none" />}
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  }
);

FlipCard.displayName = 'FlipCard';

export default FlipCard;

const styles = StyleSheet.create({
  touchable: {},
  card: {
    flex: 1,
  },
  face: {
    flex: 1,
  },
  flipButtonFront: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: moderateScale(radius.pill),
    padding: scale(4),
  },
  flipButtonBack: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: moderateScale(radius.pill),
    padding: scale(4),
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: colors.orange[200],
    borderRadius: moderateScale(radius.lg),
    zIndex: 10,
  },
});
