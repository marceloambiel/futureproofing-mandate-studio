import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
for (const width of [1440, 1280, 1201, 1024, 390, 320])
  test(`technology icon cards reflow and remain accessible at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto("/#technology-judgment")
    const section = page.locator("#technology-judgment")
    await expect(section.locator(".tech-card")).toHaveCount(3)
    await expect(section.locator(".tech-card-icon")).toHaveCount(3)
    await expect(section.getByRole("heading", { level: 3 })).toHaveText([
      "Connected workspace",
      "AI-assisted preparation",
      "Human judgment",
    ])
    await expect(
      section.locator(
        ".product-interface,.discussion-doc-editor,[role=dialog],iframe"
      )
    ).toHaveCount(0)
    const lines = await section
      .locator(".tech-card-copy > p")
      .evaluateAll((items) =>
        items.map(
          (el) =>
            el.getBoundingClientRect().height /
            parseFloat(getComputedStyle(el).lineHeight)
        )
      )
    lines.forEach((count) => expect(count).toBeCloseTo(4, 1))
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    const boxes = await section
      .locator(".tech-card")
      .evaluateAll((items) =>
        items.map((item) => item.getBoundingClientRect().toJSON())
      )
    expect(new Set(boxes.map((box) => box.x)).size).toBe(width > 900 ? 3 : 1)
    if (width > 1200) {
      const intro = (await section.locator(".tech-intro").boundingBox())!,
        grid = (await section.locator(".tech-grid").boundingBox())!
      expect(grid.x).toBeGreaterThan(intro.x + intro.width)
      expect(Math.abs(grid.y - intro.y)).toBeLessThan(2)
      const heading = (await section.locator(".tech-intro h2").boundingBox())!
      for (const card of await section.locator(".tech-card").all()) {
        const icon = (await card.locator(".tech-card-icon").boundingBox())!,
          copy = (await card.locator(".tech-card-copy").boundingBox())!
        expect(Math.abs(icon.y - heading.y)).toBeLessThan(2)
        expect(
          Math.abs(copy.y + copy.height - heading.y - heading.height)
        ).toBeLessThan(2)
      }
    }
    const result = await new AxeBuilder({ page })
      .include("#technology-judgment")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(result.violations).toEqual([])
    await section.screenshot({
      path: `/tmp/mandate-technology-icons-${width}.png`,
    })
  })
test("technology icon entry respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/#technology-judgment")
  await expect(page.locator(".tech-card").first()).toHaveCSS(
    "animation-name",
    "none"
  )
})
