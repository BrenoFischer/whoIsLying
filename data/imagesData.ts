export type CharacterTheme = 'male' | 'female' | 'halloween' | 'music';

export type CharacterData = {
  name: string;
  theme: CharacterTheme;
};

export const characters: CharacterData[] = [
  { name: 'breno', theme: 'male' },
  { name: 'umpa', theme: 'male' },
  { name: 'risada', theme: 'male' },
  { name: 'fabricin', theme: 'male' },
  { name: 'gabs', theme: 'male' },
  { name: 'pedro', theme: 'male' },
  { name: 'bday', theme: 'male' },
  { name: 'surfer', theme: 'male' },
  { name: 'ber', theme: 'male' },
  { name: 'paola', theme: 'female' },
  { name: 'sara', theme: 'female' },
  { name: 'luh', theme: 'female' },
  { name: 'pri', theme: 'female' },
  { name: 'gio', theme: 'female' },
  { name: 'ginger', theme: 'female' },
  { name: 'highlight', theme: 'female' },
  { name: 'rock', theme: 'music' },
  { name: 'eighties', theme: 'music' },
  { name: 'diana', theme: 'female' },
  { name: 'pumpkinMale', theme: 'halloween' },
  { name: 'pumpkinFemale', theme: 'halloween' },
  { name: 'frank', theme: 'halloween' },
  { name: 'frankFemale', theme: 'halloween' },
];

export const themes: CharacterTheme[] = ['male', 'female', 'halloween', 'music'];

export const charactersByTheme = (theme: CharacterTheme): CharacterData[] =>
  characters.filter(c => c.theme === theme);

export const characterNames = characters.map(c => c.name);
