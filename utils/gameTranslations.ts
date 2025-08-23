import allCategories from '@/data/categories.json';
import { Language } from '@/translations';

export const getWordByIndex = (
  category: string,
  index: number,
  language: Language
): string => {
  const categories: any = allCategories;
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
  return categories[category][language][key][index];
};

export const getRandomWordIndex = (
  category: string,
  language: Language
): { index: number; word: string } => {
  const categories: any = allCategories;
  const words = categories[category][language].content;
  const index = Math.floor(Math.random() * words.length);
  return { index, word: words[index] };
};
