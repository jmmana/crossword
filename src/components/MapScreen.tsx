import React, { useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  Lock,
  Play,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { CEFRLevel, UserProgress } from "../types";
import { LEVEL_CONFIGS, getLevelForPuzzleId } from "../data/levels";
import { SoundEngine } from "../utils/sound";
interface MapScreenProps {
  progress: UserProgress;
  onSelectPuzzle: (id: number) => void;
  onOpenPlacementTest: () => void;
}
export const MapScreen: React.FC<MapScreenProps> = ({
  progress,
  onSelectPuzzle,
  onOpenPlacementTest,
}) => {
  const current = getLevelForPuzzleId(progress.currentPuzzleId);
  const [level, setLevel] = useState<CEFRLevel>(current.level);
  const [page, setPage] = useState(
    Math.floor((progress.currentPuzzleId - current.range[0]) / 20),
  );
  const config = LEVEL_CONFIGS[level];
  const solvedCount = Object.keys(progress.solvedPuzzles).length;
  const levelSolved = Object.keys(progress.solvedPuzzles).filter(
    (id) => Number(id) >= config.range[0] && Number(id) <= config.range[1],
  ).length;
  function choose(l: CEFRLevel) {
    setLevel(l);
    const cfg = LEVEL_CONFIGS[l];
    setPage(
      l === current.level
        ? Math.floor((progress.currentPuzzleId - cfg.range[0]) / 20)
        : 0,
    );
  }
  const first = config.range[0] + page * 20;
  return (
    <div className="ui-route-page">
      <header className="ui-view-heading">
        <div>
          <span className="ui-eyebrow">TU RUTA / CRUCIGRAMAS</span>
          <h1>
            Un nuevo idioma, palabra a palabra<span>.</span>
          </h1>
          <p>
            Elige tu siguiente reto. Cada crucigrama abre nuevas conexiones.
          </p>
        </div>
        <button className="ui-secondary" onClick={onOpenPlacementTest}>
          <Award size={18} />
          Encontrar mi nivel
        </button>
      </header>
      <div className="ui-stat-grid">
        <section className="ui-stat-card">
          <span className="ui-stat-icon">
            <Target />
          </span>
          <div>
            <small>Crucigramas completados</small>
            <strong>
              {solvedCount}
              <em> / 1.200</em>
            </strong>
          </div>
        </section>
        <section className="ui-stat-card">
          <span className="ui-stat-icon cyan">
            <BookOpen />
          </span>
          <div>
            <small>Palabras aprendidas</small>
            <strong>{progress.learnedWords.length}</strong>
          </div>
        </section>
        <section className="ui-stat-card">
          <span className="ui-stat-icon gold">
            <Trophy />
          </span>
          <div>
            <small>Tu nivel actual</small>
            <strong>
              {current.level}
              <em>
                {" "}
                · {current.subtitle.split("·")[1]?.trim() || current.name}
              </em>
            </strong>
          </div>
        </section>
      </div>
      <section className="ui-route-hero">
        <div>
          <span className="ui-eyebrow">CONTINÚA TU AVENTURA</span>
          <h2>Tu próxima palabra te espera.</h2>
          <p>{current.description}</p>
          <button
            className="ui-primary"
            onClick={() => {
              SoundEngine.playType(progress.soundEnabled);
              onSelectPuzzle(progress.currentPuzzleId);
            }}
          >
            <Play size={17} />
            Continuar crucigrama {progress.currentPuzzleId}
            <ArrowRight size={17} />
          </button>
        </div>
        <div className="ui-route-art" aria-hidden="true">
          <span>A</span>
          <span>B</span>
          <span>C</span>
          <b>✦</b>
        </div>
      </section>
      <section className="ui-levels" aria-label="Seleccionar nivel">
        {(["A1", "A2", "B1", "B2", "C1", "C2"] as CEFRLevel[]).map((l) => (
          <button
            key={l}
            className={level === l ? "is-selected" : ""}
            aria-pressed={level === l}
            onClick={() => choose(l)}
          >
            <strong>{l}</strong>
            <small>
              {LEVEL_CONFIGS[l].subtitle.split("·")[1]?.trim() ||
                LEVEL_CONFIGS[l].name}
            </small>
          </button>
        ))}
      </section>
      <section className="ui-level-panel">
        <div className="ui-section-heading">
          <div>
            <span className="ui-eyebrow">
              {level} · {config.subtitle}
            </span>
            <h2>Tu tablero de retos</h2>
            <p>{config.description}</p>
          </div>
          <span className="ui-level-count">
            {levelSolved} / 200 completados
          </span>
        </div>
        <progress
          value={levelSolved}
          max={200}
          aria-label={`Progreso del nivel ${level}`}
        />
        <div className="ui-puzzle-cards">
          {Array.from({ length: 20 }, (_, i) => first + i).map((id) => {
            const record = progress.solvedPuzzles[id];
            const unlocked = !!record || id <= progress.currentPuzzleId;
            const isCurrent = id === progress.currentPuzzleId;
            return (
              <button
                key={id}
                aria-label={`Crucigrama ${id}${record ? ", completado" : isCurrent ? ", continuar" : ""}`}
                disabled={!unlocked}
                className={
                  "ui-puzzle-card " +
                  (record ? "is-complete " : isCurrent ? "is-current " : "")
                }
                onClick={() => {
                  SoundEngine.playType(progress.soundEnabled);
                  onSelectPuzzle(id);
                }}
              >
                <span className="ui-puzzle-number">
                  {String(id).padStart(2, "0")}
                </span>
                {record ? (
                  <Check size={19} />
                ) : unlocked ? (
                  <Play size={19} />
                ) : (
                  <Lock size={18} />
                )}
                <strong>
                  {record
                    ? "Completado"
                    : isCurrent
                      ? "Continúa aquí"
                      : unlocked
                        ? "Disponible"
                        : "Por desbloquear"}
                </strong>
                <span
                  className="ui-stars"
                  aria-label={
                    record ? `${record.stars} estrellas` : "Sin completar"
                  }
                >
                  {[1, 2, 3].map((n) => (
                    <Star
                      key={n}
                      size={12}
                      fill={
                        record && record.stars >= n ? "currentColor" : "none"
                      }
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
        <div className="ui-page-controls">
          <button
            className="ui-secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Anterior
          </button>
          <span>
            Retos {first}–{first + 19} de {config.range[0]}–{config.range[1]}
          </span>
          <button
            className="ui-secondary"
            disabled={page === 9}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente →
          </button>
        </div>
      </section>
    </div>
  );
};
