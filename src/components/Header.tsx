import React from "react";
import {
  Flame,
  Coins,
  BookOpen,
  Map as MapIcon,
  Settings as SettingsIcon,
  Award,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Puzzle,
  ArrowUpRight,
} from "lucide-react";
import { UserProgress } from "../types";
interface HeaderProps {
  progress: UserProgress;
  activeTab: "map" | "puzzle" | "vocab" | "placement";
  onSelectTab: (tab: "map" | "puzzle" | "vocab" | "placement") => void;
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
  const solved = Object.keys(progress.solvedPuzzles).length;
  return (
    <aside className="aql-sidebar" aria-label="Navegación principal">
      <button
        className="aql-brand"
        onClick={() => onSelectTab("map")}
        aria-label="AqueLingua: ir al mapa"
      >
        <span className="aql-brand-icon">
          <Puzzle size={25} />
        </span>
        <span>
          aque<strong>lingua</strong>
          <small>LEARN TOGETHER</small>
        </span>
      </button>
      <span className="aql-nav-label">TU AVENTURA EN INGLÉS</span>
      <nav>
        {(
          [
            { id: "map", label: "Ruta A1–C2", icon: MapIcon },
            { id: "vocab", label: "Mi vocabulario", icon: BookOpen },
            { id: "placement", label: "Test de nivel", icon: Award },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={activeTab === id ? "is-active" : ""}
            aria-current={activeTab === id ? "page" : undefined}
            onClick={() => onSelectTab(id)}
          >
            <Icon size={19} />
            {label}
            <ArrowUpRight size={13} />
          </button>
        ))}
        {activeTab === "puzzle" && (
          <div className="aql-current-game">
            <Puzzle size={17} /> Crucigrama en curso
          </div>
        )}
      </nav>
      <section className="aql-sidebar-progress">
        <span>Tu recorrido</span>
        <strong>
          {solved}
          <small> / 1.200 completados</small>
        </strong>
        <progress
          aria-label="Crucigramas completados"
          max={1200}
          value={solved}
        />
        <p>Una palabra más cerca de tu meta.</p>
      </section>
      <div className="aql-resources">
        <span title="Racha de días">
          <Flame size={17} />
          {progress.streak}
          <small>días</small>
        </span>
        <span title="Monedas para pistas">
          <Coins size={17} />
          {progress.coins}
          <small>monedas</small>
        </span>
      </div>
      <div className="aql-sidebar-footer">
        <button onClick={onOpenSettings}>
          <SettingsIcon size={18} />
          Ajustes
        </button>
        <div className="aql-theme-controls">
          <button
            onClick={onToggleTheme}
            aria-label={
              progress.theme === "light"
                ? "Cambiar a modo oscuro"
                : "Cambiar a modo claro"
            }
          >
            {progress.theme === "light" ? (
              <Moon size={19} />
            ) : (
              <Sun size={19} />
            )}
            <span>{progress.theme === "light" ? "Oscuro" : "Claro"}</span>
          </button>
          <button
            onClick={onToggleSound}
            aria-pressed={progress.soundEnabled}
            aria-label={
              progress.soundEnabled ? "Silenciar sonidos" : "Activar sonidos"
            }
          >
            {progress.soundEnabled ? (
              <Volume2 size={19} />
            ) : (
              <VolumeX size={19} />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
