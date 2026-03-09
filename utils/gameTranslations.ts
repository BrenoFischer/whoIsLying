import allCategories from '@/data/categories.json';

export const getWordByIndex = (
  category: string,
  index: number,
): string => {
  const categories: any = allCategories;

  if (!categories[category]?.content) {
    throw new Error(
      `Content not found for category "${category}"`
    );
  }

  return categories[category].content[index];
};

export const getRandomWordIndex = (
  category: string,
): { index: number; word: string } => {
  const categories: any = allCategories;

  if (!categories[category]) {
    throw new Error(`Category "${category}" not found`);
  }

  if (!categories[category].content) {
    throw new Error(
      `Content not found for category "${category}"`
    );
  }

  const words = categories[category].content;
  const index = Math.floor(Math.random() * words.length);
  return { index, word: words[index] };
};
