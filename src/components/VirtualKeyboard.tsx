import React from 'react';
import { Delete, ArrowRightLeft } from 'lucide-react';

interface VirtualKeyboardProps {
  onLetter: (char: string) => void;
  onBackspace: () => void;
  onToggleDirection: () => void;
  disabled?: boolean;
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onLetter,
  onBackspace,
  onToggleDirection,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto p-2 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl space-y-1.5 select-none sm:hidden">
      {ROWS.map((row, rIdx) => (
        <div key={rIdx} className="flex justify-center gap-1">
          {rIdx === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={onToggleDirection}
              aria-label="Cambiar orientación de escritura"
              className="px-2.5 py-3 rounded-lg bg-slate-800 text-emerald-400 font-semibold text-xs active:bg-slate-700 flex items-center justify-center border border-slate-700/60 shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          )}

          {row.map((char) => (
            <button
              key={char}
              type="button"
              disabled={disabled}
              onClick={() => onLetter(char)}
              className="flex-1 py-3 max-w-[36px] rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 active:text-slate-950 text-slate-100 font-bold text-sm border border-slate-700/60 shadow-sm transition-all"
            >
              {char}
            </button>
          ))}

          {rIdx === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={onBackspace}
              aria-label="Borrar letra"
              className="px-2.5 py-3 rounded-lg bg-slate-800 text-rose-400 font-semibold text-xs active:bg-slate-700 flex items-center justify-center border border-slate-700/60 shadow-sm"
            >
              <Delete className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
