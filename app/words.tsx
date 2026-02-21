import Button from '@/components/button';
import Character from '@/components/character';
import PlayerModal from '@/components/playerModal';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from '@/translations';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import ScreenLayout from '@/components/screenLayout';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';

export default function Words() {
  const [modalVisible, setModalVisible] = useState(true);
  const [newSelectedWord, setNewSelectedWord] = useState('');
  const [allWords, setAllWords] = useState<string[]>([]);
  const { game, getRandomWord, setSelectedWord, getCurrentWord, setCurrentScreen } =
    useContext(GameContext);
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  const characterSize = height * 0.22;

  useEffect(() => {
    setCurrentScreen('/words');
  }, []);

  const impostorPlayer = game.lyingPlayer;

  const getRandomWords = (): string[] => {
    let i = 0;
    const randomWords = [];
    const currentWord = getCurrentWord();

    while (i < 4) {
      const word = getRandomWord(game.category!);
      if (word !== currentWord) {
        let wordNotAlreadySelected = true;
        for (let j = 0; j < randomWords.length; j++) {
          if (randomWords[j] === word) {
            wordNotAlreadySelected = false;
          }
        }
        if (wordNotAlreadySelected) {
          randomWords.push(word);
          i += 1;
        }
      }
    }

    return randomWords;
  };

  const addWordAndShuffle = (words: string[]) => {
    const currentWord = getCurrentWord();
    words.push(currentWord);
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words;
  };

  const handleContinue = () => {
    setSelectedWord(newSelectedWord);
    setAllWords([]);
    router.replace('/revealWord');
  };

  useEffect(() => {
    if (game.category) {
      const randomWords = getRandomWords();
      const words = addWordAndShuffle(randomWords);
      setAllWords(words);
    }
  }, [game.category]);

  function WordVoteOption({ word }: { word: string }) {
    const isWordSelected = newSelectedWord === word;
    return (
      <TouchableOpacity
        onPress={() => setNewSelectedWord(word)}
        style={[styles.wordContainer, isWordSelected && styles.wordContainerSelected]}
      >
        <Text style={styles.wordOption}>{t(word, { ns: 'categories' })}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <ScreenLayout
      scrollable
      style={modalVisible ? { opacity: 0.1 } : undefined}
      footer={
        <Button
          text={t('Vote!')}
          onPress={handleContinue}
          variants={newSelectedWord ? 'primary' : 'disabled'}
        />
      }
    >
      <PlayerModal
        player={impostorPlayer}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />

      <View style={styles.topContainer}>
        <Character mood={impostorPlayer.character} size={characterSize} />
      </View>

      <View style={styles.tableContainer}>
        <Text style={styles.playerNameOnTable}>
          {impostorPlayer.name},{' '}
          <Text style={styles.tableText}>
            {t('vote on the secret word you think is the correct one:')}
          </Text>
        </Text>
        <View style={styles.allWordsContainer}>
          {allWords.map(w => (
            <WordVoteOption key={w} word={w} />
          ))}
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(spacing.lg),
  },
  tableContainer: {
    marginHorizontal: scale(spacing.md),
    marginTop: verticalScale(spacing.lg),
    padding: scale(spacing.md),
    backgroundColor: colors.white[100],
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: scale(spacing.sm),
    elevation: 5,
  },
  tableText: {
    fontSize: fontSize.md,
    fontFamily: 'Raleway',
    color: colors.black[100],
    fontWeight: 'normal',
  },
  playerNameOnTable: {
    fontFamily: 'Raleway',
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  allWordsContainer: {
    marginTop: verticalScale(spacing.lg),
    gap: verticalScale(spacing.sm),
  },
  wordContainer: {
    width: '100%',
    alignItems: 'center',
    borderWidth: scale(2),
    borderRadius: radius.md,
    borderColor: colors.orange[200],
    paddingHorizontal: scale(spacing.md),
    paddingVertical: verticalScale(spacing.sm),
    backgroundColor: colors.white[100],
  },
  wordContainerSelected: {
    backgroundColor: colors.orange[200],
  },
  wordOption: {
    fontFamily: 'Raleway',
    fontSize: fontSize.md,
    color: colors.black[100],
  },
});
