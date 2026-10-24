import React from "react";
import { Play, Award, BookOpen, Route, Sparkles, Puzzle } from "lucide-react";
interface IntroScreenProps {
  onStartGame: () => void;
  onOpenPlacementTest: () => void;
}
export const IntroScreen: React.FC<IntroScreenProps> = ({
  onStartGame,
  onOpenPlacementTest,
}) => (
  <div className="aql-intro">
    <header className="aql-intro-brand">
      <Puzzle />{" "}
      <span>
        aque<strong>lingua</strong>
      </span>
      <small>CRUCIGRAMAS / A1–C2</small>
    </header>
    <section className="aql-welcome">
      <div>
        <span className="aql-kicker">PEQUEÑAS PISTAS. GRANDES CONEXIONES.</span>
        <h1>
          Tu siguiente palabra
          <br />
          empieza aquí<span>.</span>
        </h1>
        <p>
          Descubre el inglés letra a letra. Resuelve crucigramas, escucha las
          palabras y construye tu propio vocabulario.
        </p>
        <div className="aql-welcome-actions">
          <button className="aql-primary" onClick={onStartGame}>
            <Play size={18} />
            Comenzar desde A1
          </button>
          <button onClick={onOpenPlacementTest}>
            <Award size={18} />
            Encontrar mi nivel
          </button>
        </div>
        <small>1.200 crucigramas progresivos · Desde A1 hasta C2</small>
      </div>
      <div className="aql-letter-art" aria-hidden="true">
        <span>L</span>
        <span>E</span>
        <span>A</span>
        <span>R</span>
        <span>N</span>
        <i>✦</i>
        <b>
          Un nuevo idioma.
          <br />
          Muchas posibilidades.
        </b>
      </div>
    </section>
    <div className="aql-pillar-grid">
      {[
        {
          Icon: Route,
          title: "Una ruta para ti",
          text: "Seis niveles con un recorrido progresivo. Avanza con cada crucigrama.",
        },
        {
          Icon: Sparkles,
          title: "Pistas que enseñan",
          text: "Definiciones, traducción opcional y audio para conectar ideas.",
        },
        {
          Icon: BookOpen,
          title: "Palabras que se quedan",
          text: "Guarda lo aprendido y vuelve a practicarlo en tu colección.",
        },
      ].map(({ Icon, title, text }) => (
        <article key={title}>
          <Icon />
          <h2>{title}</h2>
          <p>{text}</p>
        </article>
      ))}
    </div>
  </div>
);
