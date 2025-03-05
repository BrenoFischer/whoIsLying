import { colors } from '@/styles/colors';
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar } from 'react-native';

export default function SkillUpScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Title */}
      <Text style={styles.titlePurple}>Descubra</Text>
      <Text style={styles.titleBlack}>quem está mentindo.</Text>

      {/* Illustration */}
      <Image source={require('@/assets/images/test.jpg')} style={styles.image} resizeMode="contain" />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Novo jogo</Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Todos os jogadores recebem a mesma palavra... <Text style={{ color: colors.primary[300] }}>menos um!</Text>   
      </Text>
      <Text style={styles.description}>
        Faça perguntas, analise as respostas e descubra quem é o impostor antes que ele descubra a palavra!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDE4E4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E1E1E',
  },
  menuIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    fontSize: 24,
    color: '#1E1E1E',
  },
  titlePurple: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6D40FF',
    marginTop: 50,
  },
  titleBlack: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E1E1E',
    textAlign: 'center',
  },
  image: {
    width: 280,
    height: 240,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12, // Use marginHorizontal if needed for spacing
  },
  primaryButton: {
    backgroundColor: '#2E1B47',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderColor: '#2E1B47',
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  secondaryButtonText: {
    color: '#2E1B47',
    fontSize: 16,
    fontWeight: 'bold',
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