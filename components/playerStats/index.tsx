import React, { useContext, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { HistoryContext } from '@/context/HistoryContext';
import { SavedPlayer, SavedPlayerStats } from '@/types/SavedPlayer';
import Character from '@/components/character';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { radius } from '@/styles/radius';
import { fontSize } from '@/styles/fontSize';
import { useTranslation } from '@/translations';

interface PlayerStatsProps {
  visible: boolean;
  onClose: () => void;
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function voteAccuracy(stats: SavedPlayerStats): string {
  if (stats.civilianVotesTotal === 0) return 'N/A';
  return `${stats.civilianVotesCorrect}/${stats.civilianVotesTotal}`;
}

export default function PlayerStats({ visible, onClose }: PlayerStatsProps) {
  const { savedPlayers } = useContext(HistoryContext);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const characterSize = height * 0.08;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id));

  const renderItem = ({ item }: { item: SavedPlayer }) => {
    const isExpanded = expandedId === item.id;
    const { stats } = item;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggle(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardCharacter}>
            <Character mood={item.preferredCharacter} size={characterSize} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.playerName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.playerMatches}>
              {stats.matchesPlayed}{' '}
              {stats.matchesPlayed === 1 ? t('match') : t('matches')}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={moderateScale(20)}
            color={colors.orange[200]}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.statsGrid}>
            <View style={styles.statsDivider} />
            <View style={styles.statsRow}>
              <StatCell label={t('Matches won')} value={String(stats.matchesWon)} />
              <StatCell label={t('Times impostor')} value={String(stats.timesImpostor)} />
            </View>
            <View style={styles.statsRow}>
              <StatCell label={t('Detected')} value={String(stats.timesDetectedAsImpostor)} />
              <StatCell label={t('Undetected')} value={String(stats.timesUndetectedAsImpostor)} />
            </View>
            <View style={styles.statsRow}>
              <StatCell label={t('Guessed word')} value={String(stats.timesGuessedWord)} />
              <StatCell label={t('Vote accuracy')} value={voteAccuracy(stats)} />
            </View>
            <View style={styles.statsRow}>
              <StatCell
                label={t('Lifetime score')}
                value={`${stats.lifetimeScore} pts`}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('Player stats')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={scale(24)} color={colors.orange[200]} />
          </TouchableOpacity>
        </View>

        {savedPlayers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="person-outline"
              size={moderateScale(52)}
              color={colors.gray[300]}
            />
            <Text style={styles.emptyTitle}>{t('No saved players yet')}</Text>
            <Text style={styles.emptySubtext}>
              {t('Players are saved automatically when you create a game.')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={savedPlayers}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background[100],
    paddingHorizontal: scale(spacing.lg),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300] + '30',
    marginBottom: verticalScale(spacing.sm),
  },
  headerTitle: {
    fontFamily: 'Raleway-Medium',
    fontWeight: 'bold',
    fontSize: fontSize.xl,
    color: colors.orange[200],
  },
  listContent: {
    gap: verticalScale(spacing.xs),
    paddingBottom: verticalScale(spacing.xl),
  },
  card: {
    borderWidth: 1,
    borderColor: colors.orange[200] + '40',
    borderRadius: moderateScale(radius.md),
    paddingHorizontal: scale(spacing.sm),
    paddingTop: verticalScale(spacing.xs),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.sm),
  },
  cardCharacter: {
    alignSelf: 'flex-end',
  },
  cardHeaderText: {
    flex: 1,
    gap: verticalScale(2),
  },
  playerName: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(14),
    color: colors.white[100],
  },
  playerMatches: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(11),
    color: colors.gray[300],
  },
  statsDivider: {
    height: 1,
    backgroundColor: colors.gray[300] + '30',
    marginVertical: verticalScale(spacing.xs),
  },
  statsGrid: {
    gap: verticalScale(2),
  },
  statsRow: {
    flexDirection: 'row',
  },
  statCell: {
    flex: 1,
    paddingVertical: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.xs),
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    color: colors.orange[200],
  },
  statLabel: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(10),
    fontWeight: 'bold',
    color: colors.gray[300],
    textAlign: 'center',
    marginTop: verticalScale(1),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(spacing.sm),
  },
  emptyTitle: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    color: colors.white[100],
  },
  emptySubtext: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(13),
    color: colors.gray[300],
    textAlign: 'center',
    paddingHorizontal: scale(spacing.xl),
  },
});
