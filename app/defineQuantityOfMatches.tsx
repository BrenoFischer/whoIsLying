import { useContext, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
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
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';

export default function DefineQuantityOfMatches() {
  const [selectQuantity, setSelectedQuantity] = useState(1);
  const { setMaximumMatches, createNewGame } = useContext(GameContext);
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  const characterSize = height * 0.22;

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
    <ScreenLayout
      footer={
        <Button
          text={t('Continue with this quantity')}
          onPress={handleContinueWithSelectedQuantity}
        />
      }
    >
      <Elipse top={verticalScale(-150)} />

      <View style={styles.container}>
        <SidebarMenu />
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>
              {t('How many matches will be played?')}
            </Text>
            <Text style={styles.subtitle}>
              {t('The one with most points after all matches is the winner!')}
            </Text>
          </View>

          <Character mood={'luh'} size={characterSize} />
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: verticalScale(spacing.xl)
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: scale(spacing.md)
  },
  headerTextContainer: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: 'Ralway',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: 'Raleway-Medium',
  },
  quantityContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: scale(20),
    flex: 1,
  },
  quantityCardContainer: {
    width: scale(120),
    height: verticalScale(160),
    paddingVertical: verticalScale(18),
    backgroundColor: colors.orange[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(radius.lg),
    borderBottomWidth: scale(7),
    borderEndWidth: scale(7),
    borderTopWidth: scale(4),
    borderLeftWidth: scale(4),
    borderColor: 'white',
  },
  quantity: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
});
