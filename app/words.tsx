import Button from '@/components/button';
import Character from '@/components/character';
import PlayerModal from '@/components/playerModal';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import { router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from '@/translations';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import ScreenLayout from '@/components/screenLayout';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';
import Elipse from '@/components/elipse';
import Dot from '@/components/dot';
import SidebarMenu from '@/components/sideBarMenu';

export default function Words() {
  const {
    game,
    getRandomWord,
    setImpostorVotes,
    getCurrentWord,
    setCurrentScreen,
  } = useContext(GameContext);
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  useEffect(() => {
    setCurrentScreen('/words');
  }, []);

  const characterSize = height * 0.18;
  const impostors = game.lyingPlayers;

  const [impostorIndex, setImpostorIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(true);
  const [selectedWord, setSelectedWord] = useState('');
  const [allWords, setAllWords] = useState<string[]>([]);
  const [collectedVotes, setCollectedVotes] = useState<
    { player: Player; word: string }[]
  >([]);

  const currentImpostor = impostors[impostorIndex];

  // Generate the word list once on mount — the same options are shown to every impostor.
  useEffect(() => {
    if (!game.category) return;

    const currentWord = getCurrentWord();
    const randomWords: string[] = [];
    let attempts = 0;

    while (randomWords.length < 4 && attempts < 100) {
      attempts++;
      const word = getRandomWord(game.category);
      if (word && word !== currentWord && !randomWords.includes(word)) {
        randomWords.push(word);
      }
    }

    const all = [...randomWords, currentWord];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    setAllWords(all);
  }, []);

  const handleContinue = () => {
    const newVotes = [
      ...collectedVotes,
      { player: currentImpostor, word: selectedWord },
    ];

    if (impostorIndex + 1 >= impostors.length) {
      setImpostorVotes(newVotes);
      router.replace('/revealWord');
    } else {
      setCollectedVotes(newVotes);
      setImpostorIndex(impostorIndex + 1);
      setSelectedWord('');
      setModalVisible(true);
    }
  };

  function WordOption({ word }: { word: string }) {
    const isSelected = selectedWord === word;
    return (
      <TouchableOpacity
        onPress={() => setSelectedWord(word)}
        style={[
          styles.wordContainer,
          isSelected && styles.wordContainerSelected,
        ]}
      >
        <Text style={[styles.wordText, isSelected && styles.wordTextSelected]}>
          {t(word, { ns: 'categories' })}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <ScreenLayout
      style={modalVisible ? { opacity: 0.1 } : undefined}
      header={
        <View style={styles.headerContainer}>
          <Elipse top={verticalScale(-20)} left={scale(-80)} />
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t('Word vote')}</Text>
            {impostors.length > 1 && (
              <>
                <Dot color={colors.white[100]} />
                <Text style={styles.headerTitle}>
                  {t('Impostor')} {impostorIndex + 1} {t('of')}{' '}
                  {impostors.length}
                </Text>
              </>
            )}
          </View>
          <SidebarMenu />
        </View>
      }
      footer={
        <Button
          text={selectedWord ? t('Continue') : t('Vote!')}
          onPress={handleContinue}
          variants={selectedWord ? 'primary' : 'disabled'}
        />
      }
    >
      <PlayerModal
        player={currentImpostor}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />

      <View style={styles.topContainer}>
        <View style={styles.topTextContainer}>
          <Text style={styles.titleInformation}>{t('Pass device to:')}</Text>
          <Text style={styles.playerName}>{currentImpostor?.name}</Text>
          <Text style={styles.voteInstruction}>
            {t('Vote on the secret word you think is the correct one:')}
          </Text>
        </View>
        <Character mood={currentImpostor?.character} size={characterSize} />
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.allWordsContainer}>
          {allWords.map(w => (
            <WordOption key={w} word={w} />
          ))}
        </View>
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
  voteInstruction: {
    fontFamily: 'Raleway',
    fontSize: fontSize.md,
    marginTop: verticalScale(spacing.xs),
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
  allWordsContainer: {
    gap: verticalScale(spacing.sm),
  },
  wordContainer: {
    paddingVertical: verticalScale(spacing.sm),
    paddingHorizontal: scale(spacing.md),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  wordContainerSelected: {
    backgroundColor: colors.orange[200],
    borderColor: colors.orange[200],
  },
  wordText: {
    fontFamily: 'Raleway',
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.background[100],
    textAlign: 'center',
  },
  wordTextSelected: {
    color: colors.white[100],
  },
});
