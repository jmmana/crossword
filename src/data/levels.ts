import { LevelInfo } from '../types';

export const LEVEL_CONFIGS: Record<string, LevelInfo> = {
  A1: {
    level: 'A1',
    name: 'Seedling',
    subtitle: 'Semilla · Principiante',
    color: '#10b981', // emerald
    accentColor: 'emerald',
    bgGradient: 'from-emerald-950/20 via-teal-900/10 to-slate-950',
    range: [1, 200],
    description: 'Vocabulario básico diario: familia, colores, comida, hogar y animales.',
  },
  A2: {
    level: 'A2',
    name: 'Explorer',
    subtitle: 'Explorador · Elemental',
    color: '#06b6d4', // cyan / teal
    accentColor: 'cyan',
    bgGradient: 'from-cyan-950/20 via-sky-900/10 to-slate-950',
    range: [201, 400],
    description: 'Rutinas, viajes, aficiones, clima, compras y descripción de lugares.',
  },
  B1: {
    level: 'B1',
    name: 'Adventurer',
    subtitle: 'Aventurero · Intermedio',
    color: '#3b82f6', // blue
    accentColor: 'blue',
    bgGradient: 'from-blue-950/20 via-indigo-900/10 to-slate-950',
    range: [401, 600],
    description: 'Trabajo, emociones, tecnología, educación, transporte y medio ambiente.',
  },
  B2: {
    level: 'B2',
    name: 'Navigator',
    subtitle: 'Navegante · Intermedio Alto',
    color: '#8b5cf6', // purple
    accentColor: 'purple',
    bgGradient: 'from-purple-950/20 via-fuchsia-900/10 to-slate-950',
    range: [601, 800],
    description: 'Sociedad, medios, ciencia, psicología, matices de opinión y phrasal verbs.',
  },
  C1: {
    level: 'C1',
    name: 'Master',
    subtitle: 'Maestro · Avanzado',
    color: '#f59e0b', // amber
    accentColor: 'amber',
    bgGradient: 'from-amber-950/20 via-orange-900/10 to-slate-950',
    range: [801, 1000],
    description: 'Ámbito académico, diplomacia, modismos sofisticados y argumentación compleja.',
  },
  C2: {
    level: 'C2',
    name: 'Legend',
    subtitle: 'Leyenda · Maestría',
    color: '#e11d48', // rose / crimson / gold
    accentColor: 'rose',
    bgGradient: 'from-rose-950/20 via-red-900/10 to-slate-950',
    range: [1001, 1200],
    description: 'Literatura clásica, términos de alta precisión, filosofía y léxico erudito.',
  },
};

export function getLevelForPuzzleId(puzzleId: number): LevelInfo {
  if (puzzleId <= 200) return LEVEL_CONFIGS.A1;
  if (puzzleId <= 400) return LEVEL_CONFIGS.A2;
  if (puzzleId <= 600) return LEVEL_CONFIGS.B1;
  if (puzzleId <= 800) return LEVEL_CONFIGS.B2;
  if (puzzleId <= 1000) return LEVEL_CONFIGS.C1;
  return LEVEL_CONFIGS.C2;
}
