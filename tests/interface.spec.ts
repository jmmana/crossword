import { test, expect, Page } from "@playwright/test";
import { getOrGeneratePuzzle } from "../src/utils/crosswordGenerator";
async function start(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Comenzar desde A1" }).click();
  await page.getByRole("button", { name: "Silenciar sonidos" }).click();
}
test("ruta completa: niveles, páginas, tema y ajustes", async ({ page }) => {
  await start(page);
  await expect(page.locator(".ui-puzzle-card")).toHaveCount(20);
  await page.getByRole("button", { name: "C2 Maestría", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Crucigrama 1001", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Siguiente →", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Crucigrama 1021", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cambiar a modo oscuro" }).click();
  await expect(page.locator("html")).toHaveClass("dark");
  await page.reload();
  await page.getByRole("button", { name: "Comenzar desde A1" }).click();
  await expect(page.locator("html")).toHaveClass("dark");
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Ajustes", exact: true }),
  ).toBeVisible();
});
test("partida, feedback estable, victoria, colección y repaso uniforme", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  await page
    .getByRole("button", { name: "Crucigrama 1, continuar", exact: true })
    .click();
  const y = await page
    .locator(".ui-board")
    .evaluate((e) => Math.round(e.getBoundingClientRect().y));
  await page
    .getByRole("button", { name: "Comprobar letra", exact: true })
    .click();
  await expect
    .poll(() =>
      page
        .locator(".ui-board")
        .evaluate((e) => Math.round(e.getBoundingClientRect().y)),
    )
    .toBe(y);
  const puzzle = getOrGeneratePuzzle(1);
  for (const row of puzzle.grid)
    for (const cell of row) {
      if (!cell) continue;
      await page
        .getByRole("button", {
          name: `Fila ${cell.row + 1}, columna ${cell.col + 1}`,
          exact: true,
        })
        .click();
      await page.keyboard.type(cell.char);
    }
  await expect(
    page.getByRole("dialog", { name: "Resultados del crucigrama" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Repasar", exact: true }).click();
  await expect(page.locator(".ui-word-card")).toHaveCount(puzzle.words.length);
  expect(
    await page
      .locator(".ui-word-card")
      .evaluateAll((cs) =>
        cs.every((c) => Math.round(c.getBoundingClientRect().height) === 240),
      ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Tarjetas de Repaso" }).click();
  const h = await page
    .locator(".ui-flashcard")
    .evaluate((e) => e.getBoundingClientRect().height);
  await page.locator(".ui-flashcard").click();
  expect(
    await page
      .locator(".ui-flashcard")
      .evaluate((e) => e.getBoundingClientRect().height),
  ).toBe(h);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});
test("test y resultado tienen el mismo diseño en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await page
    .getByRole("button", { name: "Test de nivel", exact: true })
    .click();
  for (const text of [
    "APPLE",
    "PASSPORT",
    "ACHIEVE",
    "SUSTAINABLE",
    "PARADIGM",
    "Que dura un tiempo muy breve o pasajero",
  ])
    await page.getByRole("button", { name: new RegExp(text) }).click();
  await expect(
    page.getByRole("heading", { name: "¡Tu Nivel Recomendado es C2!" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Mantener progreso actual" }).click();
  await expect(page.locator(".ui-route-page")).toBeVisible();
});
