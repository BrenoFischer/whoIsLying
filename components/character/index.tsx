import { Image } from 'react-native';

interface CharacterProps {
  mood: string;
  flip?: boolean;
  size?: number;
}

export default function Character({
  mood,
  flip = false,
  size = 180,
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
    diana: require('@/assets/images/diana.png'),
    frank: require('@/assets/images/frank.png'),
    frankFemale: require('@/assets/images/frankFemale.png'),
    pumpkinMale: require('@/assets/images/pumpkinMale.png'),
    pumpkinFemale: require('@/assets/images/pumpkinFemale.png'),
    skeleton: require('@/assets/images/skeleton.png'),
    skeletonFem: require('@/assets/images/skeletonFem.png'),
    ghost: require('@/assets/images/ghost.png'),
    werewolf: require('@/assets/images/werewolf.png'),
    werewolfFem: require('@/assets/images/werewolfFem.png'),
    puca: require('@/assets/images/puca.png'),
  };

  return (
    <Image
      source={characterImages[mood as keyof typeof characterImages]}
      style={[
        {
          width: size ?? '100%',
          height: size ?? '100%',
        },
        flip && { transform: [{ scaleX: -1 }] },
      ]}
      resizeMode="contain"
    />
  );
}
