import { CEFRLevel, SolvedPuzzleRecord, UserProgress } from '../types';

const STORAGE_KEY = 'crosspath_progress_v1';

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function calculateStreak(lastDate: string, currentStreak: number): number {
  if (!lastDate) return 1;
  const today = getTodayString();
  if (lastDate === today) return currentStreak || 1;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (lastDate === yStr) {
    return (currentStreak || 0) + 1;
  }
  // Missed more than a day
  return 1;
}

export const DEFAULT_PROGRESS: UserProgress = {
  solvedPuzzles: {},
  currentPuzzleId: 1,
  coins: 60,
  streak: 1,
  lastPlayedDate: getTodayString(),
  learnedWords: [],
  theme: 'light',
  soundEnabled: true,
  inProgressGrids: {},
};

export function loadUserProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<UserProgress>;

    const today = getTodayString();
    const streak = calculateStreak(parsed.lastPlayedDate || '', parsed.streak || 1);

    return {
      solvedPuzzles: parsed.solvedPuzzles || {},
      currentPuzzleId: parsed.currentPuzzleId || 1,
      coins: typeof parsed.coins === 'number' ? parsed.coins : 60,
      streak,
      lastPlayedDate: today,
      learnedWords: parsed.learnedWords || [],
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      soundEnabled: parsed.soundEnabled !== false,
      inProgressGrids: parsed.inProgressGrids || {},
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // quota exceeded or private mode
  }
}

export function completePuzzleRecord(
  prev: UserProgress,
  puzzleId: number,
  stars: number,
  hintsUsed: number,
  timeSecs: number,
  wordIds: string[]
): { nextProgress: UserProgress; coinsEarned: number } {
  const isFirstTime = !prev.solvedPuzzles[puzzleId];
  const prevRecord = prev.solvedPuzzles[puzzleId];
  const bestStars = Math.max(stars, prevRecord?.stars || 0);

  // Coin reward
  let coinsEarned = 0;
  if (isFirstTime) {
    coinsEarned = 20 + stars * 5; // e.g. 35 coins for 3 stars
  } else {
    coinsEarned = 5; // replay nominal reward
  }

  const updatedRecord: SolvedPuzzleRecord = {
    stars: bestStars,
    hintsUsed,
    timeSecs: prevRecord ? Math.min(timeSecs, prevRecord.timeSecs) : timeSecs,
    completedAt: new Date().toISOString(),
  };

  const newSolved = {
    ...prev.solvedPuzzles,
    [puzzleId]: updatedRecord,
  };

  // Advance current puzzle ID if completing current or later
  let nextPuzzleId = prev.currentPuzzleId;
  if (puzzleId >= prev.currentPuzzleId && puzzleId < 1200) {
    nextPuzzleId = puzzleId + 1;
  }

  // Merge learned words
  const learnedSet = new Set(prev.learnedWords);
  wordIds.forEach((w) => learnedSet.add(w));

  // Remove saved in-progress grid for solved puzzle
  const newInProgress = { ...prev.inProgressGrids };
  delete newInProgress[puzzleId];

  const nextProgress: UserProgress = {
    ...prev,
    solvedPuzzles: newSolved,
    currentPuzzleId: nextPuzzleId,
    coins: prev.coins + coinsEarned,
    lastPlayedDate: getTodayString(),
    learnedWords: Array.from(learnedSet),
    inProgressGrids: newInProgress,
  };

  saveUserProgress(nextProgress);
  return { nextProgress, coinsEarned };
}

export function applyPlacementLevel(prev: UserProgress, targetLevel: CEFRLevel): UserProgress {
  const levelStarts: Record<CEFRLevel, number> = {
    A1: 1,
    A2: 201,
    B1: 401,
    B2: 601,
    C1: 801,
    C2: 1001,
  };

  const targetId = levelStarts[targetLevel] || 1;
  const newSolved = { ...prev.solvedPuzzles };

  // Mark all preceding puzzles as unlocked/solved with 2 stars if not already solved
  for (let i = 1; i < targetId; i++) {
    if (!newSolved[i]) {
      newSolved[i] = {
        stars: 2,
        hintsUsed: 0,
        timeSecs: 90,
        completedAt: new Date().toISOString(),
      };
    }
  }

  const next: UserProgress = {
    ...prev,
    currentPuzzleId: Math.max(prev.currentPuzzleId, targetId),
    solvedPuzzles: newSolved,
  };

  saveUserProgress(next);
  return next;
}
