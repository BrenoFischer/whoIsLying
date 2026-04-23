import { colors } from '@/styles/colors';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';
import { useEffect, useRef } from 'react';
import { Animated, Modal, PanResponder, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const REACTIONS = [
  { emoji: '🤔', label: 'Suspicious...' },
  { emoji: '😅', label: 'Very convincing!' },
  { emoji: '🤥', label: "That's a lie!" },
  { emoji: '😂', label: 'No way!' },
  { emoji: '🧐', label: "Something's off..." },
  { emoji: '🙄', label: 'Interesting...' },
  { emoji: '😱', label: 'Wait, what?!' },
  { emoji: '🫣', label: "I can't believe it..." },
];

const SHEET_OFFSET = 500;
const DISMISS_THRESHOLD = 80;

interface ReactionModalProps {
  visible: boolean;
  currentReaction: string | undefined;
  onSelect: (reaction: string | undefined) => void;
  onClose: () => void;
}

export default function ReactionModal({ visible, currentReaction, onSelect, onClose }: ReactionModalProps) {
  const translateY = useRef(new Animated.Value(SHEET_OFFSET)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SHEET_OFFSET);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 14,
      }).start();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: SHEET_OFFSET,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > 0.8) {
          dismiss();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const handleSelect = (emoji: string, label: string) => {
    const value = `${emoji} ${label}`;
    onSelect(currentReaction === value ? undefined : value);
    dismiss();
  };

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={dismiss}>
      <Pressable style={styles.backdrop} onPress={dismiss} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
        <View style={styles.handle} />
        <View style={styles.grid}>
          {REACTIONS.map(({ emoji, label }) => {
            const value = `${emoji} ${label}`;
            const selected = currentReaction === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => handleSelect(emoji, label)}
              >
                <Text style={styles.chipEmoji}>{emoji}</Text>
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]} numberOfLines={1}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.background[100],
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    paddingTop: verticalScale(12),
  },
  handle: {
    width: scale(40),
    height: verticalScale(4),
    borderRadius: radius.sm,
    backgroundColor: colors.gray[300],
    alignSelf: 'center',
    marginBottom: verticalScale(16),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(20),
    backgroundColor: colors.gray[300] + '44',
    borderWidth: 1,
    borderColor: 'transparent',
    width: '47%',
  },
  chipSelected: {
    borderColor: colors.orange[200],
    backgroundColor: colors.orange[200] + '22',
  },
  chipEmoji: {
    fontSize: moderateScale(18),
  },
  chipLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'Raleway-Medium',
    color: colors.white[100],
    flexShrink: 1,
  },
  chipLabelSelected: {
    color: colors.orange[200],
  },
});
