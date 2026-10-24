import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Coins, Volume2, ArrowRight, Map, BookOpen, CheckCircle2 } from 'lucide-react';
import { PlacedWord, PuzzleData } from '../types';
import { speakEnglishWord, SoundEngine } from '../utils/sound';

interface WordReviewModalProps {
  puzzle: PuzzleData;
  stars: number;
  coinsEarned: number;
  timeSecs: number;
  hintsUsed: number;
  soundEnabled: boolean;
  onNextPuzzle: () => void;
  onBackToMap: () => void;
  onGoToVocab: () => void;
}

export const WordReviewModal: React.FC<WordReviewModalProps> = ({
  puzzle,
  stars,
  coinsEarned,
  timeSecs,
  hintsUsed,
  soundEnabled,
  onNextPuzzle,
  onBackToMap,
  onGoToVocab,
}) => {
  useEffect(() => {
    // Sound fanfare
    SoundEngine.playPuzzleWon(soundEnabled);

    // Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 350);

      return () => clearTimeout(timer);
    } catch {
      // Confetti fallback
    }
  }, [soundEnabled]);

  // Unique list of placed words
  const wordsList: PlacedWord[] = React.useMemo(() => {
    const map: Record<string, PlacedWord> = {};
    puzzle.words.forEach((w) => {
      if (!map[w.word]) {
        map[w.word] = w;
      }
    });
    return Object.values(map);
  }, [puzzle.words]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header celebration */}
        <div className="text-center pb-4 border-b border-slate-800">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            ¡Crucigrama Completado!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {puzzle.title} · Nivel {puzzle.level}
          </p>

          {/* Star rating reveal */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {[1, 2, 3].map((starIdx) => {
              const active = starIdx <= stars;
              return (
                <div
                  key={starIdx}
                  className={`p-2 rounded-2xl transition-transform duration-500 ${
                    active
                      ? 'bg-amber-400/20 text-amber-400 scale-110 shadow-lg'
                      : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  <Star className={`w-7 h-7 ${active ? 'fill-amber-400 text-amber-400' : ''}`} />
                </div>
              );
            })}
          </div>

          {/* Metrics summary */}
          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 text-yellow-400">
              <Coins className="w-4 h-4" />
              <span>+{coinsEarned} monedas</span>
            </div>
            <span>·</span>
            <div>
              <span>Tiempo: </span>
              <span className="font-mono tabular-nums text-slate-100">{formatTime(timeSecs)}</span>
            </div>
            <span>·</span>
            <div>
              <span>Pistas: </span>
              <span className="font-mono tabular-nums text-slate-100">{hintsUsed}</span>
            </div>
          </div>
        </div>

        {/* Word Review List */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>Vocabulario Aprendido ({wordsList.length} palabras)</span>
            </h3>
            <span className="text-[11px] text-emerald-400 font-medium">
              Añadidas a tu colección
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wordsList.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-black text-white tracking-wide font-sans">
                      {item.word}
                    </span>
                    <span className="text-xs font-medium text-amber-300">
                      {item.spanish}
                    </span>
                  </div>

                  <button
                    type="button"
                    title={`Pronunciar ${item.word}`}
                    onClick={() => speakEnglishWord(item.word)}
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {item.clue}
                </p>

                {item.example && (
                  <p className="mt-1.5 text-[10px] text-slate-400 italic border-t border-slate-800/60 pt-1">
                    "{item.example}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal actions */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onBackToMap}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Map className="w-4 h-4" />
              <span>Mapa</span>
            </button>
            <button
              onClick={onGoToVocab}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Repasar</span>
            </button>
          </div>

          <button
            onClick={onNextPuzzle}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <span>Siguiente Crucigrama</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
