import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HistoryContext } from '@/context/HistoryContext';
import { SavedPlayer } from '@/types/SavedPlayer';
import { Player } from '@/types/Player';
import Character from '@/components/character';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { radius } from '@/styles/radius';
import { fontSize } from '@/styles/fontSize';
import { useTranslation } from '@/translations';

interface SavedPlayersListProps {
  visible: boolean;
  onClose: () => void;
  currentPlayers: Player[];
  maxPlayers: number;
  availableCharacters: string[];
  onSelectPlayer: (player: Player) => void;
  onLoadGroup?: () => void;
}

export default function SavedPlayersList({
  visible,
  onClose,
  currentPlayers,
  maxPlayers,
  availableCharacters,
  onSelectPlayer,
  onLoadGroup,
}: SavedPlayersListProps) {
  const { savedPlayers, deleteSavedPlayer, matchHistory } = useContext(HistoryContext);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const characterSize = height * 0.08;

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      setConfirmDeleteId(null);
      toastOpacity.setValue(0);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    }
  }, [visible]);

  const showToast = () => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastOpacity.setValue(0);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      toastTimeout.current = setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }, 3000);
    });
  };

  const currentPlayerNames = new Set(currentPlayers.map(p => p.name));

  const resolveCharacter = (preferred: string): string =>
    availableCharacters.includes(preferred)
      ? preferred
      : availableCharacters[0] ?? preferred;

  const handleAdd = (saved: SavedPlayer) => {
    if (currentPlayerNames.has(saved.name)) return;
    if (currentPlayers.length >= maxPlayers) {
      showToast();
      return;
    }
    onSelectPlayer({
      id: saved.id,
      name: saved.name,
      theme: saved.preferredTheme,
      character: resolveCharacter(saved.preferredCharacter),
      score: 0,
      matchScore: { scoreEvents: [], totalScore: 0 },
    });
  };

  const renderItem = ({ item }: { item: SavedPlayer }) => {
    const alreadyAdded = currentPlayerNames.has(item.name);
    const isConfirmingDelete = confirmDeleteId === item.id;

    return (
      <View style={styles.row}>
        {isConfirmingDelete ? (
          <View style={styles.deleteConfirmRow}>
            <Text style={styles.deleteConfirmText} numberOfLines={1}>
              {t('Delete')}{' '}
              <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>?
            </Text>
            <View style={styles.deleteConfirmActions}>
              <TouchableOpacity
                style={styles.deleteConfirmCancel}
                onPress={() => setConfirmDeleteId(null)}
              >
                <Ionicons
                  name="close"
                  size={moderateScale(18)}
                  color={colors.gray[300]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmAccept}
                onPress={() => {
                  deleteSavedPlayer(item.id);
                  setConfirmDeleteId(null);
                }}
              >
                <Ionicons
                  name="checkmark"
                  size={moderateScale(18)}
                  color={colors.white[100]}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.rowInfo}
              onPress={() => handleAdd(item)}
              disabled={alreadyAdded}
              activeOpacity={0.6}
            >
              <View style={styles.rowCharacter}>
                <Character mood={item.preferredCharacter} size={characterSize} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.rowMatches}>
                  {item.stats.matchesPlayed}{' '}
                  {item.stats.matchesPlayed === 1 ? t('match') : t('matches')}
                </Text>
              </View>
              {alreadyAdded && (
                <Ionicons
                  name="checkmark-circle"
                  size={moderateScale(22)}
                  color={colors.orange[200]}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setConfirmDeleteId(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <EvilIcons
                name="trash"
                size={moderateScale(28)}
                color={colors.red[200]}
              />
            </TouchableOpacity>
          </>
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
          <Text style={styles.headerTitle}>{t('Saved players')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons
              name="close"
              size={scale(24)}
              color={colors.orange[200]}
            />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.toast, { opacity: toastOpacity }]}
          pointerEvents="none"
        >
          <Ionicons
            name="information-circle"
            size={moderateScale(16)}
            color={colors.white[100]}
          />
          <Text style={styles.toastText}>
            {t('Player limit reached')} ({currentPlayers.length}/{maxPlayers})
          </Text>
        </Animated.View>

        {onLoadGroup && matchHistory.length > 0 && (
          <TouchableOpacity
            style={styles.loadGroupBanner}
            onPress={onLoadGroup}
            activeOpacity={0.75}
          >
            <Ionicons
              name="time-outline"
              size={moderateScale(16)}
              color={colors.orange[200]}
            />
            <Text style={styles.loadGroupBannerText}>
              {t('Load a full group from history')}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={moderateScale(14)}
              color={colors.orange[200]}
            />
          </TouchableOpacity>
        )}

        {savedPlayers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.orange[200] + '40',
    borderRadius: moderateScale(radius.md),
    paddingHorizontal: scale(spacing.sm),
    paddingTop: verticalScale(spacing.xs),
    minHeight: verticalScale(64),
  },
  rowCharacter: {
    alignSelf: 'flex-end',
  },
  rowInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.sm),
  },
  rowText: {
    flex: 1,
    gap: verticalScale(2),
  },
  rowName: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(14),
    color: colors.white[100],
  },
  rowMatches: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(11),
    color: colors.gray[300],
  },
  deleteButton: {
    paddingLeft: scale(spacing.sm),
    alignSelf: 'center',
  },
  // ── Inline delete confirmation ──────────────────────────────────────────
  deleteConfirmRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(spacing.sm),
  },
  deleteConfirmText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(13),
    color: colors.white[100],
    flex: 1,
  },
  deleteConfirmActions: {
    flexDirection: 'row',
    gap: scale(spacing.xs),
  },
  deleteConfirmCancel: {
    padding: scale(spacing.xs),
    borderRadius: moderateScale(radius.pill),
    borderWidth: 1,
    borderColor: colors.gray[300] + '60',
  },
  deleteConfirmAccept: {
    padding: scale(spacing.xs),
    borderRadius: moderateScale(radius.pill),
    backgroundColor: colors.red[200],
  },
  // ── Toast ───────────────────────────────────────────────────────────────
  toast: {
    position: 'absolute',
    bottom: verticalScale(spacing.xl),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.xs),
    backgroundColor: colors.orange[200],
    paddingHorizontal: scale(spacing.md),
    paddingVertical: verticalScale(spacing.sm),
    borderRadius: moderateScale(radius.pill),
    zIndex: 100,
  },
  toastText: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(13),
    color: colors.white[100],
  },
  // ── Load group banner ────────────────────────────────────────────────────
  loadGroupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.xs),
    paddingHorizontal: scale(spacing.sm),
    paddingVertical: verticalScale(spacing.sm),
    borderRadius: moderateScale(radius.md),
    borderWidth: 1,
    borderColor: colors.orange[200] + '50',
    backgroundColor: colors.orange[200] + '12',
    marginBottom: verticalScale(spacing.sm),
  },
  loadGroupBannerText: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(13),
    color: colors.orange[200],
    flex: 1,
  },
  // ── Empty state ─────────────────────────────────────────────────────────
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
