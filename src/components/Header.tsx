import React from 'react';
import { Flame, Coins, BookOpen, Map as MapIcon, Settings as SettingsIcon, Award, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { UserProgress } from '../types';
import { getLevelForPuzzleId } from '../data/levels';

interface HeaderProps {
  progress: UserProgress;
  activeTab: 'map' | 'puzzle' | 'vocab' | 'placement';
  onSelectTab: (tab: 'map' | 'puzzle' | 'vocab' | 'placement') => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  activeTab,
  onSelectTab,
  onOpenSettings,
  onToggleSound,
  onToggleTheme,
}) => {
  const solvedCount = Object.keys(progress.solvedPuzzles).length;
  const currentLevelInfo = getLevelForPuzzleId(progress.currentPuzzleId);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/90 border-b border-slate-800 text-slate-100 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('map')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 shadow-md group-hover:scale-105 transition-transform">
              CP
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">
                CrossPath
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase block">
                English
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line controls) */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs md:text-sm font-medium">
          <button
            onClick={() => onSelectTab('map')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'map'
                ? 'bg-slate-800 text-emerald-400 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <MapIcon className="w-4 h-4 shrink-0" />
            <span>Mapa</span>
          </button>

          <button
            onClick={() => onSelectTab('vocab')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'vocab'
                ? 'bg-slate-800 text-teal-400 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Vocabulario</span>
            {progress.learnedWords.length > 0 && (
              <span className="ml-1 text-[11px] font-mono tabular-nums text-slate-400">
                {progress.learnedWords.length}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('placement')}
            className={`hidden sm:flex px-3 py-1.5 rounded-lg items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'placement'
                ? 'bg-slate-800 text-amber-400 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Test de Nivel</span>
          </button>
        </nav>

        {/* Zone 3: Stats & Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Daily streak */}
          <div
            title={`Racha de ${progress.streak} días consecutivos`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold tabular-nums"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{progress.streak}</span>
          </div>

          {/* Coins */}
          <div
            title="Monedas acumuladas para pistas"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-semibold tabular-nums"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span>{progress.coins}</span>
          </div>

          {/* Audio toggle */}
          <button
            onClick={onToggleSound}
            aria-label={progress.soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {progress.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={progress.theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {progress.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            aria-label="Ajustes de la aplicación"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Secondary Progress Strip shown on Vocab view */}
      {activeTab === 'vocab' && (
        <div className="bg-slate-950/60 border-t border-slate-800/60 px-4 py-1.5 text-xs text-slate-400">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-200">
                Nivel actual: <span style={{ color: currentLevelInfo.color }}>{currentLevelInfo.level} · {currentLevelInfo.name}</span>
              </span>
              <span className="text-slate-600 hidden md:inline">|</span>
              <span className="hidden md:inline text-slate-400">
                {currentLevelInfo.subtitle}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>Resueltos</span>
              <span className="font-semibold text-slate-100 font-mono tabular-nums">
                {solvedCount}
              </span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400 font-mono tabular-nums">1.200</span>
              <div className="w-20 sm:w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (solvedCount / 1200) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
