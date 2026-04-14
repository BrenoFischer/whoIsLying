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
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { HistoryContext } from '@/context/HistoryContext';
import { SavedPlayer, SavedPlayerStats } from '@/types/SavedPlayer';
import { MatchRecord, MatchRecordPlayer } from '@/types/MatchRecord';
import Character from '@/components/character';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { radius } from '@/styles/radius';
import { fontSize } from '@/styles/fontSize';
import { useTranslation } from '@/translations';

type Tab = 'players' | 'history';

interface StatsModalProps {
  visible: boolean;
  onClose: () => void;
}

// ── Player stats helpers ──────────────────────────────────────────────────────

function voteAccuracy(stats: SavedPlayerStats): string {
  if (stats.civilianVotesTotal === 0) return 'N/A';
  return `${stats.civilianVotesCorrect}/${stats.civilianVotesTotal}`;
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PlayerCard({
  item,
  isExpanded,
  onToggle,
  characterSize,
}: {
  item: SavedPlayer;
  isExpanded: boolean;
  onToggle: () => void;
  characterSize: number;
}) {
  const { t } = useTranslation();
  const { stats } = item;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggle}
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
}

// ── Match history helpers ─────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function MatchRow({ match }: { match: MatchRecord }) {
  const { t } = useTranslation();
  const sorted = [...match.players].sort((a, b) => b.scoreEarned - a.scoreEarned);

  return (
    <View style={styles.card}>
      <View style={styles.matchCardHeaderRow}>
        <Text style={styles.matchCardCategory}>{t(match.category)}</Text>
        <Text style={styles.matchCardDate}>{formatDate(match.date)}</Text>
      </View>
      <View style={styles.matchPlayersList}>
        {sorted.map((p: MatchRecordPlayer) => (
          <View key={p.savedPlayerId} style={styles.matchPlayerRow}>
            <View style={styles.matchPlayerRowLeft}>
              {p.isMatchWinner && (
                <Ionicons name="trophy" size={moderateScale(11)} color={colors.orange[200]} />
              )}
              {p.role === 'impostor' && (
                <FontAwesome name="user-secret" size={moderateScale(11)} color={colors.red[200]} />
              )}
              <Text
                style={[styles.matchPlayerName, p.isMatchWinner && styles.matchPlayerNameWinner]}
                numberOfLines={1}
              >
                {p.name}
              </Text>
            </View>
            <Text style={[styles.matchPlayerScore, p.scoreEarned > 0 && styles.matchPlayerScorePositive]}>
              {p.scoreEarned > 0 ? `+${p.scoreEarned}` : p.scoreEarned} pts
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StatsModal({ visible, onClose }: StatsModalProps) {
  const { savedPlayers, matchHistory } = useContext(HistoryContext);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const characterSize = height * 0.08;

  const [activeTab, setActiveTab] = useState<Tab>('players');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleClose = () => {
    setExpandedId(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('Statistics')}</Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={scale(24)} color={colors.orange[200]} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'players' && styles.tabActive]}
            onPress={() => setActiveTab('players')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'players' && styles.tabTextActive]}>
              {t('Player stats')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              {t('Match history')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'players' ? (
          savedPlayers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="person-outline" size={moderateScale(52)} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>{t('No saved players yet')}</Text>
              <Text style={styles.emptySubtext}>
                {t('Players are saved automatically when you create a game.')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={savedPlayers}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <PlayerCard
                  item={item}
                  isExpanded={expandedId === item.id}
                  onToggle={() => setExpandedId(prev => (prev === item.id ? null : item.id))}
                  characterSize={characterSize}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : (
          matchHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={moderateScale(52)} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>{t('No matches played yet')}</Text>
              <Text style={styles.emptySubtext}>
                {t('Your match history will appear here after your first game.')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={matchHistory}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <MatchRow match={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )
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
  },
  headerTitle: {
    fontFamily: 'Raleway-Medium',
    fontWeight: 'bold',
    fontSize: fontSize.xl,
    color: colors.orange[200],
  },
  // ── Tabs ──────────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300] + '30',
    marginBottom: verticalScale(spacing.sm),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(spacing.sm),
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.orange[200],
  },
  tabText: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(13),
    color: colors.gray[300],
  },
  tabTextActive: {
    color: colors.orange[200],
  },
  // ── List ──────────────────────────────────────────────────────────────────
  listContent: {
    gap: verticalScale(spacing.xs),
    paddingBottom: verticalScale(spacing.xl),
  },
  // ── Player stats card ─────────────────────────────────────────────────────
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
  // ── Match history card ────────────────────────────────────────────────────
  matchCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.xs),
  },
  matchCardCategory: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(13),
    color: colors.orange[200],
    textTransform: 'capitalize',
  },
  matchCardDate: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(11),
    color: colors.gray[300],
  },
  matchPlayersList: {
    gap: verticalScale(2),
    paddingHorizontal: scale(spacing.xs),
    paddingBottom: verticalScale(spacing.xs),
  },
  matchPlayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchPlayerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.xs),
    flex: 1,
  },
  matchPlayerName: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(12),
    color: colors.white[100],
    flexShrink: 1,
  },
  matchPlayerNameWinner: {
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  matchPlayerScore: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(12),
    color: colors.gray[300],
  },
  matchPlayerScorePositive: {
    color: colors.green[100],
    fontWeight: 'bold',
  },
  // ── Empty states ──────────────────────────────────────────────────────────
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
