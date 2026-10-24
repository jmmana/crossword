import React from 'react';
import { Play, Award, Sparkles, BookOpen, Map, CheckCircle2 } from 'lucide-react';

interface IntroScreenProps {
  onStartGame: () => void;
  onOpenPlacementTest: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onStartGame,
  onOpenPlacementTest,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 animate-fade-in relative overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl flex flex-col text-center">
        
        {/* Hero image banner */}
        <div className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden mb-6 border border-slate-800 shadow-md">
          <img
            src="/src/assets/images/crossword_hero_banner_1792847023760.jpg"
            alt="CrossPath English Aventura"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-left">
            <div>
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-emerald-400">
                1.200 Crucigramas Progresivos
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                CrossPath English
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-semibold text-slate-200">
              <span>MCER: A1 → C2</span>
            </div>
          </div>
        </div>

        {/* Core Value Proposition */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          Aprende y afianza vocabulario en inglés de forma natural resolviendo crucigramas diseñados para hispanohablantes. Desde términos cotidianos hasta expresiones eruditas.
        </p>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-left">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <Map className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold text-white mb-0.5">Mapa de 1.200 Niveles</h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              6 mundos temáticos organizados de A1 a C2 con progreso gradual.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <Sparkles className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="text-xs font-bold text-white mb-0.5">Pistas con Traducción</h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Definiciones en inglés con pistas opcionales en español y audio.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <BookOpen className="w-5 h-5 text-teal-400 mb-2" />
            <h3 className="text-xs font-bold text-white mb-0.5">Tu Propio Vocabulario</h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Colección interactiva con tarjetas de repaso y pronunciación real.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartGame}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>Comenzar desde A1 (#1)</span>
          </button>

          <button
            onClick={onOpenPlacementTest}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>¿Ya sabes inglés? Haz el Test de Nivel</span>
          </button>
        </div>

      </div>
    </div>
  );
};
