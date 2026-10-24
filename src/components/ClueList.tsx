import React, { useState, useEffect, useRef } from "react";
import { Volume2, HelpCircle, ArrowRight, ArrowDown } from "lucide-react";
import { Direction, PlacedWord } from "../types";
import { speakEnglishWord } from "../utils/sound";

interface ClueListProps {
  words: PlacedWord[];
  activeWord: PlacedWord | null;
  revealedHints: Record<string, boolean>; // wordId -> boolean
  onSelectWord: (word: PlacedWord) => void;
  onUnlockSpanishHint: (word: PlacedWord) => void;
}

export const ClueList: React.FC<ClueListProps> = ({
  words,
  activeWord,
  revealedHints,
  onSelectWord,
  onUnlockSpanishHint,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "across" | "down">("all");
  const activeCardRef = useRef<HTMLDivElement>(null);

  const acrossWords = words.filter((w) => w.direction === "across");
  const downWords = words.filter((w) => w.direction === "down");

  // When activeWord changes, if current tab is restrictive, auto-switch to show the active clue
  useEffect(() => {
    if (activeWord) {
      if (activeTab !== "all" && activeTab !== activeWord.direction) {
        setActiveTab(activeWord.direction);
      }
    }
  }, [activeWord]);

  // Scroll active card into view smoothly
  useEffect(() => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeWord]);

  const displayedWords =
    activeTab === "across"
      ? acrossWords
      : activeTab === "down"
        ? downWords
        : words;

  return (
    <div className="ui-clue-list w-full flex flex-col rounded-2xl ui-surface border ui-border shadow-xl overflow-hidden">
      {/* Top Header with Segmented Filter Tabs */}
      <div className="p-3 border-b ui-border ui-page">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider ui-muted">
            Pistas del Crucigrama
          </span>
          <span className="text-[11px] ui-muted font-mono">
            {words.length} palabras en total
          </span>
        </div>

        {/* Segmented Controls - Full width, clean buttons */}
        <div className="grid grid-cols-3 gap-1.5 p-1 ui-surface rounded-xl border ui-border">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "all"
                ? "ui-soft ui-text shadow-sm border ui-border"
                : "ui-muted ui-hover-text"
            }`}
          >
            <span>Todas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full ui-soft font-mono">
              {words.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("across")}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "across"
                ? "bg-emerald-950/70 text-emerald-300 shadow-sm border border-emerald-500/50"
                : "ui-muted ui-hover-text"
            }`}
          >
            <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Horiz.</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full ui-soft font-mono">
              {acrossWords.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("down")}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "down"
                ? "bg-cyan-950/70 text-cyan-300 shadow-sm border border-cyan-500/50"
                : "ui-muted ui-hover-text"
            }`}
          >
            <ArrowDown className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Vert.</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full ui-soft font-mono">
              {downWords.length}
            </span>
          </button>
        </div>
      </div>

      {/* Clues List Body (Full Width Cards with No Overlapping) */}
      <div className="p-3 space-y-2 max-h-[460px] overflow-y-auto">
        {displayedWords.length === 0 ? (
          <div className="py-8 text-center text-xs ui-muted">
            No hay pistas en esta categoría.
          </div>
        ) : (
          displayedWords.map((w) => {
            const isActive =
              activeWord?.id === w.id && activeWord?.direction === w.direction;
            const hintRevealed = revealedHints[w.id];

            return (
              <div
                key={`${w.direction}-${w.id}`}
                ref={isActive ? activeCardRef : null}
                onClick={() => onSelectWord(w)}
                className={`ui-clue-card w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-950/40 border-emerald-500 ui-text shadow-md ring-1 ring-emerald-500/50"
                    : "ui-page ui-border hover:border-slate-700 ui-muted ui-hover-text"
                }`}
              >
                {/* Card Top Row: Number, Orientation Badge, Letter Count & Actions */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isActive
                          ? "bg-emerald-500 ui-contrast"
                          : "ui-soft text-emerald-400 border ui-border"
                      }`}
                    >
                      {w.number}
                    </span>

                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ui-soft ui-muted border ui-border flex items-center gap-1">
                      {w.direction === "across" ? (
                        <>
                          <ArrowRight className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Horizontal</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-2.5 h-2.5 text-cyan-400" />
                          <span>Vertical</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] ui-muted font-mono">
                      ({w.word.length} letras)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Speak clue */}
                    <button
                      type="button"
                      title="Escuchar pronunciación de la pista"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakEnglishWord(w.clue);
                      }}
                      className="p-1.5 rounded-lg ui-muted ui-hover-text ui-hover transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Spanish hint button */}
                    {!hintRevealed && (
                      <button
                        type="button"
                        title="Ver traducción en español (cuesta 5 monedas)"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnlockSpanishHint(w);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Español (5 monedas)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* English Clue Text */}
                <p className="text-xs sm:text-sm leading-relaxed ui-text mt-1 font-medium">
                  {w.clue}
                </p>

                {/* Spanish Hint if unlocked */}
                {hintRevealed && (
                  <div className="mt-2.5 pt-2 border-t ui-border text-xs text-amber-300 flex items-center justify-between bg-amber-950/20 px-2.5 py-1.5 rounded-lg border border-amber-500/30">
                    <span className="font-semibold">
                      Traducción:{" "}
                      <span className="font-bold underline">{w.spanish}</span>
                    </span>
                    <span className="text-[10px] ui-muted font-mono">
                      Pista activa
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 ui-page border-t ui-border text-[11px] ui-muted text-center">
        Toca cualquier pista para situar el cursor en la palabra correspondiente
      </div>
    </div>
  );
};
