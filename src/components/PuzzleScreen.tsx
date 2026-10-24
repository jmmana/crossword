import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Clock, Star, HelpCircle, Check, Eye, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { Direction, PlacedWord, PuzzleData, UserProgress } from '../types';
import { getLevelForPuzzleId } from '../data/levels';
import { CrosswordGrid } from './CrosswordGrid';
import { ClueList } from './ClueList';
import { VirtualKeyboard } from './VirtualKeyboard';
import { SoundEngine, speakEnglishWord } from '../utils/sound';

interface PuzzleScreenProps {
  puzzle: PuzzleData;
  progress: UserProgress;
  onBackToMap: () => void;
  onPuzzleSolved: (
    stars: number,
    hintsUsed: number,
    timeSecs: number,
    wordIds: string[]
  ) => void;
  onUpdateCoins: (newBalance: number) => void;
  onSaveInProgress: (puzzleId: number, grid: Record<string, string>) => void;
}

export const PuzzleScreen: React.FC<PuzzleScreenProps> = ({
  puzzle,
  progress,
  onBackToMap,
  onPuzzleSolved,
  onUpdateCoins,
  onSaveInProgress,
}) => {
  // Load saved progress for this puzzle or initialize empty
  const [userGrid, setUserGrid] = useState<Record<string, string>>(() => {
    return progress.inProgressGrids[puzzle.id] || {};
  });

  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(() => {
    // Default to first placed word start cell
    if (puzzle.words.length > 0) {
      return { row: puzzle.words[0].row, col: puzzle.words[0].col };
    }
    return null;
  });

  const [activeDirection, setActiveDirection] = useState<Direction>('across');
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [checkedCells, setCheckedCells] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [timeSecs, setTimeSecs] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const levelInfo = getLevelForPuzzleId(puzzle.id);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSecs((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save in-progress state to parent
  useEffect(() => {
    onSaveInProgress(puzzle.id, userGrid);
  }, [puzzle.id, userGrid, onSaveInProgress]);

  // Determine active word based on active cell and direction
  const activeWord: PlacedWord | null = useMemo(() => {
    if (!activeCell) return null;
    const { row, col } = activeCell;

    // Search in current direction
    const match = puzzle.words.find((w) => {
      if (w.direction !== activeDirection) return false;
      if (activeDirection === 'across') {
        return w.row === row && col >= w.col && col < w.col + w.word.length;
      } else {
        return w.col === col && row >= w.row && row < w.row + w.word.length;
      }
    });

    if (match) return match;

    // Fallback to opposite direction if no match in current
    return (
      puzzle.words.find((w) => {
        if (activeDirection === 'across') {
          return w.col === col && row >= w.row && row < w.row + w.word.length;
        } else {
          return w.row === row && col >= w.col && col < w.col + w.word.length;
        }
      }) || null
    );
  }, [activeCell, activeDirection, puzzle.words]);

  // Check if puzzle is completely solved
  const checkWinCondition = useCallback(
    (currentGrid: Record<string, string>) => {
      for (let r = 0; r < puzzle.height; r++) {
        for (let c = 0; c < puzzle.width; c++) {
          const cell = puzzle.grid[r][c];
          if (cell) {
            const userChar = currentGrid[`${r},${c}`];
            if (!userChar || userChar.toUpperCase() !== cell.char.toUpperCase()) {
              return false;
            }
          }
        }
      }
      return true;
    },
    [puzzle]
  );

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (activeCell?.row === row && activeCell?.col === col) {
      // Toggle direction if clicking same cell
      toggleDirection();
    } else {
      setActiveCell({ row, col });
    }
  };

  const toggleDirection = () => {
    setActiveDirection((prev) => (prev === 'across' ? 'down' : 'across'));
    SoundEngine.playType(progress.soundEnabled);
  };

  // Move cursor forward in active direction
  const advanceCursor = (r: number, c: number) => {
    if (activeDirection === 'across') {
      let nextCol = c + 1;
      while (nextCol < puzzle.width && !puzzle.grid[r][nextCol]) {
        nextCol++;
      }
      if (nextCol < puzzle.width && puzzle.grid[r][nextCol]) {
        setActiveCell({ row: r, col: nextCol });
      }
    } else {
      let nextRow = r + 1;
      while (nextRow < puzzle.height && !puzzle.grid[nextRow][c]) {
        nextRow++;
      }
      if (nextRow < puzzle.height && puzzle.grid[nextRow][c]) {
        setActiveCell({ row: nextRow, col: c });
      }
    }
  };

  // Move cursor backwards
  const retreatCursor = (r: number, c: number) => {
    if (activeDirection === 'across') {
      let prevCol = c - 1;
      while (prevCol >= 0 && !puzzle.grid[r][prevCol]) {
        prevCol--;
      }
      if (prevCol >= 0 && puzzle.grid[r][prevCol]) {
        setActiveCell({ row: r, col: prevCol });
      }
    } else {
      let prevRow = r - 1;
      while (prevRow >= 0 && !puzzle.grid[prevRow][c]) {
        prevRow--;
      }
      if (prevRow >= 0 && puzzle.grid[prevRow][c]) {
        setActiveCell({ row: prevRow, col: c });
      }
    }
  };

  // Letter typed
  const handleLetterInput = (char: string) => {
    if (!activeCell) return;
    const { row, col } = activeCell;
    const cell = puzzle.grid[row][col];
    if (!cell) return;

    SoundEngine.playType(progress.soundEnabled);

    const key = `${row},${col}`;
    const nextGrid = { ...userGrid, [key]: char.toUpperCase() };
    setUserGrid(nextGrid);

    // Clear checked feedback on this cell
    if (checkedCells[key]) {
      const nextChecked = { ...checkedCells };
      delete nextChecked[key];
      setCheckedCells(nextChecked);
    }

    // Advance cursor
    advanceCursor(row, col);

    // Check if entire puzzle is solved
    if (checkWinCondition(nextGrid)) {
      // Calculate stars
      let stars = 3;
      if (hintsUsed >= 4 || mistakesCount >= 5) stars = 1;
      else if (hintsUsed >= 2 || mistakesCount >= 2) stars = 2;

      const wordIds = puzzle.words.map((w) => w.id);
      onPuzzleSolved(stars, hintsUsed, timeSecs, wordIds);
    }
  };

  // Backspace key
  const handleBackspace = () => {
    if (!activeCell) return;
    const { row, col } = activeCell;
    const key = `${row},${col}`;

    SoundEngine.playDelete(progress.soundEnabled);

    if (userGrid[key]) {
      // Clear current cell letter
      const next = { ...userGrid };
      delete next[key];
      setUserGrid(next);
    } else {
      // Move backwards and clear previous cell
      retreatCursor(row, col);
    }
  };

  // Arrow key navigation
  const handleNavigate = (dir: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') => {
    if (!activeCell) return;
    const { row, col } = activeCell;
    let targetRow = row;
    let targetCol = col;

    if (dir === 'ArrowUp') targetRow--;
    if (dir === 'ArrowDown') targetRow++;
    if (dir === 'ArrowLeft') targetCol--;
    if (dir === 'ArrowRight') targetCol++;

    if (
      targetRow >= 0 &&
      targetRow < puzzle.height &&
      targetCol >= 0 &&
      targetCol < puzzle.width &&
      puzzle.grid[targetRow][targetCol]
    ) {
      setActiveCell({ row: targetRow, col: targetCol });
      if (dir === 'ArrowLeft' || dir === 'ArrowRight') setActiveDirection('across');
      if (dir === 'ArrowUp' || dir === 'ArrowDown') setActiveDirection('down');
    }
  };

  // Select word directly from clue list
  const handleSelectWord = (word: PlacedWord) => {
    setActiveDirection(word.direction);
    setActiveCell({ row: word.row, col: word.col });
    SoundEngine.playType(progress.soundEnabled);
  };

  // Unlock Spanish hint
  const handleUnlockSpanishHint = (word: PlacedWord) => {
    const cost = 5;
    if (progress.coins < cost) {
      setFeedbackMessage('No tienes suficientes monedas para ver la traducción.');
      SoundEngine.playWrong(progress.soundEnabled);
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }

    onUpdateCoins(progress.coins - cost);
    setRevealedHints((prev) => ({ ...prev, [word.id]: true }));
    setHintsUsed((prev) => prev + 1);
    SoundEngine.playHint(progress.soundEnabled);
  };

  // Tool: Check active letter
  const handleCheckLetter = () => {
    if (!activeCell) return;
    const { row, col } = activeCell;
    const cell = puzzle.grid[row][col];
    if (!cell) return;

    const key = `${row},${col}`;
    const userChar = userGrid[key];
    if (!userChar) return;

    const isCorrect = userChar.toUpperCase() === cell.char.toUpperCase();
    setCheckedCells((prev) => ({
      ...prev,
      [key]: isCorrect ? 'correct' : 'wrong',
    }));

    if (isCorrect) {
      SoundEngine.playStar(progress.soundEnabled);
    } else {
      SoundEngine.playWrong(progress.soundEnabled);
      setMistakesCount((prev) => prev + 1);
    }
  };

  // Tool: Check active word
  const handleCheckWord = () => {
    if (!activeWord) return;
    const updates: Record<string, 'correct' | 'wrong'> = {};
    let allRight = true;

    for (let i = 0; i < activeWord.word.length; i++) {
      const r = activeWord.direction === 'across' ? activeWord.row : activeWord.row + i;
      const c = activeWord.direction === 'across' ? activeWord.col + i : activeWord.col;
      const key = `${r},${c}`;
      const char = userGrid[key];
      const correctChar = activeWord.word[i];

      if (char && char.toUpperCase() === correctChar.toUpperCase()) {
        updates[key] = 'correct';
      } else {
        updates[key] = 'wrong';
        allRight = false;
      }
    }

    setCheckedCells((prev) => ({ ...prev, ...updates }));

    if (allRight) {
      SoundEngine.playCorrectWord(progress.soundEnabled);
      setFeedbackMessage('¡Palabra correcta!');
    } else {
      SoundEngine.playWrong(progress.soundEnabled);
      setMistakesCount((prev) => prev + 1);
      setFeedbackMessage('Hay letras incorrectas en esta palabra.');
    }
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  // Tool: Reveal letter (costs 10 coins)
  const handleRevealLetter = () => {
    if (!activeCell) return;
    const { row, col } = activeCell;
    const cell = puzzle.grid[row][col];
    if (!cell) return;

    const cost = 10;
    if (progress.coins < cost) {
      setFeedbackMessage('Necesitas 10 monedas para revelar una letra.');
      SoundEngine.playWrong(progress.soundEnabled);
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }

    onUpdateCoins(progress.coins - cost);
    setHintsUsed((prev) => prev + 1);
    const key = `${row},${col}`;
    const nextGrid = { ...userGrid, [key]: cell.char.toUpperCase() };
    setUserGrid(nextGrid);
    setCheckedCells((prev) => ({ ...prev, [key]: 'correct' }));
    SoundEngine.playHint(progress.soundEnabled);

    // Advance cursor
    advanceCursor(row, col);

    if (checkWinCondition(nextGrid)) {
      const wordIds = puzzle.words.map((w) => w.id);
      onPuzzleSolved(1, hintsUsed + 1, timeSecs, wordIds);
    }
  };

  // Tool: Reveal word (costs 25 coins)
  const handleRevealWord = () => {
    if (!activeWord) return;
    const cost = 25;
    if (progress.coins < cost) {
      setFeedbackMessage('Necesitas 25 monedas para revelar la palabra.');
      SoundEngine.playWrong(progress.soundEnabled);
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }

    onUpdateCoins(progress.coins - cost);
    setHintsUsed((prev) => prev + 2);

    const nextGrid = { ...userGrid };
    const checkedUpdates: Record<string, 'correct'> = {};

    for (let i = 0; i < activeWord.word.length; i++) {
      const r = activeWord.direction === 'across' ? activeWord.row : activeWord.row + i;
      const c = activeWord.direction === 'across' ? activeWord.col + i : activeWord.col;
      const key = `${r},${c}`;
      nextGrid[key] = activeWord.word[i];
      checkedUpdates[key] = 'correct';
    }

    setUserGrid(nextGrid);
    setCheckedCells((prev) => ({ ...prev, ...checkedUpdates }));
    SoundEngine.playCorrectWord(progress.soundEnabled);

    if (checkWinCondition(nextGrid)) {
      const wordIds = puzzle.words.map((w) => w.id);
      onPuzzleSolved(1, hintsUsed + 2, timeSecs, wordIds);
    }
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="aql-puzzle min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Puzzle Top Toolbar */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          
          <button
            onClick={onBackToMap}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mapa</span>
          </button>

          <div className="text-center">
            <h1 className="text-sm font-bold text-white flex items-center justify-center gap-2">
              <span>{puzzle.title}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-md font-mono uppercase font-black"
                style={{ backgroundColor: `${levelInfo.color}25`, color: levelInfo.color }}
              >
                {puzzle.level}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1 font-mono tabular-nums text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTimer(timeSecs)}</span>
            </div>

            <div className="hidden sm:flex items-center gap-0.5">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    hintsUsed >= 4
                      ? s === 1 ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                      : hintsUsed >= 2
                      ? s <= 2 ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                      : 'fill-amber-400 text-amber-400'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Puzzle Area */}
      <div className="flex-1 max-w-[1440px] mx-auto w-full p-4 flex flex-col gap-4">
        
        {/* Prominent Active Clue Bar */}
        {activeWord && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 font-bold font-mono text-xs shrink-0 mt-0.5">
                {activeWord.number} {activeWord.direction === 'across' ? '▶' : '▼'}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug">
                  {activeWord.clue}
                </p>
                {revealedHints[activeWord.id] && (
                  <p className="text-xs text-amber-300 font-semibold mt-1">
                    Español: {activeWord.spanish}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                title="Escuchar pista"
                onClick={() => speakEnglishWord(activeWord.clue)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {!revealedHints[activeWord.id] && (
                <button
                  type="button"
                  onClick={() => handleUnlockSpanishHint(activeWord)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Pista en Español (5 🪙)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Feedback message banner if any */}
        {feedbackMessage && (
          <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-center text-slate-200 animate-fade-in flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Tools Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-1">
          <button
            onClick={handleCheckLetter}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Comprobar letra</span>
          </button>

          <button
            onClick={handleCheckWord}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Comprobar palabra</span>
          </button>

          <button
            onClick={handleRevealLetter}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Revelar letra (10 🪙)</span>
          </button>

          <button
            onClick={handleRevealWord}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-orange-400" />
            <span>Revelar palabra (25 🪙)</span>
          </button>
        </div>

        {/* Grid and Clues layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 flex flex-col items-center">
            <CrosswordGrid
              puzzle={puzzle}
              userGrid={userGrid}
              activeCell={activeCell}
              activeDirection={activeDirection}
              activeWord={activeWord}
              checkedCells={checkedCells}
              onCellClick={handleCellClick}
              onLetterInput={handleLetterInput}
              onBackspace={handleBackspace}
              onNavigate={handleNavigate}
              onToggleDirection={toggleDirection}
            />

            {/* Mobile Virtual Keyboard */}
            <div className="w-full mt-3">
              <VirtualKeyboard
                onLetter={handleLetterInput}
                onBackspace={handleBackspace}
                onToggleDirection={toggleDirection}
              />
            </div>
          </div>

          <div className="lg:col-span-4">
            <ClueList
              words={puzzle.words}
              activeWord={activeWord}
              revealedHints={revealedHints}
              onSelectWord={handleSelectWord}
              onUnlockSpanishHint={handleUnlockSpanishHint}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
