import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

for (const width of [1440, 390])
  for (const entry of ["click", "keyboard"] as const)
    test(`demo opens the real full-page workspace via ${entry} at ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto("/#sample-workspace")
      const section = page.locator("#sample-workspace")
      await section.scrollIntoViewIfNeeded()
      await expect(page).toHaveURL(/\/#sample-workspace$/)
      await expect(
        section.locator(".demo-guide-header,.demo-guide-footer")
      ).toHaveCount(0)
      await expect(section.locator(".demo-frame-viewport")).toHaveAttribute(
        "inert",
        ""
      )
      await expect(section.locator(".demo-frame-chrome")).toHaveCount(0)
      await expect(section.locator(".demo-preview-container")).toHaveCSS(
        "padding",
        "32px"
      )
      await expect(section.locator(".demo-preview-container")).toHaveCSS(
        "border-radius",
        "8px"
      )
      const previewBounds = (await section
          .locator(".demo-preview-container")
          .boundingBox())!,
        contentBounds = (await section
          .locator(":scope > .homepage-container")
          .boundingBox())!
      expect(Math.abs(previewBounds.x - contentBounds.x)).toBeLessThan(1)
      expect(Math.abs(previewBounds.width - contentBounds.width)).toBeLessThan(
        1
      )
      expect(
        await section
          .locator(".demo-preview-container")
          .evaluate((el) => getComputedStyle(el, "::before").filter)
      ).toBe("grayscale(1) brightness(0.32)")
      if (width > 800) {
        const bounds = (await section
          .locator(".demo-frame-viewport")
          .boundingBox())!
        expect(bounds.width / bounds.height).toBeCloseTo(213 / 130, 2)
      }
      await expect(section.locator(".demo-frame-viewport")).toHaveCSS(
        "filter",
        "grayscale(1) blur(3px)"
      )
      await expect(section.locator(".demo-start-notice")).toHaveCSS(
        "min-height",
        "52px"
      )
      await expect(section.locator(".demo-start-notice")).toHaveCSS(
        "font-size",
        "16px"
      )
      const start = section.getByRole("link", {
        name: "Start the demo",
        exact: true,
      })
      if (entry === "keyboard") {
        await start.focus()
        await page.keyboard.press("Enter")
      } else await start.click()
      await expect(page).toHaveURL(/\/workspace$/)
      await expect(page.locator(".bento-task-list")).toBeVisible()
      await expect(
        page.locator(
          "iframe,.site-header,.demo-guide-header,.demo-guide-footer"
        )
      ).toHaveCount(0)
      expect(await page.evaluate(() => window.self === window.top)).toBe(true)
      await expect(
        page.getByRole("heading", { name: "Client Brief", exact: true })
      ).toHaveCount(0)
      await page
        .locator(".bento-task-list")
        .getByRole("link", { name: /Northline Integration Search/ })
        .click()
      await expect(page).toHaveURL(/\/workspace\/assignment$/)
      await expect(
        page.getByRole("heading", { name: "Client Brief", exact: true })
      ).toBeVisible()
      await page
        .getByRole("button", { name: "Match candidates to brief", exact: true })
        .click()
      await expect(
        page.getByRole("heading", { name: "Included profiles", exact: true })
      ).toBeVisible({ timeout: 10000 })
      await page.reload()
      await expect(
        page.getByRole("heading", { name: "Included profiles", exact: true })
      ).toBeVisible()
      if (width < 801)
        await page
          .getByRole("button", { name: "Open navigation menu", exact: true })
          .click()
      await page
        .getByRole("link", { name: "Back to website", exact: true })
        .click()
      await expect(page).toHaveURL(/\/$/)
      await expect(page.locator(".mandate-hero")).toBeVisible()
      // Re-entry starts the original assignment again; internal navigation retains progress.
      await page
        .locator("#sample-workspace")
        .getByRole("link", { name: "Start the demo", exact: true })
        .click()
      await page
        .locator(".bento-task-list")
        .getByRole("link", { name: /Northline Integration Search/ })
        .click()
      await expect(
        page.getByRole("button", {
          name: "Match candidates to brief",
          exact: true,
        })
      ).toBeVisible()
      await page
        .getByRole("button", { name: "Match candidates to brief", exact: true })
        .click()
      await expect(
        page.getByRole("heading", { name: "Included profiles", exact: true })
      ).toBeVisible({ timeout: 10000 })
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
      expect(result.violations).toEqual([])
    })

test("demo start pulse respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/#sample-workspace")
  const start = page.locator(".demo-start-notice")
  await expect(start).toBeVisible()
  expect(
    await start.evaluate((el) => getComputedStyle(el, "::after").animationName)
  ).toBe("none")
})

for (const width of [1440, 390])
  test(`demo expansion holds its intermediate size for half a second at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/#sample-workspace")
    await page
      .getByRole("link", { name: "Start the demo", exact: true })
      .click()
    const host = page.locator(".demo-frame-host")
    await expect(page.locator(".workspace-demo")).toHaveAttribute(
      "data-opening",
      "true"
    )
    const sample = async (time: number) =>
      host.evaluate((el, time) => {
        for (const animation of el.getAnimations()) {
          animation.pause()
          animation.currentTime = time
        }
        for (const animation of el
          .querySelector(".demo-frame-viewport")!
          .getAnimations()) {
          animation.pause()
          animation.currentTime = time
        }
        const rect = el.getBoundingClientRect()
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          filter: getComputedStyle(el.querySelector(".demo-frame-viewport")!)
            .filter,
        }
      }, time)
    const background = page.locator(".demo-expanding-background")
    await background.evaluate((el) => {
      const animation = el.getAnimations()[0]
      animation.pause()
      animation.currentTime = 700
    })
    const backgroundBounds = (await background.boundingBox())!
    expect(backgroundBounds.x).toBeCloseTo(0)
    expect(backgroundBounds.y).toBeCloseTo(0)
    expect(backgroundBounds.width).toBeCloseTo(width)
    expect(backgroundBounds.height).toBeCloseTo(900)
    const first = await sample(700),
      held = await sample(1200)
    for (const key of ["x", "y", "width", "height"] as const)
      expect(held[key]).toBeCloseTo(first[key], 2)
    expect(held.filter).toBe(first.filter)
    expect(first.filter).toBe("grayscale(0.8) blur(2px)")
    const full = await sample(2000)
    expect(full.x).toBeCloseTo(0)
    expect(full.y).toBeCloseTo(0)
    expect(full.width).toBeCloseTo(width)
    expect(full.height).toBeCloseTo(900)
    expect(full.filter).toBe("grayscale(0) blur(0px)")
    await page.keyboard.press("Escape")
    await expect(page.locator(".workspace-demo")).not.toHaveAttribute(
      "data-opening",
      "true"
    )
    await expect(
      page.getByRole("link", { name: "Start the demo", exact: true })
    ).toBeFocused()
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
      "hidden"
    )
  })
