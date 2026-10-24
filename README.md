# AqueLingua · Crossword

Crucigramas progresivos para aprender inglés, con React, TypeScript, Vite y Tailwind. Incluye ruta A1–C2, 1.200 retos, pistas en inglés con traducción opcional, audio, colección de vocabulario, tarjetas de repaso y test de nivel.

## Desarrollo

```sh
npm install
npm run dev
```

También se incluye bun.lock para instalaciones con Bun.

## Comprobaciones

```sh
npm run lint
npm run build
npx playwright install chromium
npm run test:ui
```

Las pruebas de interfaz se ejecutan contra la compilación de producción. Si ya existe un Chromium compatible, se puede indicar su ruta con PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.

## Diseño

Menú lateral claro, selector sol/luna persistente, superficies blancas, tonos lavanda y acciones violeta. El diseño cubre bienvenida, ruta, partida, vocabulario, repaso, test, ajustes y resultados; consulta DESIGN.md para los estados y la validación. En móvil se adapta la navegación y el tablero sin variar el tamaño de las celdas por selección o corrección.

El progreso se guarda localmente en crosspath_progress_v1; no hay sincronización de cuentas ni servidor de partidas. El test de nivel ofrece una orientación rápida, no una certificación MCER. El audio depende de las voces disponibles en el navegador.

Proyecto iniciado con AI Studio y adaptado al sistema visual de AqueLingua.
