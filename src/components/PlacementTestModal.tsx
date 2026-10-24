import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, ArrowRight, X } from 'lucide-react';
import { CEFRLevel } from '../types';
import { LEVEL_CONFIGS } from '../data/levels';
import { SoundEngine } from '../utils/sound';

interface PlacementTestModalProps {
  onClose: () => void;
  onApplyLevel: (level: CEFRLevel) => void;
  soundEnabled: boolean;
}

interface Question {
  level: CEFRLevel;
  prompt: string;
  options: string[];
  correctIndex: number;
}

const QUESTIONS: Question[] = [
  {
    level: 'A1',
    prompt: '¿Cómo se dice "Manzana" en inglés?',
    options: ['APPLE', 'WATER', 'HORSE', 'CHAIR'],
    correctIndex: 0,
  },
  {
    level: 'A2',
    prompt: 'Completa la frase: "Show your valid _____ at airport customs."',
    options: ['RECEIPT', 'PASSPORT', 'GARDEN', 'RECIPE'],
    correctIndex: 1,
  },
  {
    level: 'B1',
    prompt: '¿Qué verbo significa "lograr un objetivo con esfuerzo y dedicación"?',
    options: ['RECYCLE', 'SURVIVE', 'ACHIEVE', 'DISCOVER'],
    correctIndex: 2,
  },
  {
    level: 'B2',
    prompt: 'Selecciona el término para "sostenible / respetuoso con los recursos naturales":',
    options: ['ACCURATE', 'RELUCTANT', 'SUSTAINABLE', 'EFFICIENT'],
    correctIndex: 2,
  },
  {
    level: 'C1',
    prompt: 'Elige la palabra para "un marco o modelo conceptual fundamental" (Paradigma):',
    options: ['PARADIGM', 'CONSENSUS', 'ANOMALY', 'SCRUTINY'],
    correctIndex: 0,
  },
  {
    level: 'C2',
    prompt: '¿Qué significa la palabra "EPHEMERAL"?',
    options: [
      'Que dura un tiempo muy breve o pasajero',
      'Un remedio para todos los males',
      'Un laberinto sin salida aparente',
      'Una coincidencia afortunada',
    ],
    correctIndex: 0,
  },
];

export const PlacementTestModal: React.FC<PlacementTestModalProps> = ({
  onClose,
  onApplyLevel,
  soundEnabled,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleSelectOption = (optionIndex: number) => {
    SoundEngine.playType(soundEnabled);
    const newAnswers = [...selectedAnswers, optionIndex];
    setSelectedAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsFinished(true);
      SoundEngine.playPuzzleWon(soundEnabled);
    }
  };

  // Determine placement based on score
  const correctCount = selectedAnswers.filter(
    (ans, idx) => ans === QUESTIONS[idx].correctIndex
  ).length;

  let assignedLevel: CEFRLevel = 'A1';
  if (correctCount >= 6) assignedLevel = 'C2';
  else if (correctCount >= 5) assignedLevel = 'C1';
  else if (correctCount >= 4) assignedLevel = 'B2';
  else if (correctCount >= 3) assignedLevel = 'B1';
  else if (correctCount >= 2) assignedLevel = 'A2';
  else assignedLevel = 'A1';

  const assignedConfig = LEVEL_CONFIGS[assignedLevel];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar test de nivel"
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isFinished ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-400">
                Test de Nivelación Rápida
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Pregunta {currentStep + 1} de {QUESTIONS.length}</span>
              <span className="font-mono text-slate-300">
                Nivel evaluado: {QUESTIONS[currentStep].level}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question prompt */}
            <h3 className="text-base font-bold text-white mb-5 leading-snug">
              {QUESTIONS[currentStep].prompt}
            </h3>

            {/* Options */}
            <div className="space-y-2.5">
              {QUESTIONS[currentStep].options.map((opt, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className="w-full p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left text-xs font-semibold text-slate-200 transition-all hover:scale-[1.01]"
                >
                  <span className="font-mono text-emerald-400 mr-2">
                    {String.fromCharCode(65 + optIdx)}.
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Results screen */
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center font-black text-2xl text-slate-950 shadow-xl mb-3"
              style={{ backgroundColor: assignedConfig.color }}
            >
              {assignedLevel}
            </div>

            <h2 className="text-xl font-black text-white">
              ¡Tu Nivel Recomendado es {assignedLevel}!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Acertaste {correctCount} de {QUESTIONS.length} preguntas correctamente.
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">
                  {assignedConfig.name} ({assignedConfig.subtitle})
                </span>
                <span className="text-[11px] font-mono" style={{ color: assignedConfig.color }}>
                  Crucigramas {assignedConfig.range[0]}–{assignedConfig.range[1]}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {assignedConfig.description}
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Mantener progreso actual
              </button>

              <button
                onClick={() => onApplyLevel(assignedLevel)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Desbloquear y saltar a {assignedLevel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
