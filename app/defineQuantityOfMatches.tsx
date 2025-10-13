import { useContext, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '@/components/button';
import Character from '@/components/character';
import Elipse from '@/components/elipse';
import { colors } from '@/styles/colors';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';
import { GameContext } from '@/context/GameContext';
import { router } from 'expo-router';
import WithSidebar from '@/components/withSideBar';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function DefineQuantityOfMatches() {
  const [selectQuantity, setSelectedQuantity] = useState(1);
  const { setMaximumMatches, createNewGame } = useContext(GameContext);
  const { t } = useTranslation();

  const handleContinueWithSelectedQuantity = () => {
    setMaximumMatches(selectQuantity);
    router.replace('/selectCategory');
  };

  const handleChangeQuantity = (amount: number) => {
    let newQuantity = selectQuantity + amount;
    if (newQuantity < 1) newQuantity = selectQuantity;
    if (newQuantity > 5) newQuantity = selectQuantity;

    setSelectedQuantity(newQuantity);
  };

  return (
    <WithSidebar>
      <SafeAreaView
        style={{
          backgroundColor: colors.background[100],
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Elipse top={verticalScale(-150)} />
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.pageTitle}>
                {t('How many matches will be played?')}
              </Text>
              <Text style={styles.subtitle}>
                {t('The one with most points after all matches is the winner!')}
              </Text>
            </View>
            <View style={styles.charContainer}>
              <Character mood={'luh'} />
            </View>
          </View>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => handleChangeQuantity(-1)}>
              <Entypo name="minus" size={moderateScale(40)} color={colors.orange[200]} />
            </TouchableOpacity>
            <View style={styles.quantityCardContainer}>
              <Text style={styles.quantity}>{selectQuantity}</Text>
            </View>
            <TouchableOpacity onPress={() => handleChangeQuantity(1)}>
              <FontAwesome6 name="add" size={moderateScale(40)} color={colors.orange[200]} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            text={t('Continue with this quantity')}
            onPress={handleContinueWithSelectedQuantity}
          />
        </View>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: verticalScale(30),
    textAlign: 'center',
    maxHeight: '84%',
    position: "relative"
  },
  headerContainer: {
    marginLeft: scale(20),
    marginTop: scale(35),
  },
  charContainer: {
    position: "absolute",
    top: 0,
    right: scale(-30)
  },
  pageTitle: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    maxWidth: '50%',
    marginVertical: verticalScale(0),
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontFamily: 'Raleway-Medium',
    maxWidth: '50%',
  },
  quantityContainer: {
    marginTop: verticalScale(60),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: scale(20),
    paddingHorizontal: scale(20),
  },
  quantityCardContainer: {
    width: scale(120),
    height: verticalScale(160),
    paddingVertical: verticalScale(18),
    backgroundColor: colors.orange[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(20),
    borderBottomWidth: scale(7),
    borderEndWidth: scale(7),
    borderTopWidth: scale(4),
    borderLeftWidth: scale(4),
    borderColor: 'white',
  },
  quantity: {
    fontSize: moderateScale(26),
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: verticalScale(60),
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
