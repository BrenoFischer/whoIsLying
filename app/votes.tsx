import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, useWindowDimensions } from 'react-native';
import Button from '@/components/button';
import { router } from 'expo-router';
import Elipse from '@/components/elipse';
import Character from '@/components/character';
import { Player } from '@/types/Player';
import PlayerModal from '@/components/playerModal';
import PlayerInput from '@/components/playerInput';
import { useTranslation } from '@/translations';
import { scale, verticalScale } from 'react-native-size-matters';
import Dot from '@/components/dot';
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';

export default function Votes() {
  const { game, addVote, setCurrentScreen } = useContext(GameContext);
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  useEffect(() => {
    setCurrentScreen('/votes');
  }, []);

  const players = game.players;
  const [player, setPlayer] = useState(players[0]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[] | undefined>(undefined);

  const numberOfImpostors = game.config.numberOfImpostors;
  const scrollRef = useRef<ScrollView>(null);

  const characterSize = height * 0.15;
  const maxListHeight = height * 0.45;
  const [listHeight, setListHeight] = useState(0);

  const handleNextPlayer = () => {
    const newIndex = playerIndex + 1;
    addVote(player, selectedPlayers ?? []);
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    if (newIndex >= players.length) {
      setPlayerIndex(0);
      setPlayer(players[0]);
      setModalVisible(true);
      setSelectedPlayers(undefined);
      router.replace('/votesResults');
    } else {
      setPlayerIndex(newIndex);
      setPlayer(players[newIndex]);
      setModalVisible(true);
      setSelectedPlayers(undefined);
    }
  };

  const handleSelectPlayer = (selected: Player) => {
    if (selectedPlayers === undefined) {
      //no selected player yet, set the first one
      setSelectedPlayers([selected]);
      return;
    }
    if(selectedPlayers.some(p => p.id === selected.id)) {
      //player already selected, remove from the list
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== selected.id));
      return;
    }
    if(selectedPlayers.length === numberOfImpostors) {
      //already selected the max number of players, replace the first one with the new one
      const newSelectedPlayers = [...selectedPlayers];
      newSelectedPlayers.shift();
      setSelectedPlayers([...newSelectedPlayers, selected]);
      return;
    }
    setSelectedPlayers([...selectedPlayers, selected]);
  }

  const restOfPlayers = useMemo(() =>
    players.filter(p => p.id !== player.id).sort(() => Math.random() - 0.5),
  [player]);

  const isContinueAvailable = selectedPlayers !== undefined && selectedPlayers.length === numberOfImpostors;
  const continueButtonText = selectedPlayers === undefined
    ? t('Vote!')
    : selectedPlayers.length === numberOfImpostors
      ? t('Continue')
      :
    `${selectedPlayers.length} of ${numberOfImpostors} ${t('selected')}`;

  return (
    <ScreenLayout
      style={modalVisible ? { opacity: 0.1 } : undefined}
      header={
        <View style={styles.headerContainer}>
          <Elipse top={verticalScale(-20)} left={scale(-80)} />
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t('Vote')}</Text>
            <Dot color={colors.white[100]} />
            <Text style={styles.headerTitle}>
              {t('Player')} {playerIndex + 1} {t('of')} {players.length}
            </Text>
          </View>
          <SidebarMenu />
        </View>
      }
      footer={
        <Button
          text={continueButtonText}
          onPress={handleNextPlayer}
          variants={isContinueAvailable ? 'primary' : 'disabled'}
        />
      }
    >
      <PlayerModal player={player} modalVisible={modalVisible} setModalVisible={setModalVisible} />

      <View style={styles.topContainer}>
        <View style={styles.topTextContainer}>
          <Text style={styles.titleInformation}>{t('Pass device to:')}</Text>
          <Text style={styles.playerName}>{player.name}</Text>
          {numberOfImpostors > 1 ?
            <Text style={styles.voteInstruction}>
              {t('Vote on ')}<Text style={{ fontWeight: 'bold', fontSize: fontSize.lg }}>{numberOfImpostors}</Text>{t(' people you think are the impostors:')}
            </Text>
           :
            <Text style={styles.voteInstruction}>
              {t('Vote on the person you think is the impostor:')}
            </Text>
          }
          <View style={styles.selectedSlotsRow}>
            {Array.from({ length: numberOfImpostors }).map((_, i) => {
              const sel = selectedPlayers?.[i];
              return (
                <View key={i} style={[styles.selectedSlot, sel ? styles.selectedSlotFilled : styles.selectedSlotEmpty]}>
                  <Text style={[styles.selectedSlotText, !sel && styles.selectedSlotTextEmpty]} numberOfLines={1}>
                    {sel ? sel.name : '—'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <Character mood={player.character} size={characterSize} />
      </View>

      <View style={[styles.tableContainer, listHeight ? { height: listHeight } : undefined]}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={(_, contentHeight) => {
            // Cap to maxListHeight so the card doesn't overflow the screen on large player counts.
            // Add tableContainer's top + bottom padding so the card wraps the content exactly.
            setListHeight(Math.min(contentHeight, maxListHeight) + scale(spacing.md) * 2);
          }}
        >
          <View style={styles.voteOptionsContainer}>
            {restOfPlayers.map(p => (
              <TouchableOpacity key={p.id} onPress={() => handleSelectPlayer(p)}>
                <PlayerInput
                  player={p}
                  notEditable
                  showScore={false}
                  selected={selectedPlayers?.some(player => player.id === p.id)}
                  variant="secondary"
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.md),
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.xs),
  },
  headerTitle: {
    textTransform: 'capitalize',
    fontSize: fontSize.sm,
    fontFamily: 'Raleway-Medium',
  },
  topContainer: {
    paddingHorizontal: scale(spacing.md),
    paddingTop: verticalScale(spacing.md),
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  topTextContainer: {
    flex: 1,
    paddingBottom: verticalScale(spacing.sm),
  },
  titleInformation: {
    fontSize: fontSize.lg,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.black[100],
  },
  playerName: {
    fontFamily: 'Raleway',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white[100],
  },
  tableContainer: {
    marginHorizontal: scale(spacing.md),
    padding: scale(spacing.md),
    backgroundColor: colors.white[100],
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: scale(spacing.sm),
    elevation: 5,
  },
  voteInstruction: {
    fontFamily: 'Raleway',
    fontSize: fontSize.md,
    marginTop: verticalScale(spacing.xs),
  },
  selectedSlotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(spacing.xs),
    marginTop: verticalScale(spacing.xs),
    height: verticalScale(28),
    alignItems: 'center',
  },
  selectedSlot: {
    borderRadius: radius.pill,
    paddingHorizontal: scale(spacing.sm),
    height: '100%',
    justifyContent: 'center',
    maxWidth: scale(100),
  },
  selectedSlotFilled: {
    backgroundColor: colors.orange[200],
  },
  selectedSlotEmpty: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderStyle: 'dashed',
  },
  selectedSlotText: {
    fontSize: fontSize.sm,
    fontFamily: 'Raleway-Medium',
    fontWeight: 'bold',
    color: colors.background[100],
  },
  selectedSlotTextEmpty: {
    color: colors.gray[300],
  },
  voteInstructionName: {
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  voteOptionsContainer: {
    gap: verticalScale(spacing.xs),
  },
});
