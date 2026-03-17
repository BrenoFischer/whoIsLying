import React, { useContext, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '@/translations';
import { Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/styles/colors';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { radius } from '@/styles/radius';
import { ScrollView } from 'react-native-gesture-handler';
import { ToggleButton } from '../toggleButton';
import { spacing } from '@/styles/spacing';
import { GameContext } from '@/context/GameContext';

export default function ConfigMenu() {
  const { setNumberOfImpostors, game, setSetsOfQuestions, setRandomImpostors } =
    useContext(GameContext);
  const [menuOpened, setMenuOpened] = useState(false);
  const [impostorCount, setImpostorCount] = useState(
    game.config.numberOfImpostors
  );
  const [questionsCount, setQuestionsCount] = useState(
    game.config.setsOfQuestions
  );
  const randomImpostors = game.config.randomImpostors;

  const { t } = useTranslation();

  const toggleMenu = () => {
    setMenuOpened(!menuOpened);
  };

  const decreaseImpostors = () => {
    if (impostorCount > 1) {
      setImpostorCount(impostorCount - 1);
      setNumberOfImpostors(impostorCount - 1);
    }
  };

  const increaseImpostors = () => {
    if (impostorCount < 3) {
      setImpostorCount(impostorCount + 1);
      setNumberOfImpostors(impostorCount + 1);
    }
  };

  const increaseQuestions = () => {
    if (questionsCount < 3) {
      setQuestionsCount(questionsCount + 1);
      setSetsOfQuestions(questionsCount + 1);
    }
  };

  const decreaseQuestions = () => {
    if (questionsCount > 1) {
      setQuestionsCount(questionsCount - 1);
      setSetsOfQuestions(questionsCount - 1);
    }
  };

  return (
    <>
      <View>
        <TouchableOpacity onPress={toggleMenu} style={styles.buttonContainer}>
          <View style={styles.configSummary}>
            <View style={styles.configRow}>
              <FontAwesome
                name="user-secret"
                size={moderateScale(12)}
                color={colors.orange[200]}
              />
              {randomImpostors ? (
                <Ionicons
                  name="shuffle"
                  size={moderateScale(12)}
                  color={colors.orange[200]}
                />
              ) : (
                <Text style={styles.configValue}>
                  {game.config.numberOfImpostors}
                </Text>
              )}
            </View>
            <View style={styles.configRow}>
              <FontAwesome
                name="question"
                size={moderateScale(12)}
                color={colors.orange[200]}
              />
              <Text style={styles.configValue}>
                {game.config.setsOfQuestions}
              </Text>
            </View>
          </View>
          <Entypo name="cog" size={scale(28)} color={colors.orange[200]} />
        </TouchableOpacity>
      </View>
      <Modal transparent={false} visible={menuOpened} animationType="slide">
        <SafeAreaProvider>
          <SafeAreaView style={styles.modalContainer}>
            <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={scale(28)}
                color={colors.orange[200]}
              />
            </TouchableOpacity>

            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>
                {t('Customize game settings')}
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={{
                padding: scale(spacing.lg),
                paddingBottom: scale(40),
              }}
            >
              <Text style={styles.sectionSubtitle}>{t('Impostors')}</Text>

              <View
                style={[
                  styles.settingRow,
                  randomImpostors && styles.settingRowDisabled,
                ]}
                pointerEvents={randomImpostors ? 'none' : 'auto'}
              >
                <View style={styles.settingLabelContainer}>
                  <Ionicons
                    name="people"
                    size={scale(22)}
                    color={colors.orange[200]}
                  />
                  <Text style={styles.settingLabel}>{t('# of impostors')}</Text>
                </View>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    onPress={decreaseImpostors}
                    style={[
                      styles.counterButton,
                      impostorCount === 1 && styles.counterButtonDisabled,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.counterButtonText,
                        impostorCount === 1 && styles.counterButtonTextDisabled,
                      ]}
                    >
                      −
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.counterValueContainer}>
                    <Text style={styles.counterValue}>{impostorCount}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={increaseImpostors}
                    style={[
                      styles.counterButton,
                      impostorCount === 3 && styles.counterButtonDisabled,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.counterButtonText,
                        impostorCount === 3 && styles.counterButtonTextDisabled,
                      ]}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <Ionicons
                    name="shuffle"
                    size={scale(22)}
                    color={colors.orange[200]}
                  />
                  <Text style={styles.settingLabel}>
                    {t('Random & hidden impostors')}
                  </Text>
                </View>
                <ToggleButton
                  value={randomImpostors}
                  onValueChange={setRandomImpostors}
                />
              </View>

              <Text style={styles.sectionSubtitle}>
                {t('Sets of questions')}
              </Text>

              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <FontAwesome
                    name="question"
                    size={24}
                    color={colors.orange[200]}
                  />
                  <Text style={styles.settingLabel}>
                    {t('Questions per player')}
                  </Text>
                </View>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    onPress={decreaseQuestions}
                    style={[
                      styles.counterButton,
                      questionsCount === 1 && styles.counterButtonDisabled,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.counterButtonText,
                        questionsCount === 1 &&
                          styles.counterButtonTextDisabled,
                      ]}
                    >
                      −
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.counterValueContainer}>
                    <Text style={styles.counterValue}>{questionsCount}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={increaseQuestions}
                    style={[
                      styles.counterButton,
                      questionsCount === 3 && styles.counterButtonDisabled,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.counterButtonText,
                        questionsCount === 3 &&
                          styles.counterButtonTextDisabled,
                      ]}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    zIndex: 100,
    backgroundColor: colors.background[100],
    borderRadius: moderateScale(radius.pill),
    padding: scale(5),
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  configSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(13),
    paddingLeft: scale(4),
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
  },
  configValue: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: colors.orange[200],
  },
  closeButton: {
    zIndex: 100,
    backgroundColor: colors.background[100],
    borderRadius: moderateScale(radius.pill),
    padding: scale(5),
    alignSelf: 'flex-end',
    margin: scale(10),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background[100],
  },
  modalTitleContainer: {
    paddingBottom: verticalScale(spacing.lg),
  },
  modalTitle: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    color: colors.orange[200],
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    color: colors.gray[300],
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: verticalScale(spacing.xs),
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(spacing.md),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300] + '40',
    marginBottom: verticalScale(spacing.lg),
  },
  settingRowDisabled: {
    opacity: 0.35,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.sm),
    flex: 1,
    marginRight: scale(spacing.sm),
  },
  settingLabel: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.white[100],
    flex: 1,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.sm),
  },
  counterButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(radius.pill),
    backgroundColor: colors.orange[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  counterButtonText: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: colors.white[100],
    lineHeight: moderateScale(22),
  },
  counterButtonTextDisabled: {
    color: colors.background[100],
  },
  counterValueContainer: {
    width: scale(32),
    alignItems: 'center',
  },
  counterValue: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: colors.orange[200],
  },
});
