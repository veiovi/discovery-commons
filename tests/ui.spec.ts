import { test, expect } from "@playwright/test";
test("transport, repeated controls, seed, filters, lineage and policies", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?autoplay=0&intro=0");
  await expect(
    page.getByRole("heading", { name: "Everyone gets a lab." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Step", exact: true }).click();
  await expect(page.locator("#tick")).toHaveText("Tick 001");
  await page
    .getByRole("button", { name: "Play simulation", exact: true })
    .click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await page.locator("#tick").textContent();
  await page.waitForTimeout(1000);
  await expect(page.locator("#tick")).toHaveText(paused!);
  await page.selectOption("#speed", "4");
  await page
    .getByRole("button", { name: "Play simulation", exact: true })
    .click();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator("#tick")).toHaveText("Tick 000");
  await expect(page.locator("#budget")).toContainText("1,200");
  for (let i = 0; i < 25; i++)
    await page.getByRole("button", { name: "Step", exact: true }).click();
  await page.locator(".claim-row").first().click();
  await expect(page.locator("#inspector")).toContainText("Toy-world audit");
  const parent = page.locator(".parent-link");
  if (await parent.count()) await parent.click();
  await page.selectOption("#filter", "confirmed");
  await expect(page.locator(".claim-row .status").first()).toHaveText(
    "confirmed",
  );
  await page.selectOption("#policy", "originator");
  await page.selectOption("#preset", "Under pressure");
  await expect(page.locator("#tick")).toHaveText("Tick 000");
  await expect(page.locator("#capacity")).toHaveValue("2");
  await page.locator("#seed").fill("99");
  await page.locator("#seed").press("Tab");
  await expect(page.locator("#network")).toContainText("seed 99");
  expect(errors).toEqual([]);
});
test("desktop screenshot and evidence narrative", async ({ page }) => {
  await page.setViewportSize({ width: 1512, height: 1100 });
  await page.goto("/?autoplay=0&intro=0");
  for (let i = 0; i < 40; i++)
    await page.getByRole("button", { name: "Step", exact: true }).click();
  await page.locator(".claim-row").nth(12).click();
  await page.screenshot({
    path: "artifacts/discovery-commons-desktop.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("mobile and reduced motion preserve controls without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".intro-film")).toHaveCount(0);
  await expect(page.locator("#tick")).toHaveText("Tick 000");
  await page
    .getByRole("button", { name: "Play simulation", exact: true })
    .click();
  await expect(page.locator(".flow-path").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  for (let i = 0; i < 12; i++)
    await page.getByRole("button", { name: "Step", exact: true }).click();
  await page.screenshot({
    path: "artifacts/discovery-commons-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator("#policy").focus();
  await expect(page.locator("#policy")).toBeFocused();
});
test("visitors see it run: intro, autoplay, celebrations and URL flags", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".intro-film")).toHaveCount(1);
  await expect(page.locator(".intro-film")).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator("#run-status")).toHaveText("Running");
  await page.goto("/?autoplay=1&speed=4&intro=0&embed=1&seed=7");
  await expect(page.locator("header")).toBeHidden();
  await expect(page.locator("#speed")).toHaveValue("4");
  await expect(page.locator("#network")).toContainText("seed 7");
  await expect(page.locator("#toast")).toContainText(/held up|Breakthrough/, {
    timeout: 15000,
  });
  await expect(page.locator(".role-total").first()).toContainText("Explorers");
  expect(errors).toEqual([]);
});
