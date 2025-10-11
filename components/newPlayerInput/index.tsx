import { useState } from 'react';
import {
  TouchableOpacity,
  View,
  TextInput,
  Text,
  StyleSheet,
} from 'react-native';
import uuid from 'react-native-uuid';
import Ionicons from '@expo/vector-icons/Ionicons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import { useTranslation } from '@/translations';

interface NewPlayerInputProps {
  setPlayer: ({ id, name }: Player) => void;
  disabled: boolean;
  currentPlayerGender: string;
}

export default function NewPlayerInput({
  setPlayer,
  disabled,
  currentPlayerGender,
}: NewPlayerInputProps) {
  const [newName, setNewName] = useState('');
  const [inputError, setInputError] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = () => {
    if (newName.length < 1) {
      setInputError(true);
      return;
    }
    setInputError(false);
    const id = uuid.v4();
    setPlayer({
      id,
      name: newName,
      gender: currentPlayerGender,
      character: '',
      score: 0,
    });
    setNewName('');
  };

  const handleOnFocus = () => {
    setInputError(false);
  };

  const borderColor = disabled
    ? colors.gray[100]
    : inputError
      ? colors.red[100]
      : colors.orange[200];

  return (
    <>
      <View style={[styles.container, { borderColor }]}>
        <TextInput
          placeholder={t('Add a new name')}
          placeholderTextColor={colors.orange[200]}
          keyboardType="ascii-capable"
          inputMode="text"
          maxLength={10}
          style={styles.textInput}
          value={newName}
          onChangeText={text => setNewName(text)}
          onSubmitEditing={handleSubmit}
          onFocus={handleOnFocus}
          returnKeyType="done"
          editable={!disabled}
        />
        <TouchableOpacity style={styles.iconContainer} onPress={handleSubmit}>
          <Ionicons name="add-circle" size={38} color={borderColor} />
        </TouchableOpacity>
      </View>
      {inputError && (
        <Text style={styles.error}>
          {t('A name should contain at least 1 character.')}
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    maxWidth: scale(280),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: scale(2),
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    backgroundColor: colors.background[100],
  },
  textInput: {
    flex: 1,
    paddingVertical: verticalScale(18),
    marginLeft: scale(15),
    marginRight: scale(50),
    fontSize: moderateScale(15),
    color: colors.white[100],
  },
  iconContainer: {
    position: 'absolute',
    right: scale(10),
  },
  error: {
    color: colors.red[100],
    marginTop: verticalScale(10),
  },
});
