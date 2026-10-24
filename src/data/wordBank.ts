import { CEFRLevel, WordEntry } from '../types';
import { WORDS_A1 } from './wordsA1';
import { WORDS_A2 } from './wordsA2';
import { WORDS_B1 } from './wordsB1';
import { WORDS_B2 } from './wordsB2';
import { WORDS_C1 } from './wordsC1';
import { WORDS_C2 } from './wordsC2';

export const ALL_WORDS_BY_LEVEL: Record<CEFRLevel, WordEntry[]> = {
  A1: WORDS_A1,
  A2: WORDS_A2,
  B1: WORDS_B1,
  B2: WORDS_B2,
  C1: WORDS_C1,
  C2: WORDS_C2,
};

// Global word dictionary by ID
const WORD_MAP: Map<string, WordEntry> = new Map();
const ALL_WORDS_LIST: WordEntry[] = [
  ...WORDS_A1,
  ...WORDS_A2,
  ...WORDS_B1,
  ...WORDS_B2,
  ...WORDS_C1,
  ...WORDS_C2,
];

ALL_WORDS_LIST.forEach((w) => {
  WORD_MAP.set(w.id, w);
  // Also index by word string for easy lookups
  WORD_MAP.set(w.word, w);
});

export function getWordById(idOrWord: string): WordEntry | undefined {
  return WORD_MAP.get(idOrWord) || WORD_MAP.get(idOrWord.toUpperCase());
}

export function getWordsForLevel(level: CEFRLevel): WordEntry[] {
  return ALL_WORDS_BY_LEVEL[level] || WORDS_A1;
}

export function getAllWords(): WordEntry[] {
  return ALL_WORDS_LIST;
}
