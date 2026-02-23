import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { useContext, useState, useEffect } from 'react';
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
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>(undefined);

  const characterSize = height * 0.15;

  const handleNextPlayer = () => {
    const newIndex = playerIndex + 1;
    addVote(player, selectedPlayer!);

    if (newIndex >= players.length) {
      setPlayerIndex(0);
      setPlayer(players[0]);
      setModalVisible(true);
      setSelectedPlayer(undefined);
      router.replace('/votesResults');
    } else {
      setPlayerIndex(newIndex);
      setPlayer(players[newIndex]);
      setModalVisible(true);
      setSelectedPlayer(undefined);
    }
  };

  const restOfPlayers = players.filter(p => p.id !== player.id);

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
          text={t('Vote!')}
          onPress={handleNextPlayer}
          variants={selectedPlayer ? 'primary' : 'disabled'}
        />
      }
    >
      <PlayerModal player={player} modalVisible={modalVisible} setModalVisible={setModalVisible} />

      <View style={styles.topContainer}>
        <View style={styles.topTextContainer}>
          <Text style={styles.titleInformation}>{t('Pass device to:')}</Text>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.voteInstruction}>
            {t('Vote on the person you think is the impostor:')}
          </Text>
        </View>
        <Character mood={player.character} size={characterSize} />
      </View>

      <View style={styles.tableContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.voteOptionsContainer}>
            {restOfPlayers.map(p => (
              <TouchableOpacity key={p.id} onPress={() => setSelectedPlayer(p)}>
                <PlayerInput
                  player={p}
                  notEditable
                  showScore={false}
                  selected={selectedPlayer?.id === p.id}
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
    paddingTop: verticalScale(spacing.md),
    paddingBottom: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.sm),
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topTextContainer: {
    flex: 1,
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
    flex: 1,
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
  voteInstructionName: {
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  voteOptionsContainer: {
    gap: verticalScale(spacing.xs),
  },
});
