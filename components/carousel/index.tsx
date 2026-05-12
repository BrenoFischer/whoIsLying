import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { scale } from 'react-native-size-matters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CarouselProps {
  data: any[];
  renderItem: (
    item: any,
    index: number,
    isActive: boolean
  ) => React.ReactElement;
  onIndexChange?: (index: number) => void;
  itemWidth?: number;
  spacing?: number;
}

export default function Carousel({
  data,
  renderItem,
  onIndexChange,
  itemWidth = SCREEN_WIDTH * 0.7,
  spacing = scale(20),
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalItemWidth = itemWidth + spacing;
  const snapToOffsets = data.map((_, index) => index * totalItemWidth);
  const sidePadding = Math.max(0, (SCREEN_WIDTH - itemWidth - spacing) / 2);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / totalItemWidth);

    if (index !== currentIndex && index >= 0 && index < data.length) {
      setCurrentIndex(index);
      if (onIndexChange) {
        onIndexChange(index);
      }
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleScroll(event);
  };

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToOffsets={snapToOffsets}
        snapToAlignment="center"
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: sidePadding }]}
        style={styles.scrollView}
      >
        {data.map((item, index) => {
          const isActive = currentIndex === index;
          return (
            <View
              key={index}
              style={[
                styles.itemContainer,
                {
                  width: itemWidth,
                  marginHorizontal: spacing / 2,
                  transform: [{ scale: isActive ? 1.04 : 0.97 }],
                },
              ]}
            >
              {renderItem(item, index, isActive)}
            </View>
          );
        })}
      </ScrollView>

      {/* Dot Indicators */}
      <View style={styles.indicatorContainer}>
        {data.map((_, index) => (
          <View
            key={`indicator-${index}`}
            style={[
              styles.indicator,
              {
                width: currentIndex === index ? scale(22) : scale(4),
                height: currentIndex === index ? scale(7) : scale(4),
                opacity: currentIndex === index ? 1 : 0.28,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: scale(spacing.sm),
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(10),
    gap: scale(4),
  },
  indicator: {
    height: scale(6),
    borderRadius: scale(4),
    backgroundColor: colors.orange[200],
  },
});
