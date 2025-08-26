import allCategories from '@/data/categories.json';
import { Language } from '@/translations';

export const getWordByIndex = (
  category: string,
  index: number,
  language: Language
): string => {
  const categories: any = allCategories;

  if (!categories[category]?.[language]?.content) {
    throw new Error(
      `Content not found for category "${category}" and language "${language}"`
    );
  }

  return categories[category][language].content[index];
};

export const getQuestionByIndex = (
  category: string,
  questionSet: 'first' | 'second',
  index: number,
  language: Language
): string => {
  const categories: any = allCategories;
  const key =
    questionSet === 'first' ? 'firstSetOfQuestions' : 'secondSetOfQuestions';

  if (!categories[category]?.[language]?.[key]) {
    throw new Error(
      `Questions not found for category "${category}", language "${language}", and question set "${questionSet}"`
    );
  }

  return categories[category][language][key][index];
};

export const getRandomWordIndex = (
  category: string,
  language: Language
): { index: number; word: string } => {
  const categories: any = allCategories;

  if (!categories[category]) {
    throw new Error(`Category "${category}" not found`);
  }

  if (!categories[category][language]) {
    throw new Error(
      `Language "${language}" not found for category "${category}"`
    );
  }

  if (!categories[category][language].content) {
    throw new Error(
      `Content not found for category "${category}" and language "${language}"`
    );
  }

  const words = categories[category][language].content;
  const index = Math.floor(Math.random() * words.length);
  return { index, word: words[index] };
};
