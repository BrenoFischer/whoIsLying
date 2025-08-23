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
        <Elipse top={-90} />
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
            <Character mood={'luh'} />
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
    paddingVertical: 50,
    textAlign: 'center',
    maxHeight: '84%',
  },
  headerContainer: {
    marginLeft: 30,
    flexDirection: 'row',
  },
  pageTitle: {
    fontFamily: 'Ralway',
    fontSize: 30,
    fontWeight: 'bold',
    maxWidth: 200,
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    maxWidth: 190,
  },
  quantityContainer: {
    marginTop: 80,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 30,
  },
  quantityCardContainer: {
    width: 150,
    height: 200,
    paddingVertical: 22,
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
    fontSize: 30,
    fontWeight: 'bold',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
