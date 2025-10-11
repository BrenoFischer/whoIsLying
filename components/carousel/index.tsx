import { colors } from '@/styles/colors';
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { scale } from 'react-native-size-matters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CarouselProps {
  data: any[];
  renderItem: (item: any, index: number, isActive: boolean) => React.ReactElement;
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
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {data.map((item, index) => {
          const isActive = currentIndex === index;
          return (
            <View
              key={index}
              style={[
                styles.itemContainer,
                { width: itemWidth, marginHorizontal: spacing / 2 },
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
                width: currentIndex === index ? scale(24) : scale(8),
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
    paddingHorizontal: SCREEN_WIDTH * 0.15,
    alignItems: 'center',
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: scale(30),
    gap: scale(8),
  },
  indicator: {
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: colors.orange[200],
  },
});
