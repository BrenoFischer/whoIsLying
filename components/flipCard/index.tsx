import React, { forwardRef, useImperativeHandle } from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
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
  style?: ViewStyle;
}

const FLIP_DURATION = 400;

const FlipCard = forwardRef<FlipCardRef, FlipCardProps>(({ front, back, style }, ref) => {
  const rotation = useSharedValue(0); // 0 = front, 1 = back

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

  // The entire card container (including orange border) rotates
  const cardRotateStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 1], [0, 180], Extrapolation.CLAMP)}deg` },
    ],
  }));

  // Front face fades out as card passes 90°
  const frontOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rotation.value, [0, 0.49, 0.5, 1], [1, 1, 0, 0], Extrapolation.CLAMP),
  }));

  // Back face fades in after card passes 90°; scaleX:-1 counteracts the 180° rotation
  // so text and layout appear readable and correctly positioned
  const backOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rotation.value, [0, 0.5, 0.51, 1], [0, 0, 1, 1], Extrapolation.CLAMP),
    transform: [{ scaleX: -1 }],
  }));

  return (
    <TouchableOpacity onPress={handleFlip} activeOpacity={0.95} style={styles.touchable}>
      {/* This Animated.View is what actually rotates — style prop carries the border/bg */}
      <Animated.View style={[styles.card, style, cardRotateStyle]}>

        {/* Front face — flex:1 so it sizes the card and stays inside the orange border */}
        <Animated.View style={[styles.face, frontOpacityStyle]}>
          {front}
          <View pointerEvents="none" style={styles.flipButtonFront}>
            <Ionicons name="sync-outline" size={moderateScale(20)} color={colors.orange[200]} />
          </View>
        </Animated.View>

        {/* Back face — absoluteFill on top of front; scaleX:-1 un-mirrors content */}
        <Animated.View style={[StyleSheet.absoluteFill, backOpacityStyle]}>
          {back}
          {/*
            Button uses `left` not `right` because scaleX:-1 swaps sides.
            local left:8 → visual right:8 after the mirror.
          */}
          <View pointerEvents="none" style={styles.flipButtonBack}>
            <Ionicons name="chevron-back-circle-outline" size={moderateScale(20)} color={colors.orange[200]} />
          </View>
        </Animated.View>

      </Animated.View>
    </TouchableOpacity>
  );
});

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
  flipButtonFront: {
    position: 'absolute',
    bottom: scale(8),
    right: scale(8),
  },
  flipButtonBack: {
    position: 'absolute',
    bottom: scale(8),
    left: scale(8), // appears at visual right because parent has scaleX:-1
  },
});
