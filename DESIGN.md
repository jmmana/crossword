# AqueLingua · Crossword: integración visual

La interfaz utiliza superficies blancas, fondo lavanda, acentos violeta y navegación lateral. El selector sol/luna conserva el tema existente en `crosspath_progress_v1`. El modo claro se aplica a usuarios nuevos; la preferencia oscura guardada se respeta.

La bienvenida, el mapa, el crucigrama, el vocabulario y los modales comparten la paleta. Se mantienen el banco A1–C2, los 1.200 niveles, el generador, las monedas, el test de nivel y las partidas guardadas. No se sustituyen por datos de demostración.

El tablero recibe ocho columnas de las doce de la distribución de escritorio y las pistas cuatro. Las dimensiones de las celdas dependen del crucigrama, no de la selección o la corrección; los estados no alteran su tamaño. En móvil se apilan tablero y pistas. La navegación deja de ser fija en pantallas pequeñas.

La bienvenida usa una composición de letras en CSS, sin dependencias de nuevas imágenes. La mascota existente del mapa se sirve desde public/assets para que su URL funcione también después de compilar. No se agregan binarios.

## Validación local

- npm install: correcto tras alinear esbuild con la versión de Vite declarada.
- npm run lint: TypeScript sin errores.
- npm run build: producción compilada.
- Prueba DOM con jsdom: bienvenida, entrada al mapa, tema claro inicial, cambio a oscuro persistente, regreso a claro, vocabulario, sonido y apertura del crucigrama del generador original.
- Revisión visual en navegador real pendiente: la descarga del ejecutable Chromium falló en este entorno. Comprobar escritorio y móvil antes de publicar.

No se añadieron ni ejecutaron workflows de GitHub Actions. No se despliega ni se fusiona automáticamente este cambio.
