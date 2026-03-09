import { useState } from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MaterialIcons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { CharacterData, CharacterTheme, themes } from '@/data/imagesData';
import Character from '@/components/character';
import { colors } from '@/styles/colors';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';
import { useTranslation } from '@/translations';

interface CharacterPickerProps {
  availableCharacters: CharacterData[];
  onSelect: (name: string) => void;
  themeFilter?: CharacterTheme | 'all';
  onThemeFilterChange?: (filter: CharacterTheme | 'all') => void;
}

export default function CharacterPicker({
  availableCharacters,
  onSelect,
  themeFilter: controlledFilter,
  onThemeFilterChange,
}: CharacterPickerProps) {
  const [internalFilter, setInternalFilter] = useState<CharacterTheme | 'all'>(
    'all'
  );
  const themeFilter = controlledFilter ?? internalFilter;
  const setThemeFilter = onThemeFilterChange ?? setInternalFilter;
  const { t } = useTranslation();

  const filtered =
    themeFilter === 'all'
      ? availableCharacters
      : availableCharacters.filter(c => c.theme === themeFilter);

  function hasAvailableForTheme(theme: CharacterTheme) {
    return availableCharacters.some(c => c.theme === theme);
  }

  function themeIconColor(theme: CharacterTheme): string {
    if (themeFilter === theme) return colors.white[100];
    return colors.orange[200];
  }

  return (
    <View>
      <View style={styles.themeFilterRow}>
        <TouchableOpacity
          onPress={() => setThemeFilter('all')}
          style={[
            styles.themeButton,
            themeFilter === 'all' && styles.themeButtonSelected,
          ]}
        >
          <Text
            style={[
              styles.themeAllText,
              themeFilter === 'all' && styles.themeAllTextSelected,
            ]}
          >
            {t('All')}
          </Text>
        </TouchableOpacity>

        <View style={styles.themeSeparator} />

        {themes.map(theme => (
          <TouchableOpacity
            key={theme}
            onPress={() => setThemeFilter(theme)}
            style={[
              styles.themeButton,
              themeFilter === theme && styles.themeButtonSelected,
              !hasAvailableForTheme(theme) && styles.themeButtonUnavailable,
            ]}
          >
            {theme === 'male' && (
              <MaterialIcons
                name="man"
                size={moderateScale(20)}
                color={themeIconColor(theme)}
              />
            )}
            {theme === 'female' && (
              <MaterialIcons
                name="woman"
                size={moderateScale(20)}
                color={themeIconColor(theme)}
              />
            )}
            {theme === 'halloween' && (
              <MaterialCommunityIcons
                name="ghost-outline"
                size={moderateScale(20)}
                color={themeIconColor(theme)}
              />
            )}
            {theme === 'music' && (
              <MaterialCommunityIcons
                name="music-note"
                size={moderateScale(20)}
                color={themeIconColor(theme)}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.name}
        numColumns={2}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t('No more available images for this theme')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.imageItem}>
            <TouchableOpacity onPress={() => onSelect(item.name)}>
              <Character mood={item.name} size={80} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  themeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    gap: scale(4),
  },
  themeButton: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.orange[200],
  },
  themeButtonSelected: {
    backgroundColor: colors.orange[200],
  },
  themeButtonUnavailable: {
    opacity: 0.3,
  },
  themeAllText: {
    fontSize: fontSize.sm,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  themeAllTextSelected: {
    color: colors.white[100],
  },
  themeSeparator: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.white[100],
    opacity: 0.4,
    marginHorizontal: scale(4),
  },
  list: {
    height: verticalScale(350),
  },
  emptyContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Raleway',
    fontSize: fontSize.sm,
    color: colors.gray[100],
    textAlign: 'center',
  },
  imageItem: {
    flex: 1,
    marginVertical: verticalScale(3),
    alignItems: 'center',
  },
});
