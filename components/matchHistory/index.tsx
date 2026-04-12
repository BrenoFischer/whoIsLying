import React, { useContext } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { HistoryContext } from '@/context/HistoryContext';
import { MatchRecord, MatchRecordPlayer } from '@/types/MatchRecord';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { radius } from '@/styles/radius';
import { fontSize } from '@/styles/fontSize';
import { useTranslation } from '@/translations';

interface MatchHistoryProps {
  visible: boolean;
  onClose: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function MatchRow({ match }: { match: MatchRecord }) {
  const { t } = useTranslation();
  const sorted = [...match.players].sort((a, b) => b.scoreEarned - a.scoreEarned);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardCategory}>{t(match.category)}</Text>
        <Text style={styles.cardDate}>{formatDate(match.date)}</Text>
      </View>

      <View style={styles.playersList}>
        {sorted.map((p: MatchRecordPlayer) => (
          <View key={p.savedPlayerId} style={styles.playerRow}>
            <View style={styles.playerRowLeft}>
              {p.isMatchWinner && (
                <Ionicons
                  name="trophy"
                  size={moderateScale(11)}
                  color={colors.orange[200]}
                />
              )}
              {p.role === 'impostor' && (
                <FontAwesome
                  name="user-secret"
                  size={moderateScale(11)}
                  color={colors.red[200]}
                />
              )}
              <Text
                style={[
                  styles.playerName,
                  p.isMatchWinner && styles.playerNameWinner,
                ]}
                numberOfLines={1}
              >
                {p.name}
              </Text>
            </View>
            <Text
              style={[
                styles.playerScore,
                p.scoreEarned > 0 && styles.playerScorePositive,
              ]}
            >
              {p.scoreEarned > 0 ? `+${p.scoreEarned}` : p.scoreEarned} pts
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function MatchHistory({ visible, onClose }: MatchHistoryProps) {
  const { matchHistory } = useContext(HistoryContext);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('Match history')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={scale(24)} color={colors.orange[200]} />
          </TouchableOpacity>
        </View>

        {matchHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="time-outline"
              size={moderateScale(52)}
              color={colors.gray[300]}
            />
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
    paddingVertical: verticalScale(spacing.sm),
    gap: verticalScale(spacing.xs),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategory: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(13),
    color: colors.orange[200],
    textTransform: 'capitalize',
  },
  cardDate: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(11),
    color: colors.gray[300],
  },
  playersList: {
    gap: verticalScale(2),
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.xs),
    flex: 1,
  },
  playerName: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(12),
    color: colors.white[100],
    flexShrink: 1,
  },
  playerNameWinner: {
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  playerScore: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(12),
    color: colors.gray[300],
  },
  playerScorePositive: {
    color: colors.green[100],
    fontWeight: 'bold',
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
