# AqueLingua · Rediseño completo de Crossword

## Pantallas y estados incluidos

| Vista                | Tratamiento visual                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Bienvenida           | Composición de letras, tarjetas de beneficios, botones violeta                               |
| Ruta A1–C2           | Cabecera, tres indicadores reales, panel Continuar, selector de niveles y retos paginados    |
| Partida              | Panel de pista, espacio fijo de feedback, tablero principal, herramientas y pistas uniformes |
| Vocabulario          | Búsqueda y filtros, tarjetas de 240 px, ejemplos y audio                                     |
| Tarjetas de repaso   | Frente y reverso de altura constante, navegación y estado vacío                              |
| Test de nivel        | Modal claro, opciones de tamaño fijo, progreso y resultado                                   |
| Ajustes              | Indicadores y preferencias con las mismas superficies y tipografía                           |
| Resultado de partida | Estrellas, monedas reales, palabras aprendidas y acciones de continuidad                     |
| Móvil                | Navegación adaptable, tablero ajustado al ancho, teclado y pistas apiladas                   |
| Oscuro               | Las mismas vistas mediante tokens de tema y selector persistente                             |

El modo claro sigue siendo predeterminado para nuevos usuarios. La preferencia existente se respeta. Las superficies de los componentes ya usan clases semánticas ui-*; no dependen únicamente de una sustitución parcial de colores oscuros.

## Distribución y estabilidad

Los 1.200 crucigramas se conservan. La ruta permite elegir nivel y recorrer 20 retos por página. Respeta los bloqueos y las estrellas existentes. No se cambia el banco de palabras ni el generador.

Las tarjetas de retos, vocabulario, opciones del test y pistas tienen dimensiones uniformes en su vista. El espacio de feedback permanece montado antes y después de comprobar una letra. Las celdas dependen del ancho disponible y del tamaño del puzzle; seleccionar o comprobar no cambia sus dimensiones. Se eliminó la escala de la casilla seleccionada. El tablero se ajusta con ResizeObserver y permite desplazamiento interno para puzzles que excedan el mínimo legible.

Se corrigieron dos problemas detectados al recorrer la partida: la función de guardado provocaba un bucle de render y cambiar a otro crucigrama no reiniciaba el estado local del componente. Se preservan las partidas, monedas y vocabulario existentes. El confeti se limpia al salir del resultado y respeta el movimiento reducido.

## Validación

- npm run lint: correcto.
- npm run build: correcto.
- npm run test:ui: tres pruebas Playwright superadas contra el build de producción.
- Navegador Chromium real, escritorio 1440 × 1000 y móvil 390 × 844.
- Flujo real: resolver puzzle generado, victoria, colección, giro de tarjetas, test y resultado, tema y móvil.
- Comprobaciones de estabilidad del tablero, altura uniforme de tarjetas, tema persistente y ausencia de errores JS.
- Revisión visual de capturas internas de ruta, partida, vocabulario, test, ajustes, resultados, repaso y móvil.

No se agregan ni ejecutan workflows de GitHub Actions. La integración en main no implica desplegar un servicio externo.
