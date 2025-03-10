import { colors } from '@/styles/colors';
import React from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import Button from '../../components/button';

export default function SkillUpScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Title 
      <Text style={styles.titlePurple}>Quem</Text>
      <Text style={styles.titleBlack}>está mentindo.</Text>
      */}

      {/* Illustration */}
      <Image source={require('@/assets/images/logo2.png')} style={styles.image} resizeMode="contain" />

      {/* Buttons */}
      <Button text="Novo Jogo"/>

      {/* Description 
      <Text style={styles.description}>
        Todos os jogadores recebem a mesma palavra... <Text style={{ color: colors.primary[300] }}>menos um!</Text>   
      </Text>
      <Text style={styles.description}>
        Faça perguntas, analise as respostas e descubra quem é o impostor antes que ele descubra a palavra!
      </Text>
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pink[100],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titlePurple: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.purple[100],
    marginTop: 50,
  },
  titleBlack: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.white[100],
    textAlign: 'center',
  },
  image: {
    width: 350,
    height: 300,
  },
  description: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    color: '#1E1E1E',
    opacity: 0.8,
    paddingHorizontal: 10,
  },
});