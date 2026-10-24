import React, { useState, useMemo } from 'react';
import { Search, Volume2, Sparkles, BookOpen, Layers, RotateCcw, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { CEFRLevel, UserProgress, WordEntry } from '../types';
import { getWordById, getAllWords } from '../data/wordBank';
import { speakEnglishWord, SoundEngine } from '../utils/sound';

interface VocabularyScreenProps {
  progress: UserProgress;
  onBackToMap: () => void;
}

export const VocabularyScreen: React.FC<VocabularyScreenProps> = ({
  progress,
  onBackToMap,
}) => {
  const [activeTab, setActiveTab] = useState<'dictionary' | 'flashcards'>('dictionary');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Retrieve user's learned words
  const learnedWordsList: WordEntry[] = useMemo(() => {
    const list: WordEntry[] = [];
    const seen = new Set<string>();

    progress.learnedWords.forEach((id) => {
      const entry = getWordById(id);
      if (entry && !seen.has(entry.word)) {
        seen.add(entry.word);
        list.push(entry);
      }
    });

    // If no words yet (e.g. brand new user), show starter samples from A1
    if (list.length === 0) {
      const sample = getAllWords().slice(0, 6);
      return sample;
    }

    return list;
  }, [progress.learnedWords]);

  // Filtered dictionary words
  const filteredWords = useMemo(() => {
    return learnedWordsList.filter((item) => {
      const matchesLevel = selectedLevel === 'ALL' || item.level === selectedLevel;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.word.toLowerCase().includes(q) ||
        item.spanish.toLowerCase().includes(q) ||
        item.clue.toLowerCase().includes(q);
      return matchesLevel && matchesQuery;
    });
  }, [learnedWordsList, selectedLevel, searchQuery]);

  const currentFlashcard = learnedWordsList[flashcardIndex % learnedWordsList.length];

  const handleNextCard = () => {
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev + 1) % learnedWordsList.length);
    SoundEngine.playType(progress.soundEnabled);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev - 1 + learnedWordsList.length) % learnedWordsList.length);
    SoundEngine.playType(progress.soundEnabled);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-slate-100 p-4 sm:p-6 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col gap-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-teal-400" />
              <span>Mi Vocabulario</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Colección de {learnedWordsList.length} palabras aprendidas a lo largo de tu viaje
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('dictionary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'dictionary'
                  ? 'bg-slate-800 text-teal-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Diccionario</span>
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'flashcards'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tarjetas de Repaso</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DICTIONARY LIST */}
        {activeTab === 'dictionary' && (
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar palabra en inglés o traducción en español..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
                />
              </div>

              {/* CEFR Level filter */}
              <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as (CEFRLevel | 'ALL')[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedLevel === lvl
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {lvl === 'ALL' ? 'Todos' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Word Grid Cards */}
            {filteredWords.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 my-8">
                <p className="text-sm font-medium text-slate-300">
                  No se encontraron palabras para los filtros aplicados.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ¡Resuelve más crucigramas en el mapa para expandir tu léxico!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredWords.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-white font-sans tracking-wide">
                              {item.word}
                            </h3>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700/60">
                              {item.level}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-amber-300">
                            {item.spanish}
                          </span>
                        </div>

                        <button
                          type="button"
                          title={`Pronunciar ${item.word}`}
                          onClick={() => speakEnglishWord(item.word)}
                          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-teal-300 hover:bg-slate-700 transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                        {item.clue}
                      </p>
                    </div>

                    {item.example && (
                      <p className="mt-3 pt-2 text-[11px] text-slate-400 italic border-t border-slate-800/80">
                        "{item.example}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: FLASHCARD / SPACED REPETITION MODE */}
        {activeTab === 'flashcards' && currentFlashcard && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full py-4">
            
            <div className="flex items-center justify-between w-full mb-3 text-xs text-slate-400">
              <span>
                Tarjeta {flashcardIndex + 1} de {learnedWordsList.length}
              </span>
              <span className="font-mono text-teal-400">
                Nivel {currentFlashcard.level}
              </span>
            </div>

            {/* Flashcard container */}
            <div
              onClick={() => {
                setIsFlipped(!isFlipped);
                SoundEngine.playType(progress.soundEnabled);
              }}
              className="relative w-full h-80 rounded-3xl bg-slate-900 border-2 border-slate-800 hover:border-teal-500/50 cursor-pointer shadow-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 select-none group"
            >
              {!isFlipped ? (
                <div className="flex flex-col items-center gap-4">
                  <span className="text-xs uppercase font-mono tracking-widest text-teal-400 font-bold">
                    Inglés
                  </span>
                  <h2 className="text-4xl font-black text-white tracking-wide">
                    {currentFlashcard.word}
                  </h2>
                  <button
                    type="button"
                    title="Escuchar pronunciación"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakEnglishWord(currentFlashcard.word);
                    }}
                    className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-teal-300 shadow-md transition-colors"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                  <p className="text-xs text-slate-400 mt-2">
                    Toca la tarjeta para ver significado y ejemplo
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                    Español & Definición
                  </span>
                  <h3 className="text-2xl font-bold text-amber-300">
                    {currentFlashcard.spanish}
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed max-w-md">
                    {currentFlashcard.clue}
                  </p>
                  {currentFlashcard.example && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 italic">
                      "{currentFlashcard.example}"
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Toca para volver a voltear
                  </p>
                </div>
              )}
            </div>

            {/* Flashcard Navigation */}
            <div className="flex items-center justify-between w-full mt-6 gap-4">
              <button
                onClick={handlePrevCard}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <button
                onClick={() => {
                  setIsFlipped(!isFlipped);
                  SoundEngine.playType(progress.soundEnabled);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Voltear</span>
              </button>

              <button
                onClick={handleNextCard}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
