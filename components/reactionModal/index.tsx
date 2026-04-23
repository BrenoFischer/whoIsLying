import { colors } from '@/styles/colors';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';
import { useTranslation } from '@/translations';
import { useEffect, useRef } from 'react';
import { Animated, Modal, PanResponder, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export const ROUND_REACTIONS = [
  { emoji: '🤔', label: 'Suspicious...' },
  { emoji: '😅', label: 'Very convincing!' },
  { emoji: '🤥', label: "That's a lie!" },
  { emoji: '😂', label: 'No way!' },
  { emoji: '🧐', label: "Something's off..." },
  { emoji: '🙄', label: 'Interesting...' },
  { emoji: '😱', label: 'Wait, what?!' },
  { emoji: '🫣', label: "Can't believe it..." },
];

export const VOTE_REACTIONS = [
  { emoji: '💯', label: 'Definitely this' },
  { emoji: '🤷', label: 'Not sure...' },
  { emoji: '🔍', label: 'Clues point here' },
  { emoji: '😬', label: 'Just a feeling' },
  { emoji: '😤', label: "I'm certain!" },
  { emoji: '😅', label: 'Could be wrong...' },
  { emoji: '🤔', label: 'Hard to tell...' },
  { emoji: '🫵', label: "It's you!" },
];

export function displayReaction(reaction: string, t: (key: string) => string): string {
  const spaceIdx = reaction.indexOf(' ');
  if (spaceIdx === -1) return reaction;
  const emoji = reaction.slice(0, spaceIdx);
  const label = reaction.slice(spaceIdx + 1);
  return `${emoji} ${t(label)}`;
}

const SHEET_OFFSET = 500;
const DISMISS_THRESHOLD = 80;

interface ReactionModalProps {
  visible: boolean;
  currentReaction: string | undefined;
  onSelect: (reaction: string | undefined) => void;
  onClose: () => void;
  reactions?: { emoji: string; label: string }[];
}

export default function ReactionModal({ visible, currentReaction, onSelect, onClose, reactions = ROUND_REACTIONS }: ReactionModalProps) {
  const { t } = useTranslation();
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
      onStartShouldSetPanResponder: () => true,
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
    const key = `${emoji} ${label}`;
    onSelect(currentReaction === key ? undefined : key);
    dismiss();
  };

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={dismiss}>
      <Pressable style={styles.backdrop} onPress={dismiss} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Handle area — panHandlers here only, chips get unobstructed touches */}
        <View style={styles.handleWrapper} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>
        <View style={styles.grid}>
          {reactions.map(({ emoji, label }) => {
            const key = `${emoji} ${label}`;
            const selected = currentReaction === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => handleSelect(emoji, label)}
              >
                <Text style={styles.chipEmoji}>{emoji}</Text>
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]} numberOfLines={1}>
                  {t(label)}
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
    backgroundColor: 'transparent',
  },
  sheet: {
    backgroundColor: colors.background[100],
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
  },
  handleWrapper: {
    alignItems: 'center',
    paddingVertical: verticalScale(14),
  },
  handle: {
    width: scale(40),
    height: verticalScale(4),
    borderRadius: radius.sm,
    backgroundColor: colors.gray[300],
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
