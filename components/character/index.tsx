import { Image, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface CharacterProps {
  mood: string;
  flip?: boolean;
  size?: string;
}

export default function Character({
  mood,
  flip = false,
  size = 'large',
}: CharacterProps) {
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
    eighties: require('@/assets/images/80s.png'),
    ginger: require('@/assets/images/ginger.png'),
    bday: require('@/assets/images/bday.png'),
    highlight: require('@/assets/images/highlight.png'),
    rock: require('@/assets/images/rock.png'),
    surfer: require('@/assets/images/surfer.png'),
    ber: require('@/assets/images/ber.png'),
    slide1: require('@/assets/images/slides/slide1.png'),
    slide2: require('@/assets/images/slides/slide2.png'),
    slide3: require('@/assets/images/slides/slide3.png'),
    slide4: require('@/assets/images/slides/slide4.png'),
    slide5: require('@/assets/images/slides/slide5.png'),
    slide6: require('@/assets/images/slides/slide6.png'),
    slide7: require('@/assets/images/slides/slide7.png'),
  };

  return (
    <Image
      source={characterImages[mood as keyof typeof characterImages]}
      style={[
        styles.image,
        flip && { transform: [{ scaleX: -1 }] },
        size === 'small' && { height: scale(120), width: scale(120) },
        size === 'medium' && { height: scale(150), width: scale(150) }
      ]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    height: scale(180),
    width: scale(180),
  },
});
