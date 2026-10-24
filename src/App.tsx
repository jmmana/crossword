import React, { useState, useEffect, useMemo } from 'react';
import { CEFRLevel, PuzzleData, UserProgress } from './types';
import {
  loadUserProgress,
  saveUserProgress,
  completePuzzleRecord,
  applyPlacementLevel,
  DEFAULT_PROGRESS,
} from './utils/storage';
import { getOrGeneratePuzzle } from './utils/crosswordGenerator';
import { Header } from './components/Header';
import { MapScreen } from './components/MapScreen';
import { PuzzleScreen } from './components/PuzzleScreen';
import { WordReviewModal } from './components/WordReviewModal';
import { VocabularyScreen } from './components/VocabularyScreen';
import { PlacementTestModal } from './components/PlacementTestModal';
import { SettingsModal } from './components/SettingsModal';
import { IntroScreen } from './components/IntroScreen';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress);

  // If user has never solved a puzzle, show intro screen first
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    return Object.keys(progress.solvedPuzzles).length === 0;
  });

  const [activeTab, setActiveTab] = useState<'map' | 'puzzle' | 'vocab' | 'placement'>('map');
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);

  // Solved review modal state
  const [victoryData, setVictoryData] = useState<{
    puzzle: PuzzleData;
    stars: number;
    coinsEarned: number;
    timeSecs: number;
    hintsUsed: number;
  } | null>(null);

  // Sync theme with document class
  useEffect(() => {
    if (progress.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [progress.theme]);

  // Active puzzle data
  const currentPuzzleData = useMemo(() => {
    if (selectedPuzzleId) {
      return getOrGeneratePuzzle(selectedPuzzleId);
    }
    return null;
  }, [selectedPuzzleId]);

  // Handlers
  const handleSelectPuzzle = (puzzleId: number) => {
    setSelectedPuzzleId(puzzleId);
    setActiveTab('puzzle');
  };

  const handleBackToMap = () => {
    setActiveTab('map');
    setSelectedPuzzleId(null);
  };

  const handlePuzzleSolved = (
    stars: number,
    hintsUsed: number,
    timeSecs: number,
    wordIds: string[]
  ) => {
    if (!selectedPuzzleId || !currentPuzzleData) return;

    const { nextProgress, coinsEarned } = completePuzzleRecord(
      progress,
      selectedPuzzleId,
      stars,
      hintsUsed,
      timeSecs,
      wordIds
    );

    setProgress(nextProgress);
    setVictoryData({
      puzzle: currentPuzzleData,
      stars,
      coinsEarned,
      timeSecs,
      hintsUsed,
    });
  };

  const handleNextPuzzle = () => {
    if (!selectedPuzzleId) return;
    setVictoryData(null);
    const nextId = selectedPuzzleId + 1;
    if (nextId <= 1200) {
      setSelectedPuzzleId(nextId);
      setActiveTab('puzzle');
    } else {
      setActiveTab('map');
      setSelectedPuzzleId(null);
    }
  };

  const handleUpdateCoins = (newCoins: number) => {
    const updated = { ...progress, coins: newCoins };
    setProgress(updated);
    saveUserProgress(updated);
  };

  const handleSaveInProgress = (puzzleId: number, grid: Record<string, string>) => {
    // Only save if puzzle is not already completed
    if (progress.solvedPuzzles[puzzleId]) return;
    const updated = {
      ...progress,
      inProgressGrids: {
        ...progress.inProgressGrids,
        [puzzleId]: grid,
      },
    };
    setProgress(updated);
    saveUserProgress(updated);
  };

  const handleToggleSound = () => {
    const updated: UserProgress = {
      ...progress,
      soundEnabled: !progress.soundEnabled,
    };
    setProgress(updated);
    saveUserProgress(updated);
  };

  const handleToggleTheme = () => {
    const nextTheme: 'dark' | 'light' = progress.theme === 'dark' ? 'light' : 'dark';
    const updated: UserProgress = {
      ...progress,
      theme: nextTheme,
    };
    setProgress(updated);
    saveUserProgress(updated);
  };

  const handleResetProgress = () => {
    setProgress(DEFAULT_PROGRESS);
    saveUserProgress(DEFAULT_PROGRESS);
    setSelectedPuzzleId(null);
    setActiveTab('map');
  };

  const handleApplyPlacementLevel = (level: CEFRLevel) => {
    const next = applyPlacementLevel(progress, level);
    setProgress(next);
    setShowPlacementModal(false);
    setShowIntro(false);
    setActiveTab('map');
  };

  // If showing intro screen on very first visit
  if (showIntro) {
    return (
      <div className="aql-intro-shell w-full min-h-screen bg-slate-950">
        <IntroScreen
          onStartGame={() => {
            setShowIntro(false);
            setActiveTab('map');
          }}
          onOpenPlacementTest={() => {
            setShowPlacementModal(true);
          }}
        />

        {showPlacementModal && (
          <PlacementTestModal
            onClose={() => setShowPlacementModal(false)}
            onApplyLevel={handleApplyPlacementLevel}
            soundEnabled={progress.soundEnabled}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`aql-app w-full min-h-screen flex flex-col ${progress.theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      
      {/* Top Navigation Bar */}
      <Header
        progress={progress}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'placement') {
            setShowPlacementModal(true);
          } else {
            setActiveTab(tab);
            if (tab !== 'puzzle') {
              setSelectedPuzzleId(null);
            }
          }
        }}
        onOpenSettings={() => setShowSettings(true)}
        onToggleSound={handleToggleSound}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Area */}
      <main className="aql-main flex-1 w-full relative">
        {activeTab === 'map' && (
          <MapScreen
            progress={progress}
            onSelectPuzzle={handleSelectPuzzle}
            onOpenPlacementTest={() => setShowPlacementModal(true)}
          />
        )}

        {activeTab === 'puzzle' && currentPuzzleData && (
          <PuzzleScreen
            puzzle={currentPuzzleData}
            progress={progress}
            onBackToMap={handleBackToMap}
            onPuzzleSolved={handlePuzzleSolved}
            onUpdateCoins={handleUpdateCoins}
            onSaveInProgress={handleSaveInProgress}
          />
        )}

        {activeTab === 'vocab' && (
          <VocabularyScreen
            progress={progress}
            onBackToMap={handleBackToMap}
          />
        )}
      </main>

      {/* Post-Solve Word Review Celebration Modal */}
      {victoryData && (
        <WordReviewModal
          puzzle={victoryData.puzzle}
          stars={victoryData.stars}
          coinsEarned={victoryData.coinsEarned}
          timeSecs={victoryData.timeSecs}
          hintsUsed={victoryData.hintsUsed}
          soundEnabled={progress.soundEnabled}
          onNextPuzzle={handleNextPuzzle}
          onBackToMap={() => {
            setVictoryData(null);
            handleBackToMap();
          }}
          onGoToVocab={() => {
            setVictoryData(null);
            setActiveTab('vocab');
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          progress={progress}
          onClose={() => setShowSettings(false)}
          onToggleSound={handleToggleSound}
          onToggleTheme={handleToggleTheme}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* Placement Test Modal */}
      {showPlacementModal && (
        <PlacementTestModal
          onClose={() => setShowPlacementModal(false)}
          onApplyLevel={handleApplyPlacementLevel}
          soundEnabled={progress.soundEnabled}
        />
      )}

    </div>
  );
}
