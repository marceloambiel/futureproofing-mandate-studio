import { test, expect, type Page, type Locator } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

async function noPageOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
  ).toBe(true)
}

async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 70; i++) {
    await page.keyboard.press("Tab")
    if (await target.evaluate((el) => el === document.activeElement)) return
  }
  throw new Error(
    `Keyboard could not reach ${(await target.getAttribute("aria-label")) ?? (await target.innerText())}`
  )
}

for (const width of [320, 390, 768, 1440]) {
  test(`E07 app and homepage adapt without page overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const route of [
      "/",
      "/workspace/assignment",
      "/workspace/candidates",
      "/workspace/discussion",
    ]) {
      await page.goto(route)
      await expect(page.getByRole("main")).toBeVisible()
      await noPageOverflow(page)
      await page.screenshot({
        path: test
          .info()
          .outputPath(`${route.replaceAll("/", "-") || "home"}-${width}.png`),
        fullPage: true,
      })
    }
  })
}

test("E08 full mobile journey includes evidence, restore and save error recovery", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page
    .getByRole("link", { name: "Open sample workspace", exact: true })
    .first()
    .click()
  await page.getByRole("link", { name: "Open assignment", exact: true }).click()
  await page
    .getByRole("link", { name: "Compare candidates", exact: true })
    .click()
  await page
    .getByRole("button", { name: "View evidence for Candidate C", exact: true })
    .click()
  await expect(
    page.getByRole("dialog", { name: "Candidate C", exact: true })
  ).toBeVisible()
  await noPageOverflow(page)
  await page.keyboard.press("Escape")
  await page
    .getByRole("link", { name: "Prepare discussion brief", exact: true })
    .click()
  await page
    .getByRole("button", { name: "Compare versions", exact: true })
    .click()
  await noPageOverflow(page)
  await page
    .getByRole("button", {
      name: "Restore this mandate section as draft",
      exact: true,
    })
    .click()
  await page
    .getByRole("button", { name: "Restore as draft", exact: true })
    .click()
  await page
    .getByRole("button", { name: "Update to revised mandate", exact: true })
    .click()
  await page.getByRole("button", { name: "Save changes", exact: true }).click()
  await page
    .getByRole("button", { name: "Mark ready for review", exact: true })
    .click()
  await expect(
    page.getByText("Ready for review", { exact: true }).first()
  ).toBeVisible()
  await page.goto("/workspace/discussion?scenario=save-failure")
  await page
    .getByRole("button", { name: "Edit discussion brief", exact: true })
    .click()
  await page
    .getByLabel("Next questions", { exact: true })
    .fill(
      "What integration work did Candidate C personally lead, and is an earlier start possible?"
    )
  await page.getByRole("button", { name: "Save changes", exact: true }).click()
  await expect(page.getByRole("alert")).toBeVisible()
  await page.getByRole("button", { name: "Retry save", exact: true }).click()
  await page
    .getByRole("button", { name: "Mark ready for review", exact: true })
    .click()
  await expect(
    page.getByText("Ready for review", { exact: true }).first()
  ).toBeVisible()
  await noPageOverflow(page)
})

test("E09 keyboard-only journey and overlay focus work", async ({ page }) => {
  await page.goto("/")
  await tabTo(
    page,
    page
      .getByRole("link", { name: "Open sample workspace", exact: true })
      .first()
  )
  await page.keyboard.press("Enter")
  await tabTo(
    page,
    page.getByRole("link", { name: "Open assignment", exact: true })
  )
  await page.keyboard.press("Enter")
  await tabTo(
    page,
    page.getByRole("link", { name: "Compare candidates", exact: true })
  )
  await page.keyboard.press("Enter")
  const trigger = page.getByRole("button", {
    name: "View evidence for Candidate A",
    exact: true,
  })
  await tabTo(page, trigger)
  await page.keyboard.press("Enter")
  const dialog = page.getByRole("dialog", { name: "Candidate A", exact: true })
  await expect(dialog).toBeVisible()
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab")
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement))
    ).toBe(true)
  }
  await page.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
  await tabTo(
    page,
    page.getByRole("link", { name: "Prepare discussion brief", exact: true })
  )
  await page.keyboard.press("Enter")
  await tabTo(
    page,
    page.getByRole("button", { name: "Mark ready for review", exact: true })
  )
  await page.keyboard.press("Enter")
  await expect(
    page.getByText("Ready for review", { exact: true }).first()
  ).toBeVisible()
})

test("E09 axe checks main views and working overlays without blanket exclusions", async ({
  page,
}) => {
  const reports: unknown[] = []
  async function scan(label: string) {
    const results = await new AxeBuilder({ page }).analyze()
    reports.push({ label, violations: results.violations })
    await test
      .info()
      .attach(
        `axe-${label.replaceAll("/", "-").replaceAll(" ", "-") || "home"}`,
        {
          body: JSON.stringify(results.violations, null, 2),
          contentType: "application/json",
        }
      )
    expect(
      results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      ),
      label
    ).toEqual([])
  }
  for (const route of [
    "/",
    "/workspace/assignment",
    "/workspace/candidates",
    "/workspace/discussion",
    "/process",
    "/prototype-notes",
  ]) {
    await page.goto(route)
    await scan(route)
  }
  await page.goto("/workspace/candidates")
  await page
    .getByRole("button", { name: "View evidence for Candidate A", exact: true })
    .click()
  await scan("candidate evidence")
  await page.keyboard.press("Escape")
  await page.goto("/workspace/discussion")
  await page
    .getByRole("button", { name: "Edit discussion brief", exact: true })
    .click()
  await scan("discussion editor")
  await page.keyboard.press("Escape")
  await page
    .getByRole("button", { name: "Compare versions", exact: true })
    .click()
  await scan("version comparison")
  await page
    .getByRole("button", {
      name: "Restore this mandate section as draft",
      exact: true,
    })
    .click()
  await scan("restore confirmation")
  await test.info().attach("axe-reports", {
    body: JSON.stringify(reports, null, 2),
    contentType: "application/json",
  })
})

test("E09 reflow at 200% equivalent 720px content viewport retains controls", async ({
  page,
}) => {
  // 1440px desktop at 200% zoom produces a 720 CSS-pixel layout viewport.
  await page.setViewportSize({ width: 720, height: 450 })
  for (const route of ["/", "/workspace/candidates", "/workspace/discussion"]) {
    await page.goto(route)
    await noPageOverflow(page)
  }
  await page
    .getByRole("button", { name: "Edit discussion brief", exact: true })
    .click()
  await page
    .getByLabel("Meeting opening", { exact: true })
    .fill("Integration discussion at enlarged text layout.")
  await page.getByRole("button", { name: "Save changes", exact: true }).click()
  await page
    .getByRole("button", { name: "Mark ready for review", exact: true })
    .click()
  await expect(
    page.getByText("Ready for review", { exact: true }).first()
  ).toBeVisible()
})

test("E10 reduced motion and repeated overlay reversals keep function and focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/workspace/candidates")
  const trigger = page.getByRole("button", {
    name: "View evidence for Candidate B",
    exact: true,
  })
  for (let i = 0; i < 4; i++) {
    await trigger.click()
    const dialog = page.getByRole("dialog", {
      name: "Candidate B",
      exact: true,
    })
    await expect(dialog).toBeVisible()
    expect(
      await dialog.evaluate((el) => {
        const style = getComputedStyle(el)
        return (
          (style.animationName === "none" ||
            style.animationDuration
              .split(",")
              .every((value) => parseFloat(value) <= 0.001)) &&
          style.transitionDuration
            .split(",")
            .every((value) => parseFloat(value) <= 0.001)
        )
      })
    ).toBe(true)
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  }
  await expect(page.getByRole("dialog")).toHaveCount(0)
})

test("E10 touch-only controls work without hover", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  await page.goto("/workspace/candidates")
  expect(
    await page.evaluate(() => matchMedia("(pointer: coarse)").matches)
  ).toBe(true)
  await page
    .getByRole("button", { name: "View evidence for Candidate A", exact: true })
    .tap()
  await expect(
    page.getByRole("dialog", { name: "Candidate A", exact: true })
  ).toBeVisible()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .tap()
  await page
    .getByRole("link", { name: "Prepare discussion brief", exact: true })
    .tap()
  await page
    .getByRole("button", { name: "Mark ready for review", exact: true })
    .tap()
  await expect(
    page.getByText("Ready for review", { exact: true }).first()
  ).toBeVisible()
  await context.close()
})

test("E11 visual process and honest reviewer notes are available", async ({
  page,
}) => {
  await page.goto("/process")
  await expect(page.getByRole("main")).toBeVisible()
  await expect(page.getByRole("main")).toContainText(/integration/i)
  await expect(page.getByRole("main")).toContainText(/proposed|proposal/i)
  await expect(page.getByRole("main")).toContainText(/AI|agent/i)
  await expect(page.getByRole("main")).toContainText(
    /not yet performed|not.*performed|not.*conducted/i
  )
  expect(
    await page.getByRole("main").getByRole("heading", { level: 2 }).count()
  ).toBeGreaterThanOrEqual(6)
  expect(
    await page.getByRole("main").getByRole("img").count()
  ).toBeGreaterThanOrEqual(2)
  await expect(page.getByRole("main")).not.toContainText("/Users/")
  await page.goto("/prototype-notes")
  await expect(page.getByRole("main")).toContainText(
    /no credentials|no login|without.*credentials/i
  )
  await expect(
    page.getByRole("link", { name: "Try save failure", exact: true })
  ).toBeVisible()
})
