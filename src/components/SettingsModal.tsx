import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  Moon,
  Sun,
  RotateCcw,
  X,
  ShieldAlert,
  Sparkles,
  Check,
} from "lucide-react";
import { UserProgress } from "../types";

interface SettingsModalProps {
  progress: UserProgress;
  onClose: () => void;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  progress,
  onClose,
  onToggleSound,
  onToggleTheme,
  onResetProgress,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const totalStars = Object.values(progress.solvedPuzzles).reduce(
    (acc, curr) => acc + curr.stars,
    0,
  );

  return (
    <div className="ui-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 ui-page backdrop-blur-md animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ajustes"
        className="ui-modal ui-settings relative w-full max-w-md ui-surface border ui-border rounded-3xl p-6 sm:p-8 shadow-2xl ui-text"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar ajustes"
          className="absolute top-5 right-5 p-1.5 rounded-lg ui-muted ui-hover-text ui-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-black ui-text mb-1">Ajustes</h2>
        <p className="text-xs ui-muted mb-6">
          Personaliza tu experiencia de aprendizaje en CrossPath
        </p>

        {/* User stats summary */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl ui-page border ui-border mb-6">
          <div>
            <span className="text-[10px] uppercase font-mono ui-muted block">
              Crucigramas
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              {Object.keys(progress.solvedPuzzles).length} / 1200
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono ui-muted block">
              Estrellas
            </span>
            <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
              {totalStars} ★
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono ui-muted block">
              Monedas
            </span>
            <span className="text-lg font-bold font-mono text-yellow-400 tabular-nums">
              {progress.coins} monedas
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono ui-muted block">
              Vocabulario
            </span>
            <span className="text-lg font-bold font-mono text-teal-400 tabular-nums">
              {progress.learnedWords.length} palabras
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Sound toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl ui-page border ui-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl ui-soft ui-muted">
                {progress.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 ui-muted" />
                )}
              </div>
              <div>
                <span className="text-xs font-semibold ui-text block">
                  Efectos de sonido
                </span>
                <span className="text-[11px] ui-muted">
                  Sonido de escritura, aciertos y fanfarrias
                </span>
              </div>
            </div>

            <button
              onClick={onToggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                progress.soundEnabled ? "bg-emerald-500" : "ui-soft"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full ui-white shadow-sm transition-transform ${
                  progress.soundEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Theme toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl ui-page border ui-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl ui-soft ui-muted">
                {progress.theme === "dark" ? (
                  <Moon className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div>
                <span className="text-xs font-semibold ui-text block">
                  Tema visual
                </span>
                <span className="text-[11px] ui-muted">
                  {progress.theme === "dark" ? "Modo Oscuro" : "Modo Claro"}
                </span>
              </div>
            </div>

            <button
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-xl ui-soft text-xs font-semibold ui-text ui-hover transition-colors"
            >
              Cambiar
            </button>
          </div>

          {/* Language of hints */}
          <div className="flex items-center justify-between p-3 rounded-2xl ui-page border ui-border">
            <div>
              <span className="text-xs font-semibold ui-text block">
                Idioma de las pistas
              </span>
              <span className="text-[11px] ui-muted">
                Pistas en inglés con traducción al español
              </span>
            </div>
            <span className="text-xs font-bold font-mono text-emerald-400 px-2 py-1 rounded ui-soft">
              ES / EN
            </span>
          </div>

          {/* Reset progress */}
          <div className="pt-2">
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar todo el progreso</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>¿Estás seguro de que deseas reiniciar?</span>
                </div>
                <p className="text-[11px] ui-muted">
                  Se borrarán los crucigramas resueltos, monedas acumuladas y
                  palabras aprendidas.
                </p>
                <div className="flex items-center gap-2 justify-end pt-1">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1.5 rounded-xl ui-soft ui-muted text-xs font-semibold ui-hover transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      onResetProgress();
                      setShowConfirmReset(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 ui-text text-xs font-bold shadow-md transition-colors"
                  >
                    Confirmar Reinicio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
