import { Image, StyleSheet } from 'react-native';

interface CharacterProps {
  mood: string;
  flip?: boolean;
  size?: string;
}

export default function Character({ mood, flip = false, size = 'large' }: CharacterProps) {
  const characterImages = {
    paola: require('@/assets/images/paola.png'),
    breno: require('@/assets/images/breno.png'),
    umpa: require('@/assets/images/umpa.png'),
    bothCharacter: require('@/assets/images/bothCharacter.png'),
    risada: require('@/assets/images/risada.png'),
    sara: require('@/assets/images/sara.png'),
    luh: require('@/assets/images/luh.png'),
    fabricin: require('@/assets/images/fabricin.png'),
    gabs: require('@/assets/images/gabs.png'),
    pedro: require('@/assets/images/pedro.png'),
    pri: require('@/assets/images/pri.png'),
    gio: require('@/assets/images/gio.png'),
    ginger: require('@/assets/images/ginger.png'),
  };

  return (
    <Image
      source={characterImages[mood as keyof typeof characterImages]}
      style={[styles.image, flip && { transform: [{ scaleX: -1 }] }, size === 'small' && { height: 120, width: 120 }]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    height: 200,
    width: 200,
  },
});
