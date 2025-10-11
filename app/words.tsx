import Button from '@/components/button';
import Character from '@/components/character';
import PlayerModal from '@/components/playerModal';
import WithSidebar from '@/components/withSideBar';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from '@/translations';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function Words() {
  const [modalVisible, setModalVisible] = useState(true);
  const [newSelectedWord, setNewSelectedWord] = useState('');
  const [allWords, setAllWords] = useState<string[]>([]);
  const { game, getRandomWord, setSelectedWord, getCurrentWord } =
    useContext(GameContext);
  const { language, t } = useTranslation();

  const impostorPlayer = game.lyingPlayer;

  const getRandomWords = (): string[] => {
    let i = 0;
    const randomWords = [];
    const currentWord = getCurrentWord(language);

    while (i < 4) {
      const word = getRandomWord(game.category!, language);
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
    const currentWord = getCurrentWord(language);
    words.push(currentWord);
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]]; // Swap elements
    }
    return words;
  };

  const handleSelectWord = (word: string) => {
    setNewSelectedWord(word);
  };

  function WordVoteOption({ word }: { word: string }) {
    const isWordSelected = newSelectedWord === word;

    return (
      <TouchableOpacity
        onPress={() => handleSelectWord(word)}
        style={[
          styles.wordContainer,
          isWordSelected && { backgroundColor: colors.orange[200] },
        ]}
      >
        <Text style={styles.wordOption}>{word}</Text>
      </TouchableOpacity>
    );
  }

  const handleContinue = () => {
    setSelectedWord(newSelectedWord);
    setAllWords([]);
    router.push('/revealWord');
  };

  useEffect(() => {
    if (game.category && language) {
      const randomWords = getRandomWords();
      const words = addWordAndShuffle(randomWords);

      setAllWords(words);
    }
  }, [language, game.category]);

  return (
    <WithSidebar>
      <SafeAreaView
        style={[
          {
            backgroundColor: colors.background[100],
            overflow: 'hidden',
            flex: 1,
          },
          modalVisible && { opacity: 0.1 },
        ]}
      >
        <PlayerModal
          player={impostorPlayer}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
        <View style={styles.topContainer}>
          <Character mood={impostorPlayer.character} size='medium' />
        </View>
        <View style={styles.tableContainer}>
          <ScrollView style={styles.table}>
            <Text style={styles.playerNameOnTable}>
              {impostorPlayer.name},{' '}
              <Text style={styles.tableText}>
                {t('vote on the secret word you think is the correct one:')}
              </Text>
            </Text>
            <View style={styles.allWordsContainer}>
              {allWords.map(w => {
                return <WordVoteOption key={w} word={w} />;
              })}
            </View>
          </ScrollView>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            text={t('Vote!')}
            onPress={handleContinue}
            variants={newSelectedWord ? 'primary' : 'disabled'}
          />
        </View>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    marginTop: verticalScale(40),
  },
  tableText: {
    fontSize: moderateScale(16),
    fontFamily: 'Raleway',
    color: colors.black[100],
  },
  playerNameOnTable: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  tableContainer: {
    maxHeight: '60%',
    marginHorizontal: scale(15),
    flexShrink: 1,
  },
  table: {
    padding: scale(15),
    backgroundColor: colors.white[100],
    borderRadius: moderateScale(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(8),
    elevation: 5,
  },
  allWordsContainer: {
    marginVertical: verticalScale(10),
    gap: verticalScale(10),
  },
  wordContainer: {
    width: "100%",
    alignItems: 'center',
    borderWidth: scale(2),
    borderRadius: moderateScale(10),
    borderColor: colors.orange[200],
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(9),
    backgroundColor: colors.white[100],
  },
  wordOption: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(15),
    color: colors.black[200],
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
});
