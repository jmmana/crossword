import React, { useRef, useEffect, useState } from "react";
import { CrosswordCell, Direction, PlacedWord, PuzzleData } from "../types";

interface CrosswordGridProps {
  puzzle: PuzzleData;
  userGrid: Record<string, string>; // "row,col" -> letter
  activeCell: { row: number; col: number } | null;
  activeDirection: Direction;
  activeWord: PlacedWord | null;
  checkedCells: Record<string, "correct" | "wrong">;
  onCellClick: (row: number, col: number) => void;
  onLetterInput: (char: string) => void;
  onBackspace: () => void;
  onNavigate: (
    dir: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight",
  ) => void;
  onToggleDirection: () => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  puzzle,
  userGrid,
  activeCell,
  activeDirection,
  activeWord,
  checkedCells,
  onCellClick,
  onLetterInput,
  onBackspace,
  onNavigate,
  onToggleDirection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(640);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setAvailableWidth(entry.contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Focus hidden input on click so mobile virtual keyboard or hardware keyboard works seamlessly
  const focusInput = () => {
    hiddenInputRef.current?.focus();
  };

  useEffect(() => {
    focusInput();
  }, [activeCell]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      onBackspace();
      return;
    }
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onToggleDirection();
      return;
    }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      onNavigate(e.key as "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight");
      return;
    }
    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      onLetterInput(e.key.toUpperCase());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(-1);
    if (/^[a-zA-Z]$/.test(val)) {
      onLetterInput(val.toUpperCase());
    }
    e.target.value = "";
  };

  // Determine if a cell is part of the currently active word
  const isCellInActiveWord = (r: number, c: number) => {
    if (!activeWord) return false;
    if (activeWord.direction === "across") {
      return (
        r === activeWord.row &&
        c >= activeWord.col &&
        c < activeWord.col + activeWord.word.length
      );
    } else {
      return (
        c === activeWord.col &&
        r >= activeWord.row &&
        r < activeWord.row + activeWord.word.length
      );
    }
  };

  const cellSize = Math.min(
    64,
    Math.max(
      28,
      Math.floor((availableWidth - 30 - (puzzle.width - 1) * 4) / puzzle.width),
    ),
  );

  return (
    <div
      ref={containerRef}
      onClick={focusInput}
      className="ui-board aql-crossword-grid relative flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl ui-surface border ui-border shadow-xl overflow-x-auto select-none"
    >
      {/* Hidden input for mobile keyboard and native typing */}
      <input
        ref={hiddenInputRef}
        type="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="opacity-0 absolute pointer-events-none w-1 h-1 -top-10"
        onKeyDown={handleKeyDown}
        onChange={handleInputChange}
      />

      <div
        className="inline-grid gap-1 ui-page p-2 rounded-xl border ui-border shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${puzzle.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${puzzle.height}, ${cellSize}px)`,
        }}
      >
        {puzzle.grid.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            if (!cell) {
              return (
                <div
                  key={key}
                  className="w-full h-full rounded-md ui-page opacity-30"
                  style={{ width: cellSize, height: cellSize }}
                />
              );
            }

            const isSelected = activeCell?.row === r && activeCell?.col === c;
            const inWord = isCellInActiveWord(r, c);
            const userLetter = userGrid[key] || "";
            const checkState = checkedCells[key];

            let cellBg = "ui-soft ui-text ui-hover";
            let borderStyle = "border ui-border";

            if (checkState === "wrong") {
              cellBg = "bg-rose-950/80 text-rose-300 animate-pulse";
              borderStyle = "border border-rose-500 shadow-sm";
            } else if (checkState === "correct") {
              cellBg = "bg-emerald-950/80 text-emerald-300";
              borderStyle = "border border-emerald-500 shadow-sm";
            } else if (isSelected) {
              cellBg =
                "bg-emerald-500 ui-contrast font-black shadow-lg ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-900";
              borderStyle = "border-transparent z-10";
            } else if (inWord) {
              cellBg = "bg-emerald-950/50 ui-text";
              borderStyle = "border border-emerald-500/50";
            }

            return (
              <button
                key={key}
                type="button"
                aria-label={`Fila ${r + 1}, columna ${c + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCellClick(r, c);
                  focusInput();
                }}
                className={`relative flex items-center justify-center rounded-lg transition-all cursor-pointer font-bold select-none ${cellBg} ${borderStyle}`}
                style={{ width: cellSize, height: cellSize }}
              >
                {/* Crossword Clue Number in corner */}
                {cell.number && (
                  <span
                    className={`absolute top-0.5 left-1 text-[9px] font-mono leading-none ${isSelected ? "ui-contrast font-bold" : "ui-muted"}`}
                  >
                    {cell.number}
                  </span>
                )}

                {/* Letter */}
                <span
                  className={`text-base sm:text-lg transition-transform font-sans ${
                    userLetter ? "scale-100" : "scale-75 opacity-0"
                  }`}
                >
                  {userLetter}
                </span>

                {/* Direction indicator arrow in active cell */}
                {isSelected && (
                  <span className="absolute bottom-0.5 right-1 text-[8px] text-slate-900/80 font-black uppercase">
                    {activeDirection === "across" ? "▶" : "▼"}
                  </span>
                )}
              </button>
            );
          }),
        )}
      </div>

      {/* Touch keyboard hint */}
      <div className="mt-2.5 text-[11px] ui-muted flex items-center gap-3">
        <span>Toca para seleccionar</span>
        <span>·</span>
        <span>Espacio o clic para cambiar dirección (▶/▼)</span>
      </div>
    </div>
  );
};
