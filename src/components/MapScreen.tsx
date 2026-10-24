import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Star, Lock, Play, Trophy, Target } from 'lucide-react';
import { CEFRLevel, UserProgress } from '../types';
import { LEVEL_CONFIGS, getLevelForPuzzleId } from '../data/levels';
import { SoundEngine } from '../utils/sound';

interface MapScreenProps {
  progress: UserProgress;
  onSelectPuzzle: (puzzleId: number) => void;
  onOpenPlacementTest: () => void;
}

const TOTAL_PUZZLES = 1200;
const NODE_HEIGHT = 88; // Height per node row in pixels
const PATH_AMPLITUDE = 120; // Horizontal wave distance in pixels
const BANNER_ZONE_HEIGHT = 190; // Dedicated vertical clearance for level gateway banners
const TOTAL_MAP_HEIGHT = TOTAL_PUZZLES * NODE_HEIGHT + 7 * BANNER_ZONE_HEIGHT + 300;

export const MapScreen: React.FC<MapScreenProps> = ({
  progress,
  onSelectPuzzle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);

  // Monitor scroll for virtualization
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    if (containerRef.current) {
      setViewportHeight(containerRef.current.clientHeight);
    }
    const onResize = () => {
      if (containerRef.current) {
        setViewportHeight(containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Calculate coordinates for node index with dedicated clearance for level gateway banners
  const getNodePos = useCallback((id: number) => {
    const levelIndex = Math.floor((id - 1) / 200); // 0 for A1, 1 for A2, etc.
    // Each level has its banner placed above its first node with plenty of vertical breathing room
    const y = (id - 1) * NODE_HEIGHT + (levelIndex + 1) * BANNER_ZONE_HEIGHT + 30;

    // Sinusoidal winding path
    const angle = ((id - 1) * Math.PI) / 4.5;
    const x = Math.sin(angle) * PATH_AMPLITUDE;
    return { x, y };
  }, []);

  // Jump to specific puzzle index with smooth scroll
  const scrollToPuzzle = useCallback((puzzleId: number, smooth: boolean = true) => {
    if (!containerRef.current) return;
    const pos = getNodePos(puzzleId);
    const targetY = pos.y - viewportHeight / 2 + 50;
    containerRef.current.scrollTo({
      top: Math.max(0, targetY),
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, [getNodePos, viewportHeight]);

  // Initial auto-scroll to current puzzle
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToPuzzle(progress.currentPuzzleId, false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Virtualization window calculation (accounting for BANNER_ZONE_HEIGHT)
  const approxItemHeight = NODE_HEIGHT + 20;
  const startIndex = Math.max(1, Math.floor(scrollTop / approxItemHeight) - 8);
  const endIndex = Math.min(TOTAL_PUZZLES, Math.ceil((scrollTop + viewportHeight) / approxItemHeight) + 8);

  // Pre-calculate visible nodes
  const visibleNodes = useMemo(() => {
    const nodes = [];
    for (let id = startIndex; id <= endIndex; id++) {
      const pos = getNodePos(id);
      const isSolved = Boolean(progress.solvedPuzzles[id]);
      const isCurrent = id === progress.currentPuzzleId;
      const isUnlocked = isSolved || id <= progress.currentPuzzleId;
      const record = progress.solvedPuzzles[id];
      const levelInfo = getLevelForPuzzleId(id);
      const isMilestone = id % 50 === 0;
      const isLevelStart = (id - 1) % 200 === 0;

      nodes.push({
        id,
        pos,
        isSolved,
        isCurrent,
        isUnlocked,
        record,
        levelInfo,
        isMilestone,
        isLevelStart,
      });
    }
    return nodes;
  }, [startIndex, endIndex, getNodePos, progress.solvedPuzzles, progress.currentPuzzleId]);

  // SVG Path generator connecting nodes in visible range
  const pathD = useMemo(() => {
    if (visibleNodes.length < 2) return '';
    const points = visibleNodes.map((n) => n.pos);
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const midY = (p1.y + p2.y) / 2;
      d += ` C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [visibleNodes]);

  const currentLevelInfo = getLevelForPuzzleId(progress.currentPuzzleId);
  const solvedCount = Object.keys(progress.solvedPuzzles).length;

  return (
    <div className="relative w-full h-[calc(100vh-64px)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Level Selector Pills Strip */}
      <div className="z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => {
              const cfg = LEVEL_CONFIGS[lvl];
              const isCurrentLvl = currentLevelInfo.level === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => scrollToPuzzle(cfg.range[0])}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isCurrentLvl
                      ? 'bg-slate-800 text-white border-emerald-500/70 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span style={{ color: cfg.color }} className="mr-1">●</span>
                  <span>{lvl}</span>
                  <span className="text-[10px] text-slate-400 ml-1 hidden sm:inline">
                    {cfg.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 text-xs text-slate-300">
            <span className="text-slate-400">Total:</span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">
              {solvedCount}
            </span>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-slate-400 tabular-nums">1.200</span>
          </div>
        </div>
      </div>

      {/* Main Virtualized Map Canvas Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        <div
          className="relative w-full mx-auto"
          style={{ height: TOTAL_MAP_HEIGHT, maxWidth: 640 }}
        >
          {/* Centered coordinate origin for winding path */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full h-full">
            
            {/* SVG Connecting Path Line */}
            <svg
              className="absolute left-1/2 top-0 -translate-x-1/2 overflow-visible pointer-events-none"
              style={{ width: PATH_AMPLITUDE * 2 + 100, height: TOTAL_MAP_HEIGHT }}
            >
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="25%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="75%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <path
                d={pathD}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="4 6"
                className="opacity-40"
              />
            </svg>

            {/* Virtualized Nodes */}
            {visibleNodes.map((node) => {
              const { id, pos, isSolved, isCurrent, isUnlocked, record, levelInfo, isMilestone, isLevelStart } = node;

              return (
                <React.Fragment key={id}>
                  {/* Level Gateway Banner (placed cleanly above the start node with zero overlap) */}
                  {isLevelStart && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 z-10 w-[92%] max-w-md p-4 rounded-3xl border shadow-2xl backdrop-blur-md transition-all"
                      style={{
                        top: pos.y - 170, // 170px above node position so it NEVER overlaps Node or Mascot!
                        backgroundColor: '#090d16fa',
                        borderColor: `${levelInfo.color}70`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-slate-950 shadow-md text-sm"
                            style={{ backgroundColor: levelInfo.color }}
                          >
                            {levelInfo.level}
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                              <span>Nivel {levelInfo.level}: {levelInfo.name}</span>
                            </h2>
                            <p className="text-xs text-slate-400">
                              {levelInfo.subtitle} · Crucigramas {levelInfo.range[0]}–{levelInfo.range[1]}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            200 Puzzles
                          </span>
                        </div>
                      </div>
                      <p className="mt-2.5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                        {levelInfo.description}
                      </p>
                    </div>
                  )}

                  {/* Milestone Banner at multiples of 50 */}
                  {isMilestone && !isLevelStart && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-slate-900/95 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-sm pointer-events-none"
                      style={{ top: pos.y - 56 }}
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hito #{id} · ¡Recompensa Especial de Monedas!</span>
                    </div>
                  )}

                  {/* Node Container positioned along the sine wave */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-transform duration-300"
                    style={{
                      left: `calc(50% + ${pos.x}px)`,
                      top: pos.y,
                    }}
                  >
                    {/* Lexi Owl Mascot token perched on current puzzle */}
                    {isCurrent && (
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none animate-bounce">
                        <div className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg whitespace-nowrap mb-1">
                          ¡Tu Turno!
                        </div>
                        <img
                          src="/src/assets/images/mascot_lexi_owl_1792847023254.jpg"
                          alt="Lexi Mascota"
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full border-2 border-emerald-400 shadow-xl object-cover bg-slate-800"
                        />
                      </div>
                    )}

                    {/* Node Button */}
                    <button
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => {
                        SoundEngine.playType(progress.soundEnabled);
                        onSelectPuzzle(id);
                      }}
                      className={`relative flex flex-col items-center justify-center rounded-3xl transition-all shadow-xl group ${
                        isMilestone ? 'w-16 h-16' : 'w-14 h-14'
                      } ${
                        isCurrent
                          ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 ring-4 ring-emerald-400/50 shadow-emerald-500/30 scale-110 z-20 animate-pulse'
                          : isSolved
                          ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 border-2 border-amber-300 hover:scale-105'
                          : isUnlocked
                          ? 'bg-slate-800 text-slate-200 border-2 border-slate-600 hover:border-slate-400 hover:scale-105'
                          : 'bg-slate-900/90 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {/* Icon or Puzzle Number */}
                      {!isUnlocked ? (
                        <Lock className="w-5 h-5 text-slate-600" />
                      ) : isCurrent ? (
                        <Play className="w-6 h-6 fill-slate-950 text-slate-950 ml-0.5" />
                      ) : (
                        <span className="font-mono font-black text-sm tracking-tight">
                          {id}
                        </span>
                      )}

                      {/* Solved Stars Badge under node */}
                      {isSolved && record && (
                        <div className="absolute -bottom-2.5 flex items-center gap-0.5 bg-slate-950/90 px-1.5 py-0.5 rounded-full border border-amber-400/40 shadow-sm">
                          {[1, 2, 3].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`w-2.5 h-2.5 ${
                                starIdx <= record.stars
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>

                    {/* Small level tag beside node */}
                    <span className="absolute -right-7 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 pointer-events-none">
                      #{id}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}

          </div>
        </div>
      </div>

      {/* Floating Action Button: Quick Jump to Current Puzzle */}
      <div className="absolute bottom-6 right-6 z-30">
        <button
          onClick={() => scrollToPuzzle(progress.currentPuzzleId, true)}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 group"
        >
          <Target className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          <span>Ir al Crucigrama #{progress.currentPuzzleId}</span>
        </button>
      </div>

    </div>
  );
};
