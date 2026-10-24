import { CEFRLevel, CrosswordCell, Direction, PlacedWord, PuzzleData, WordEntry } from '../types';
import { getLevelForPuzzleId, LEVEL_CONFIGS } from '../data/levels';
import { getWordsForLevel } from '../data/wordBank';

// Mulberry32 deterministic PRNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface TempPlacedWord {
  entry: WordEntry;
  word: string;
  row: number;
  col: number;
  direction: Direction;
}

export function generatePuzzle(puzzleId: number): PuzzleData {
  const levelInfo = getLevelForPuzzleId(puzzleId);
  const level = levelInfo.level;
  const subLevelIndex = ((puzzleId - 1) % 200) + 1; // 1 to 200
  const rng = mulberry32(puzzleId * 1664525 + 1013904223);

  // Target word count based on level and sub-progression
  let baseCount = 4;
  if (level === 'A1') baseCount = 4 + Math.floor((subLevelIndex - 1) / 50); // 4 to 7
  else if (level === 'A2') baseCount = 5 + Math.floor((subLevelIndex - 1) / 40); // 5 to 9
  else if (level === 'B1') baseCount = 6 + Math.floor((subLevelIndex - 1) / 35); // 6 to 11
  else if (level === 'B2') baseCount = 7 + Math.floor((subLevelIndex - 1) / 30); // 7 to 13
  else if (level === 'C1') baseCount = 8 + Math.floor((subLevelIndex - 1) / 28); // 8 to 14
  else if (level === 'C2') baseCount = 9 + Math.floor((subLevelIndex - 1) / 25); // 9 to 16

  const wordsPool = [...getWordsForLevel(level)];

  // Deterministically shuffle word bank
  for (let i = wordsPool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [wordsPool[i], wordsPool[j]] = [wordsPool[j], wordsPool[i]];
  }

  // Virtual board (offset coordinate space centered at 50,50)
  const BOARD_SIZE = 100;
  const CENTER = 50;
  const board: (string | null)[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null)
  );

  const placedWords: TempPlacedWord[] = [];

  // 1. Place the first anchor word horizontally at center
  const firstEntry = wordsPool[0];
  const startCol = CENTER - Math.floor(firstEntry.word.length / 2);
  const startRow = CENTER;

  for (let i = 0; i < firstEntry.word.length; i++) {
    board[startRow][startCol + i] = firstEntry.word[i];
  }
  placedWords.push({
    entry: firstEntry,
    word: firstEntry.word,
    row: startRow,
    col: startCol,
    direction: 'across',
  });

  // Helper: check if a word can be placed legally
  function canPlace(
    word: string,
    row: number,
    col: number,
    direction: Direction
  ): { valid: boolean; intersections: number } {
    let intersections = 0;
    const len = word.length;

    // Boundary check
    if (direction === 'across') {
      if (col < 2 || col + len >= BOARD_SIZE - 2 || row < 2 || row >= BOARD_SIZE - 2) return { valid: false, intersections: 0 };
      // Check cell before and after the word (must be empty)
      if (board[row][col - 1] !== null || board[row][col + len] !== null) return { valid: false, intersections: 0 };

      for (let i = 0; i < len; i++) {
        const c = col + i;
        const current = board[row][c];
        const letter = word[i];

        if (current !== null) {
          if (current !== letter) return { valid: false, intersections: 0 };
          intersections++;
        } else {
          // Parallel neighbor checks (above and below cannot have letters unless it's an intersecting cell)
          if (board[row - 1][c] !== null || board[row + 1][c] !== null) {
            return { valid: false, intersections: 0 };
          }
        }
      }
    } else {
      // down
      if (row < 2 || row + len >= BOARD_SIZE - 2 || col < 2 || col >= BOARD_SIZE - 2) return { valid: false, intersections: 0 };
      // Check cell before and after the word (must be empty)
      if (board[row - 1][col] !== null || board[row + len][col] !== null) return { valid: false, intersections: 0 };

      for (let i = 0; i < len; i++) {
        const r = row + i;
        const current = board[r][col];
        const letter = word[i];

        if (current !== null) {
          if (current !== letter) return { valid: false, intersections: 0 };
          intersections++;
        } else {
          // Parallel neighbor checks (left and right cannot have letters unless it's an intersecting cell)
          if (board[r][col - 1] !== null || board[r][col + 1] !== null) {
            return { valid: false, intersections: 0 };
          }
        }
      }
    }

    // Must intersect at least once
    if (intersections < 1) return { valid: false, intersections: 0 };

    return { valid: true, intersections };
  }

  // 2. Iterate through candidate words to intersect
  for (let w = 1; w < wordsPool.length && placedWords.length < baseCount; w++) {
    const candidate = wordsPool[w];
    if (placedWords.some((pw) => pw.word === candidate.word)) continue;

    let bestPlacement: { row: number; col: number; direction: Direction; intersections: number } | null = null;
    let maxIntersections = 0;

    // Search against all already placed words
    for (const placed of placedWords) {
      const targetDir: Direction = placed.direction === 'across' ? 'down' : 'across';

      for (let ci = 0; ci < candidate.word.length; ci++) {
        const candidateLetter = candidate.word[ci];

        for (let pi = 0; pi < placed.word.length; pi++) {
          if (placed.word[pi] === candidateLetter) {
            let tryRow: number;
            let tryCol: number;

            if (targetDir === 'down') {
              // Placed is across: candidate goes down
              tryRow = placed.row - ci;
              tryCol = placed.col + pi;
            } else {
              // Placed is down: candidate goes across
              tryRow = placed.row + pi;
              tryCol = placed.col - ci;
            }

            const check = canPlace(candidate.word, tryRow, tryCol, targetDir);
            if (check.valid && check.intersections > maxIntersections) {
              maxIntersections = check.intersections;
              bestPlacement = {
                row: tryRow,
                col: tryCol,
                direction: targetDir,
                intersections: check.intersections,
              };
            }
          }
        }
      }
    }

    if (bestPlacement) {
      // Place the word on the board
      const len = candidate.word.length;
      if (bestPlacement.direction === 'across') {
        for (let i = 0; i < len; i++) {
          board[bestPlacement.row][bestPlacement.col + i] = candidate.word[i];
        }
      } else {
        for (let i = 0; i < len; i++) {
          board[bestPlacement.row + i][bestPlacement.col] = candidate.word[i];
        }
      }

      placedWords.push({
        entry: candidate,
        word: candidate.word,
        row: bestPlacement.row,
        col: bestPlacement.col,
        direction: bestPlacement.direction,
      });
    }
  }

  // 3. Calculate bounding box of placed words
  let minRow = BOARD_SIZE;
  let maxRow = 0;
  let minCol = BOARD_SIZE;
  let maxCol = 0;

  for (const pw of placedWords) {
    minRow = Math.min(minRow, pw.row);
    minCol = Math.min(minCol, pw.col);
    if (pw.direction === 'across') {
      maxRow = Math.max(maxRow, pw.row);
      maxCol = Math.max(maxCol, pw.col + pw.word.length - 1);
    } else {
      maxRow = Math.max(maxRow, pw.row + pw.word.length - 1);
      maxCol = Math.max(maxCol, pw.col);
    }
  }

  const height = maxRow - minRow + 1;
  const width = maxCol - minCol + 1;

  // 4. Normalize coordinates (offset so minRow=0, minCol=0)
  const normalizedWords = placedWords.map((pw) => ({
    ...pw,
    row: pw.row - minRow,
    col: pw.col - minCol,
  }));

  // 5. Create final grid and assign standard crossword clue numbering
  const grid: (CrosswordCell | null)[][] = Array.from({ length: height }, () =>
    Array(width).fill(null)
  );

  // Fill letters
  for (const pw of normalizedWords) {
    for (let i = 0; i < pw.word.length; i++) {
      const r = pw.direction === 'across' ? pw.row : pw.row + i;
      const c = pw.direction === 'across' ? pw.col + i : pw.col;
      if (!grid[r][c]) {
        grid[r][c] = {
          row: r,
          col: c,
          char: pw.word[i],
        };
      }
    }
  }

  // Standard crossword clue numbering: scan rows top-to-bottom, cols left-to-right
  let clueIndex = 1;
  const placedWordsFinal: PlacedWord[] = [];

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (!grid[r][c]) continue;

      const acrossWord = normalizedWords.find((w) => w.direction === 'across' && w.row === r && w.col === c);
      const downWord = normalizedWords.find((w) => w.direction === 'down' && w.row === r && w.col === c);

      let numberedThisCell = false;
      const currentNumber = clueIndex;

      if (acrossWord) {
        grid[r][c]!.number = currentNumber;
        grid[r][c]!.acrossNumber = currentNumber;
        grid[r][c]!.acrossWordId = acrossWord.entry.id;
        numberedThisCell = true;
        placedWordsFinal.push({
          id: acrossWord.entry.id,
          word: acrossWord.word,
          clue: acrossWord.entry.clue,
          spanish: acrossWord.entry.spanish,
          example: acrossWord.entry.example,
          row: r,
          col: c,
          direction: 'across',
          number: currentNumber,
        });
      }

      if (downWord) {
        grid[r][c]!.number = currentNumber;
        grid[r][c]!.downNumber = currentNumber;
        grid[r][c]!.downWordId = downWord.entry.id;
        numberedThisCell = true;
        placedWordsFinal.push({
          id: downWord.entry.id,
          word: downWord.word,
          clue: downWord.entry.clue,
          spanish: downWord.entry.spanish,
          example: downWord.entry.example,
          row: r,
          col: c,
          direction: 'down',
          number: currentNumber,
        });
      }

      if (numberedThisCell) {
        clueIndex++;
      }
    }
  }

  // Populate acrossWordId / downWordId for non-start cells
  for (const pw of placedWordsFinal) {
    for (let i = 0; i < pw.word.length; i++) {
      const r = pw.direction === 'across' ? pw.row : pw.row + i;
      const c = pw.direction === 'across' ? pw.col + i : pw.col;
      if (grid[r][c]) {
        if (pw.direction === 'across') {
          grid[r][c]!.acrossWordId = pw.id;
          grid[r][c]!.acrossNumber = pw.number;
        } else {
          grid[r][c]!.downWordId = pw.id;
          grid[r][c]!.downNumber = pw.number;
        }
      }
    }
  }

  // Deterministic thematic titles
  const TITLES = [
    'Paso a Paso', 'Nuevos Horizontes', 'Crucigrama Vivo', 'Palabras en Flor',
    'Conexiones Claras', 'Mundo Cotidiano', 'Voz y Letra', 'Ruta del Saber',
    'Chispa Creativa', 'Puente de Ideas', 'Vocabulario Ágil', 'Destino Idiomático',
  ];
  const title = `Crucigrama #${puzzleId} · ${TITLES[(puzzleId * 7) % TITLES.length]}`;

  return {
    id: puzzleId,
    level,
    levelName: levelInfo.name,
    subLevelIndex,
    title,
    width,
    height,
    words: placedWordsFinal,
    grid,
  };
}

// In-memory memoization cache for generated puzzles
const puzzleCache = new Map<number, PuzzleData>();

export function getOrGeneratePuzzle(puzzleId: number): PuzzleData {
  if (puzzleCache.has(puzzleId)) {
    return puzzleCache.get(puzzleId)!;
  }
  const puzzle = generatePuzzle(puzzleId);
  puzzleCache.set(puzzleId, puzzle);
  return puzzle;
}
