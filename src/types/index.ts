export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface WordEntry {
  id: string;
  word: string; // Uppercase English word
  clue: string; // English clue / definition
  spanish: string; // Spanish translation & hint
  example: string; // Context sentence
  level: CEFRLevel;
  category?: string;
}

export type Direction = 'across' | 'down';

export interface PlacedWord {
  id: string;
  word: string;
  clue: string;
  spanish: string;
  example: string;
  row: number; // 0-indexed top-left
  col: number;
  direction: Direction;
  number: number; // Crossword clue index (1, 2, 3...)
}

export interface CrosswordCell {
  row: number;
  col: number;
  char: string; // Correct letter
  number?: number; // Starting cell clue number
  acrossWordId?: string;
  downWordId?: string;
  acrossNumber?: number;
  downNumber?: number;
}

export interface PuzzleData {
  id: number;
  level: CEFRLevel;
  levelName: string;
  subLevelIndex: number; // 1 to 200 within level
  title: string;
  width: number;
  height: number;
  words: PlacedWord[];
  grid: (CrosswordCell | null)[][];
}

export interface SolvedPuzzleRecord {
  stars: number;
  hintsUsed: number;
  timeSecs: number;
  completedAt: string;
}

export interface UserProgress {
  solvedPuzzles: Record<number, SolvedPuzzleRecord>;
  currentPuzzleId: number;
  coins: number;
  streak: number;
  lastPlayedDate: string; // YYYY-MM-DD
  learnedWords: string[]; // list of word IDs
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  inProgressGrids: Record<number, Record<string, string>>; // puzzleId -> "row,col": letter
}

export interface LevelInfo {
  level: CEFRLevel;
  name: string;
  subtitle: string;
  color: string;
  accentColor: string;
  bgGradient: string;
  range: [number, number];
  description: string;
}
