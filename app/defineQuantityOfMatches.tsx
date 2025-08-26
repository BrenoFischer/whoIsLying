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
        <Elipse top={-150} />
        <ScrollView style={styles.container}>
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
              <Entypo name="minus" size={40} color={colors.orange[200]} />
            </TouchableOpacity>
            <View style={styles.quantityCardContainer}>
              <Text style={styles.quantity}>{selectQuantity}</Text>
            </View>
            <TouchableOpacity onPress={() => handleChangeQuantity(1)}>
              <FontAwesome6 name="add" size={40} color={colors.orange[200]} />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    paddingVertical: 30,
    textAlign: 'center',
    maxHeight: '84%',
    position: "relative"
  },
  headerContainer: {
    marginLeft: 20,
  },
  charContainer: {
    position: "absolute",
    top: 0,
    right: -30
  },
  pageTitle: {
    fontFamily: 'Ralway',
    fontSize: 26,
    fontWeight: 'bold',
    maxWidth: '50%',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
    maxWidth: '50%',
  },
  quantityContainer: {
    marginTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 20,
  },
  quantityCardContainer: {
    width: 120,
    height: 160,
    paddingVertical: 18,
    backgroundColor: colors.orange[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderBottomWidth: 7,
    borderEndWidth: 7,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'white',
  },
  quantity: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
